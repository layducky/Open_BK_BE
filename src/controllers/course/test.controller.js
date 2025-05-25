const { Test, User, Question, Course } = require('../../sequelize');
const sequelize = require('sequelize');

const TestController = {
    async generateTest(req, res) {
        try {
            const { courseID, numberOfQuestions, timeLimit } = req.query;
            if (isNaN(parseInt(courseID)) || isNaN(parseInt(numberOfQuestions)) || isNaN(parseInt(timeLimit))) {
                return res.status(400).json({ error: 'courseID, numberOfQuestions, and timeLimit must be numbers' });
            }

            const course = await Course.findByPk(courseID);
            if (!course) return res.status(404).json({ error: 'Course not found' });

            const questions = await Question.findAll({
                where: { courseID },
                order: sequelize.random(),
                limit: parseInt(numberOfQuestions)
            });
            if (questions.length < numberOfQuestions) {
                const allQuestions = await Question.findAll({
                    where: { courseID },
                    order: sequelize.random()
                });
                return res.status(200).json({ questions: allQuestions, timeLimit });
            }

            res.status(200).json({ questions, timeLimit });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async saveResults(req, res) {
        try {
            const { userID, courseID } = req.params;
            if (isNaN(parseInt(userID)) || isNaN(parseInt(courseID))) return res.status(400).json({ error: 'userID and courseID must be numbers' });
            const { answers, takenTime, numberOfQuestions } = req.body;

            const questions = await Question.findAll({
                where: { courseID },
                order: sequelize.random(),
                limit: numberOfQuestions
            });

            let correctAnswers = 0;
            questions.forEach((question, index) => {
                if (question.correctAnswer === answers[index]) {
                    correctAnswers++;
                }
            });

            const test = await Test.create({
                userID,
                courseID,
                numberOfQuestions,
                correctAnswers,
                takenTime,
                testTakenDate: new Date()
            });

            res.status(201).json(test);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getTestResults(req, res) {
        try {
            const { userID, courseID } = req.params;
            if (isNaN(parseInt(userID)) || isNaN(parseInt(courseID))) return res.status(400).json({ error: 'userID and courseID must be numbers' });
            const tests = await Test.findAll({
                where: { userID, courseID },
                include: [{ model: Course, as: 'course' }, { model: User, as: 'user' }]
            });
            res.status(200).json(tests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TestController