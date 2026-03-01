const express = require('express');
const VideoController = require('../../../controllers/course/video/video.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');
const checkCourseAccess = require('../../../middleware/checkCourseAccess');
const uploadVideo = require('../../../middleware/uploadVideo');

const router = express.Router();

const uploadMiddleware = (req, res, next) => {
    uploadVideo.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || 'File upload failed' });
        next();
    });
};

router.use(verifyJWT(['COLLAB', 'ADMIN']));
router.post('/:unitID/init-upload', checkCourseAccess, VideoController.initMultipartUpload);
router.post('/:unitID/complete-upload', checkCourseAccess, VideoController.completeMultipartUpload);
router.post('/:unitID/abort-upload', checkCourseAccess, VideoController.abortMultipartUpload);
router.post('/:unitID', checkCourseAccess, uploadMiddleware, VideoController.uploadVideo);
router.delete('/:videoID', checkCourseAccess, VideoController.deleteVideo);

module.exports = router;
