const express = require('express');
const testRoutes = require('./test.route');
const submitRoutes = require('./submit.route');
const { verifyJWT } = require('../../middleware/verifyJWT');

const router = express.Router();

router.use(verifyJWT(["COLLAB, ADMIN"]));
router.use('/', testRoutes)
router.use('/submit', submitRoutes);

exports = router;