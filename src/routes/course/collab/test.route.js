const express = require('express');
const TestController = require('../../../controllers/course/test/test.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.use(verifyJWT(["LEARNER", "COLLAB", "ADMIN"]))
router.post(`/:unitID`, TestController.createTest);
router.get(`/:testID`, TestController.getTestByID);
router.get(`/all/:unitID`, TestController.getAllTests);
router.put(`/:testID`, TestController.updateTest);
router.delete(`/:testID`, TestController.deleteTest);

module.exports = router;