const express = require('express');
const questionRoutes = require('./question.route');
const unitRoutes = require('./unit.route');
const conQuestionRoutes = require('./conQuestion.route')
const commentRoutes = require('./comment.route')
const materialRoutes = require('./material.route')
const testRoutes = require('./test.route')
const router = express.Router();

router.use('/question', questionRoutes);
router.use('/unit', unitRoutes);
router.use('/conQuestion', conQuestionRoutes);
router.use('/comment', commentRoutes);
router.use('/material', materialRoutes);
router.use('/test', testRoutes)

module.exports = router;