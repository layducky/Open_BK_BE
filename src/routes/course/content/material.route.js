const express = require('express')
const router = express.Router()
const multer = require('multer');

const {uploadMat, fetchMat, deleteMat} = require('../../../controllers/material/material.controller')

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage });


router.post('/', upload.single('file'), async (req, res) => {
   try{
      uploadMat
   }catch(err){
      console.error(err);
      res.status(500).json({ message: 'An error occurred while uploading the file' })
   }
});

router.get('/:id', async (req, res) => {
   try{
      fetchMat
   }catch(err){
      console.error(err);
      res.status(500).json({ message: 'An error occurred while reading file' })
   }
});

router.delete('/delete/:id', async(req, res) => {
   try{
      deleteMat
   } catch(err){
      console.error(err);
      res.status(500).json({ message: 'An error occurred deleting file' })
   }
})

module.exports = router