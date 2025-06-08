const express = require('express');
const questionRoutes = require('./question.route');
const unitRoutes = require('./unit.route');
const conQuestionRoutes = require('./conQuestion.route')
const commentRoutes = require('./comment.route')
const materialRoutes = require('./material.route')
const router = express.Router();

router.use('/question', questionRoutes);
router.use('/unit', unitRoutes);
router.use('/conQuestion', conQuestionRoutes);
router.use('/comment', commentRoutes);
router.use('/material', materialRoutes);

module.exports = router;