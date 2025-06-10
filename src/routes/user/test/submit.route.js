const express = require('express')
const router = express.Router()
const SubmitController = require('../../../controllers/users/test/submit.controller');

router.post('/:testID', SubmitController.createSubmit);
router.put('/:submissionID', SubmitController.updateSubmit);
router.get('/:testID', SubmitController.getAllSubmissionOnTest);
router.delete('/:submissionID', SubmitController.deleteSubmitHistory);

module.exports = router