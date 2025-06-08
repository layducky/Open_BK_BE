const express = require('express');
const PreviewController = require('../../controllers/course/preview.controller');

const router = express.Router();
const basepath = '/:courseID/preview/';

router.post(`${basepath}`, PreviewController.createPreviewForID); 
router.get(`${basepath}`, PreviewController.getAllPreviews);
router.get(`${basepath}:id`, PreviewController.getPreviewByID); 
router.put(`${basepath}:id`, PreviewController.updatePreview);
router.delete(`${basepath}`, PreviewController.deletePreview); 

module.exports = router;
