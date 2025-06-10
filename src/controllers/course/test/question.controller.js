const { Test, Question } = require('../../../sequelize');
const { generateQuestionID } = require('../../../utils/generateID');
const {filterNull, checkNull} = require('../../../common/ultis');


const QuestionController = {
    async createQuestion(req, res) {
        try {
            const { testID } = req.params;

            const { numericalOrder, content, explanation, correctAns, ansA, ansB, ansC, ansD } = req.body;
            if(checkNull({ numericalOrder, content, ansA, ansB, ansC, ansD })) return res.status(400).json({message: 'Bad request, some fields are missing'})

            const test = await Test.findByPk(testID);
            if (!test) return res.status(404).json({ error: 'Test not found' });

            const questionID = generateQuestionID(testID);
            const filterCreate = filterNull({ 
                questionID, 
                testID,
                numericalOrder, 
                content, 
                explanation, 
                correctAns, 
                ansA, 
                ansB, 
                ansC, 
                ansD 
            });
            
            await Question.create(filterCreate);
            await Test.increment('numQuests', {where: { testID }});
            res.status(201).json({ questionID, message:'Created question successfully'});

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
  
    async getAllQuestions(req, res) {
        try {
            const { testID } = req.params;
            const test = await Test.findOne({
                where: {
                    testID
                }
            });
            if (!test) return res.status(404).json({ error: 'Test not found' });
            const questions = await Question.findAll(
                { where: { testID } }
            );
            res.status(200).json(questions);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
  
    async getQuestionByID(req, res) {
        try {
            const { questionID } = req.params;
            const question = await Question.findOne({
                where: { questionID },
            });
            if (!question) return res.status(404).json({ error: 'Question not found' });
            res.status(200).json(question);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
  
    async updateQuestion(req, res) {
        try {
            const { questionID } = req.params;
            const { content, explanation, correctAns, ansA, ansB, ansC, ansD } = req.body;
            const params = filterNull({ content, explanation, correctAns, ansA, ansB, ansC, ansD })
            
            const updated = await Question.update(
                params,
                { where: { questionID }, }
            );

            if (!updated[0]) return res.status(404).json({ message: 'Question not found' });
            res.status(200).json({ message: 'Question updated successfully' });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
  
    async deleteQuestion(req, res) {
        try {
            const { questionID } = req.params;

            const question = await Question.findByPk(questionID);
            if (!question) return res.status(404).json({ error: 'Question not found' });

            const test = await Test.findByPk(question.testID);
            if (!test) return res.status(404).json({ error: 'Test not found' });

            await Question.destroy({ where: { questionID } });
            await Test.decrement('numQuests', {where: { testID: question.testID }});
            res.status(200).json({ message: 'Question deleted successfully' });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
  
module.exports = QuestionController;
