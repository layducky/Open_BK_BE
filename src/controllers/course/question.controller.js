const { Unit, Question } = require('../../sequelize');
const { generateQuestionID } = require('../../utils/generateID');
const {filterNull, checkNull} = require('../../common/ultis');


const QuestionController = {
    async createQuestion(req, res) {
        try {
            const { unitID } = req.params;

            const { numericalOrder, content, explanation, correctAnswer, answerA, answerB, answerC, answerD } = req.body;
            if(checkNull({ numericalOrder, content, answerA, answerB, answerC, answerD })) return res.status(400).json({message: 'Bad request, some fields are missing'})

            const unit = await Unit.findByPk(unitID);
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            const questionID = generateQuestionID(unitID);
            const filterCreate = filterNull({ 
                questionID, 
                unitID,
                numericalOrder, 
                content, 
                explanation, 
                correctAnswer, 
                answerA, 
                answerB, 
                answerC, 
                answerD 
            });
            
            await Question.create(filterCreate);
            await Unit.increment('numberOfQuestions', {where: { unitID }});
            res.status(201).json({ questionID, message:'Created question successfully'});

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
  
    async getAllQuestions(req, res) {
        try {
            const { unitID } = req.params;
            const unit = await Unit.findOne({
                where: {
                    unitID
                }
            });
            if (!unit) return res.status(404).json({ error: 'Unit not found' });
            const questions = await Question.findAll(
                { where: { unitID } }
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
            const { content, explanation, correctAnswer, answerA, answerB, answerC, answerD } = req.body;
            const params = filterNull({ content, explanation, correctAnswer, answerA, answerB, answerC, answerD })
            
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

            const unit = await Unit.findByPk(question.unitID);
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            await Question.destroy({ where: { questionID } });
            await Unit.decrement('numberOfQuestions', {where: { unitID: question.unitID }});
            res.status(200).json({ message: 'Question deleted successfully' });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
  
module.exports = QuestionController;
