const { Video, Unit } = require('../../../sequelize');
const { generateVideoID } = require('../../../utils/generateID');
const { cascadeUpdateFromUnit } = require('../../../utils/cascadeUpdate');
const s3Service = require('../../../services/s3.service');

const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

const extToMimetype = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime',
};

const VideoController = {
    async uploadVideo(req, res) {
        try {
            const { unitID } = req.params;

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const unit = await Unit.findByPk(unitID);
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            const ext = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf('.'));
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return res.status(400).json({
                    message: 'Invalid file type. Allowed: .mp4, .webm, .ogg, .mov',
                });
            }

            const videoID = generateVideoID();
            const fileKey = `videos/${unitID}/${videoID}${ext}`;
            const videoName = req.file.originalname;
            const fileType = ext.slice(1);

            const fileUrl = await s3Service.uploadFile(
                req.file.buffer,
                fileKey,
                req.file.mimetype
            );

            const maxOrder = await Video.max('numericalOrder', {
                where: { unitID },
            });
            const numericalOrder = (maxOrder || 0) + 1;

            await Video.create({
                videoID,
                unitID,
                videoName,
                fileKey,
                fileUrl: fileUrl || '',
                fileType,
                numericalOrder,
            });

            await cascadeUpdateFromUnit(unitID);
            return res.status(201).json({ videoID, message: 'Video uploaded successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async initMultipartUpload(req, res) {
        try {
            const { unitID } = req.params;
            const { totalParts, fileName, fileSize } = req.body;

            if (!totalParts || totalParts < 1 || totalParts > 10000) {
                return res.status(400).json({ message: 'Invalid totalParts (1-10000)' });
            }
            if (!fileName || typeof fileName !== 'string') {
                return res.status(400).json({ message: 'fileName is required' });
            }
            if (fileSize && fileSize > MAX_VIDEO_SIZE) {
                return res.status(400).json({ message: 'File size exceeds 500MB limit' });
            }

            const unit = await Unit.findByPk(unitID);
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return res.status(400).json({
                    message: 'Invalid file type. Allowed: .mp4, .webm, .ogg, .mov',
                });
            }

            const videoID = generateVideoID();
            const fileKey = `videos/${unitID}/${videoID}${ext}`;
            const mimetype = extToMimetype[ext] || 'video/mp4';

            const { uploadId } = await s3Service.createMultipartUpload(fileKey, mimetype);

            const presignedUrls = [];
            for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
                const url = await s3Service.getPresignedUploadPartUrl(fileKey, uploadId, partNumber);
                presignedUrls.push({ partNumber, url });
            }

            return res.status(200).json({
                uploadId,
                videoID,
                fileKey,
                presignedUrls,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async completeMultipartUpload(req, res) {
        try {
            const { unitID } = req.params;
            const { uploadId, videoID, fileKey, parts, videoName, fileType } = req.body;

            if (!uploadId || !videoID || !fileKey || !parts || !Array.isArray(parts) || parts.length === 0) {
                return res.status(400).json({ message: 'uploadId, videoID, fileKey, and parts[] are required' });
            }
            if (!videoName || typeof videoName !== 'string') {
                return res.status(400).json({ message: 'videoName is required' });
            }

            const unit = await Unit.findByPk(unitID);
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            const sortedParts = parts
                .map((p) => ({ PartNumber: Number(p.partNumber), ETag: String(p.etag) }))
                .sort((a, b) => a.PartNumber - b.PartNumber);

            const fileUrl = await s3Service.completeMultipartUpload(fileKey, uploadId, sortedParts);

            const maxOrder = await Video.max('numericalOrder', { where: { unitID } });
            const numericalOrder = (maxOrder || 0) + 1;

            await Video.create({
                videoID,
                unitID,
                videoName,
                fileKey,
                fileUrl: fileUrl || '',
                fileType: fileType || 'mp4',
                numericalOrder,
            });

            await cascadeUpdateFromUnit(unitID);
            return res.status(201).json({ videoID, message: 'Video uploaded successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async abortMultipartUpload(req, res) {
        try {
            const { uploadId, fileKey } = req.body;
            if (!uploadId || !fileKey) {
                return res.status(400).json({ message: 'uploadId and fileKey are required' });
            }
            await s3Service.abortMultipartUpload(fileKey, uploadId);
            return res.status(200).json({ message: 'Upload aborted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async getDownloadUrl(req, res) {
        try {
            const { videoID } = req.params;
            const video = await Video.findByPk(videoID);
            if (!video) return res.status(404).json({ error: 'Video not found' });

            const presignedUrl = await s3Service.getPresignedDownloadUrl(video.fileKey);
            if (!presignedUrl) {
                return res.status(503).json({ error: 'S3 not configured' });
            }
            return res.redirect(presignedUrl);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async getViewUrl(req, res) {
        try {
            const { videoID } = req.params;
            const video = await Video.findByPk(videoID);
            if (!video) return res.status(404).json({ error: 'Video not found' });

            const presignedUrl = await s3Service.getPresignedDownloadUrl(video.fileKey);
            if (!presignedUrl) {
                return res.status(503).json({ error: 'S3 not configured' });
            }
            return res.json({ url: presignedUrl });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async deleteVideo(req, res) {
        try {
            const { videoID } = req.params;

            const video = await Video.findByPk(videoID);
            if (!video) return res.status(404).json({ error: 'Video not found' });

            const unitID = video.unitID;
            await s3Service.deleteFile(video.fileKey);
            await video.destroy();
            await cascadeUpdateFromUnit(unitID);

            return res.status(200).json({ message: 'Video deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
};

module.exports = VideoController;
