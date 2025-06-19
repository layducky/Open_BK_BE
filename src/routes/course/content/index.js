const express = require('express');
const commentRoutes = require('./comment.route')
const router = express.Router();

router.use('/comment', commentRoutes);

module.exports = router;