const { Document, Unit } = require('../../../sequelize');
const { generateDocumentID } = require('../../../utils/generateID');
const { cascadeUpdateFromUnit } = require('../../../utils/cascadeUpdate');
const s3Service = require('../../../services/s3.service');

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.txt', '.docx'];

const DocumentController = {
    async uploadDocument(req, res) {
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
                    message: 'Invalid file type. Allowed: .pdf, .doc, .txt, .docx',
                });
            }

            const documentID = generateDocumentID();
            const fileKey = `documents/${unitID}/${documentID}${ext}`;
            const documentName = req.file.originalname;
            const fileType = ext.slice(1);

            const fileUrl = await s3Service.uploadFile(
                req.file.buffer,
                fileKey,
                req.file.mimetype
            );

            const maxOrder = await Document.max('numericalOrder', {
                where: { unitID },
            });
            const numericalOrder = (maxOrder || 0) + 1;

            await Document.create({
                documentID,
                unitID,
                documentName,
                fileKey,
                fileUrl: fileUrl || '',
                fileType,
                numericalOrder,
            });

            await cascadeUpdateFromUnit(unitID);
            return res.status(201).json({ documentID, message: 'Document uploaded successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async deleteDocument(req, res) {
        try {
            const { documentID } = req.params;

            const document = await Document.findByPk(documentID);
            if (!document) return res.status(404).json({ error: 'Document not found' });

            const unitID = document.unitID;
            await s3Service.deleteFile(document.fileKey);
            await document.destroy();
            await cascadeUpdateFromUnit(unitID);

            return res.status(200).json({ message: 'Document deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
};

module.exports = DocumentController;
