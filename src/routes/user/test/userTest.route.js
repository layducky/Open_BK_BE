const express = require('express')
const router = express.Router()
const UserTestController = require('../../../controllers/users/test/userTest.controller');

router.get('/:testID', UserTestController.getByID);

module.exports = router;