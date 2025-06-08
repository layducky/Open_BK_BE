const express = require('express');
const QuestionController = require('../../../controllers/course/test/question.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.use(verifyJWT(["COLLAB", "ADMIN"]))
router.post(`/:unitID`, QuestionController.createQuestion); 
router.get(`/all/:unitID`, QuestionController.getAllQuestions); 
router.get(`/id/:questionID`, QuestionController.getQuestionByID);
router.put(`/:questionID`, QuestionController.updateQuestion); 
router.delete(`/:questionID`, QuestionController.deleteQuestion); 

module.exports = router;
