const express = require('express');
const DocumentController = require('../../../controllers/course/document/document.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');
const checkCourseAccess = require('../../../middleware/checkCourseAccess');
const uploadDocument = require('../../../middleware/uploadDocument');

const router = express.Router();

const uploadMiddleware = (req, res, next) => {
    uploadDocument.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || 'File upload failed' });
        next();
    });
};

router.use(verifyJWT(['COLLAB', 'ADMIN']));
router.post('/:unitID', checkCourseAccess, uploadMiddleware, DocumentController.uploadDocument);
router.delete('/:documentID', checkCourseAccess, DocumentController.deleteDocument);

module.exports = router;
