const express = require('express')
const router = express.Router()
const SubmitController = require('../../../controllers/users/test/submit.controller');

router.post('/:userTestID', SubmitController.createSubmit);
router.put('/:submissionID', SubmitController.updateSubmit);
router.get('/timing/:submissionID', SubmitController.getSubmissionTiming);
router.get('/review/:submissionID', SubmitController.getSubmissionById);
router.get('/:userTestID', SubmitController.getAllSubmissionOnTest);
router.delete('/:submissionID', SubmitController.deleteSubmitHistory);
router.delete('/all/:userTestID', SubmitController.deleteAllSubmitHistory);

module.exports = router