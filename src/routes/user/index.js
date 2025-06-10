const express = require('express');
const testRoutes = require('./test');
const userRoutes = require('./user.route');
const router = express.Router();

router.use('/', userRoutes);
router.use('/test', testRoutes);

module.exports = router;
