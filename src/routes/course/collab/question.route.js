const express = require('express');
const QuestionController = require('../../../controllers/course/test/question.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');


const router = express.Router();

router.use(verifyJWT(["LEARNER", "COLLAB", "ADMIN"]))
router.post(`/:testID`, QuestionController.createQuestion); 
router.get(`/all/:testID`, QuestionController.getAllQuestions); 
router.get(`/id/:questionID`, QuestionController.getQuestionByID);
router.put(`/:questionID`, QuestionController.updateQuestion);
router.delete(`/:questionID`, QuestionController.deleteQuestion); 

module.exports = router;
