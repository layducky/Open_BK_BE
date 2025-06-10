const express = require('express');
const contentRoutes = require('./content')
const collabRoutes = require('./collab');
const publicRoutes = require('./public');
const courseEnrollRoutes = require('./courseEnroll.route')

const router = express.Router();

router.use('/public', publicRoutes);
router.use('/collab', collabRoutes);
router.use('/enroll', courseEnrollRoutes);

module.exports = router;