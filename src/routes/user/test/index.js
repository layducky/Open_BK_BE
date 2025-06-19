const express = require('express');
const submitRoutes = require('./submit.route');
const userTestRoutes = require('./userTest.route')
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.use(verifyJWT(["LEARNER","COLLAB","ADMIN"]));
router.use('/submit', submitRoutes);
router.use('/', userTestRoutes);

module.exports = router;