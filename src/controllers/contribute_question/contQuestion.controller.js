const checkNull = require('../../common/ultis')
const { contQuestion } = require('../../sequelize')

//send question
const uploadQuestion = async(req, res) => {
   try {
      const { userID } = req.user.id
      const { content, explanation, courseID, correctAnswer, answerA, answerB, answerC, answerD} = req.body
      if (checkNull({ content, courseID, correctAnswer, answerA, answerB, answerC, answerD})) return res.status(400).json({message: 'Missing parameter'})
      await contQuestion.create({userID, content, explanation, courseID, correctAnswer, answerA, answerB, answerC, answerD})
      return res.status(201).json({message: 'Send contribute question successfully'})
   
   }catch (error) {
      return res.status(500).json({ message: error.message })
   }
}

//read all question from 1 course
const readQuestion = async(req, res) => {
   try {
      const { courseID } = req.params
      const questionList = await contQuestion.findAll({
         where:{
            courseID,
         },
      })
      if(!questionList) return response.status(404).json({message:'No contribute question for this course'})
      return res.status(200).json({message: 'Retrieve contribute questions successfully', questionList: questionList})
   
   }catch (err){
      return res.status(500).json({message: err})
   }
}
//delete question
const deleteQuestion = async(req, res) => {
   try{
      const questionID = req.body
      const deleted = await contQuestion.destroy({where: {questionID},})
      if(!deleted) return res.status(404).json({message: 'Contribute question is not found'})
      return res.status(200).json({message: 'Deleting contribute question successfully'})
   
   }catch(err){
      return res.status(500).json({message: err})
   }
}

module.exports = {uploadQuestion, readQuestion, deleteQuestion}