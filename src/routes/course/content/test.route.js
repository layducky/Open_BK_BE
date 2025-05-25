const express = require('express');
const TestController = require('../../../controllers/course/test.controller');

const router = express.Router();
const basepath = '/:courseID/test/';

router.get(`${basepath}`, TestController.generateTest);
router.post(`${basepath}:userID`, TestController.saveResults);
router.get(`${basepath}:userID`, TestController.getTestResults);

module.exports = router;