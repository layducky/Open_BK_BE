const express = require('express')
const router = express.Router()
const SubmitController = require('../../controllers/test/submit.controller');

router.post('/:testID/submit', SubmitController.createSubmit);

module.exports = router