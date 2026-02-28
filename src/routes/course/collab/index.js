const express = require('express');
const questionRoutes = require('./question.route');
const testRoutes = require('./test.route');
const unitRoutes = require('./unit.route');
const documentRoutes = require('./document.route');
const courseCollabRoutes = require('./courseCollab.route')
const router = express.Router();
const { verifyJWT } = require('../../../middleware/verifyJWT');

router.use('/question', questionRoutes);
router.use('/test', testRoutes);
router.use('/unit', unitRoutes);
router.use('/document', documentRoutes);
router.use('/', courseCollabRoutes);

module.exports = router;