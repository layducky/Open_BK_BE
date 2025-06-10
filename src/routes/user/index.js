const express = require('express');
const testRoutes = require('./test');
const userRoutes = require('./user.route');
const router = express.Router();

router.use('/test', testRoutes);
router.use('/', userRoutes);

module.exports = router;
