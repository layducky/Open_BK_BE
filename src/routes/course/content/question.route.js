const express = require('express');
const QuestionController = require('../../../controllers/course/question.controller');

const router = express.Router();
const basepath = '/';

router.post(`${basepath}:unitID`, QuestionController.createQuestion); 
router.get(`${basepath}all/:unitID`, QuestionController.getAllQuestions); 
router.get(`${basepath}id/:questionID`, QuestionController.getQuestionByID);
router.put(`${basepath}:questionID`, QuestionController.updateQuestion); 
router.delete(`${basepath}:questionID`, QuestionController.deleteQuestion); 

module.exports = router;
