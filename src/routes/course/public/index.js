const express = require('express');
const courseRoutes = require('./course.route');

const router = express.Router();

router.use('/', courseRoutes);

module.exports = router;