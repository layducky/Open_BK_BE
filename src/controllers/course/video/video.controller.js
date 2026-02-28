const { Video, Unit } = require('../../../sequelize');
const { generateVideoID } = require('../../../utils/generateID');
const { cascadeUpdateFromUnit } = require('../../../utils/cascadeUpdate');
const s3Service = require('../../../services/s3.service');

const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];

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
