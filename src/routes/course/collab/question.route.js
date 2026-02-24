const express = require('express');
const QuestionController = require('../../../controllers/course/test/question.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');
const checkCourseAccess = require('../../../middleware/checkCourseAccess');

const router = express.Router();

router.use(verifyJWT(['LEARNER', 'COLLAB', 'ADMIN']));
router.post(`/:testID`, checkCourseAccess, QuestionController.createQuestion);
router.get(`/all/:testID`, checkCourseAccess, QuestionController.getAllQuestions);
router.get(`/id/:questionID`, checkCourseAccess, QuestionController.getQuestionByID);
router.put(`/:questionID`, checkCourseAccess, QuestionController.updateQuestion);
router.delete(`/:questionID`, checkCourseAccess, QuestionController.deleteQuestion); 

module.exports = router;
