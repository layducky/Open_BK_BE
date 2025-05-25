const express = require('express')
const router = express.Router()

const {uploadQuestion, readQuestion, deleteQuestion} = require('../../../controllers/contribute_question/contQuestion.controller')

router.post('/', async (req, res) => {
   try{
     await uploadQuestion
   }catch(err){
      console.error(err);
      res.status(500).json({ message: 'An error occurred while uploading the file' })
   }
});

router.get('/', async (req, res) => {
   try{
      await readQuestion
   }catch(err){
      console.error(err);
      res.status(500).json({ message: 'An error occurred while reading contribute questions' })
   }
});

router.delete('/:id', async(req, res) => {
   try{
      await deleteQuestion
   } catch(err){
      console.error(err);
      res.status(500).json({ message: 'An error occurred deleting contribute quesstion' })
   }
})

module.exports = router