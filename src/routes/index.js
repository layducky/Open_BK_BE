const express = require('express');
const authRoutes = require('./auth/auth.route');
const courseRoutes = require('./course');
const userRoutes = require('./user');
const router = express.Router();

router.use('/auth', authRoutes)
router.use('/course', courseRoutes);
router.use('/user', userRoutes)

module.exports = router;
