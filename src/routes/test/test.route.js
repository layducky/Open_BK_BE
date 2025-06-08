const express = require('express');
const TestController = require('../../controllers/course/test/test.controller');

const router = express.Router();

router.post(`/:unitID`, TestController.createTest);
router.get(`/:testID`, TestController.getTestByID);
router.get(`/:unitID`, TestController.getAllTests);
router.put(`/:testID`, TestController.updateTest);
router.delete(`/:testID`, TestController.deleteTest);

module.exports = router;