const multer = require('multer');

const ALLOWED_MIMETYPES = [
    'application/pdf',
    'application/msword',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: .pdf, .doc, .txt, .docx'), false);
    }
};

const uploadDocument = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadDocument;
