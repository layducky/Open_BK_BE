const { Question, Test, Submission, QuesAns } = require('../../../sequelize');
const { filterNull, checkNull } = require('../../../common/ultis');

const SubmitController = {
    async createSubmit(req, res) {
        try {
            const { testID } = req.params;
            const { userID } = req.user;

            const test = await Test.findOne({ where: { testID } });
            if (!test) {
                return res.status(404).json({ message: 'Test not found' });
            }

            const fieldsToCreate = filterNull({
                testID,
                studentID: userID,
            });

            const submit = await Submission.create(fieldsToCreate);
            return res.status(201).json({ submitID: submit.submissionID, message: 'Examination start now!' });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateSubmit (req, res) {
        try{
            const { submissionID } = req.params;
            const { status, submission } = req.body;

            const submissionRecord = await Submission.findByPk(submissionID);
            if (!submissionRecord) {
                return res.status(404).json({ message: 'Submission not found' });
            }
            if (submissionRecord.status === "submitted" || submissionRecord.status === "graded") {
                return res.status(400).json({ message: 'The test is completed and cannot be redone.' });
            }

            if (checkNull(submission)) {
                return res.status(400).json({ message: 'Submit failed, some fields are missing' });
            }
            if (!Array.isArray(submission) || !submission.every(item => item.questionID && item.selectedAns)) {
                return res.status(400).json({ message: 'Invalid submission data' });
            }

            
            const quesAnsPromises = submission.map(async item => {
                const question = await Question.findByPk(item.questionID);
                const isCorrect = question && question.correctAns === item.selectedAns;

                await QuesAns.upsert({
                    submissionID: submissionID,
                    questionID: item.questionID,
                    selectedAns: item.selectedAns,
                    isCorrect: isCorrect ? true : false,
                });

                return isCorrect ? 1 : 0;
            });

            const AnsList = await Promise.all(quesAnsPromises);
            const numRightAns = AnsList.reduce((acc, isCorrect) => acc + isCorrect, 0);
            const totalScore = (numRightAns / submissionRecord.numQuests) * 100;

            if (status === "submitted") {
                const submittedAt = new Date();
                const timeTaken = (submittedAt - submissionRecord.createdAt) / 1000 / 60;

                await submissionRecord.update({ submittedAt, timeTaken, numRightAns, totalScore });
                await submissionRecord.update({ status });
            }

            return res.status(200).json({ message: 'Submission updated successfully!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllSubmissionOnTest (req, res) {
        try {
            const { testID } = req.params;

            const test = await Test.findOne({ where: { testID } });
            if (!test) {
            return res.status(404).json({ message: 'Test not found' });
            }

            const submissions = await Submission.findAll({ where: { testID } });
            if (!submissions.length) {
            return res.status(404).json({ message: 'No submissions found for this test' });
            }

            return res.status(200).json({ submissions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteSubmitHistory  (req, res) {
        try {
            const { submissionID } = req.params;

            const submission = await Submission.findByPk(submissionID);
            if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
            }

            await QuesAns.destroy({ where: { submissionID } });
            await submission.destroy();

            return res.status(200).json({ message: 'Submission history deleted successfully!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SubmitController;