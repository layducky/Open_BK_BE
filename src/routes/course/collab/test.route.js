const express = require('express');
const TestController = require('../../../controllers/course/test/test.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');
const checkCourseAccess = require('../../../middleware/checkCourseAccess');

const router = express.Router();

router.use(verifyJWT(['LEARNER', 'COLLAB', 'ADMIN']));
router.post(`/:unitID`, checkCourseAccess, TestController.createTest);
router.get(`/:testID`, checkCourseAccess, TestController.getTestByID);
router.get(`/all/:unitID`, checkCourseAccess, TestController.getAllTests);
router.put(`/:testID`, checkCourseAccess, TestController.updateTest);
router.delete(`/:testID`, checkCourseAccess, TestController.deleteTest);

module.exports = router;