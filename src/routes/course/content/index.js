const express = require('express');
const conQuestionRoutes = require('./conQuestion.route')
const commentRoutes = require('./comment.route')
const materialRoutes = require('./material.route')
const router = express.Router();

router.use('/conQuestion', conQuestionRoutes);
router.use('/comment', commentRoutes);
router.use('/material', materialRoutes);

module.exports = router;