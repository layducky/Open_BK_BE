const express = require('express');
const courseRoutes = require('./course');
const userRoutes = require('./user/user.route');
const testRoutes = require('./test/test.route');
const router = express.Router();

router.use('/course', courseRoutes);
router.use('/user', userRoutes)
router.use('/test', testRoutes);

module.exports = router;
