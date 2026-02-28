const multer = require('multer');

const ALLOWED_MIMETYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime', // .mov
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: .mp4, .webm, .ogg, .mov'), false);
    }
};

const uploadVideo = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for video
});

module.exports = uploadVideo;
