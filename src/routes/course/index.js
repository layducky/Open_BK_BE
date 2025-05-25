const express = require('express');
const courseRoutes = require('./course.route');
const previewRoutes = require('./preview.route');
const contentRoutes = require('./content')
const courseCollabRoutes = require('./courseCollab.route')
const courseEnrollRoutes = require('./courseEnroll.route')

const router = express.Router();

router.use('/public', courseRoutes);
router.use('/collab', courseCollabRoutes);
router.use('/enroll', courseEnrollRoutes);
router.use('/content', contentRoutes);
router.use('/preview', previewRoutes);

module.exports = router;