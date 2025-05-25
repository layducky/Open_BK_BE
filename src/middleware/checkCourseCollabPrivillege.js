const checkCollabPrivilige = async(req, res, next) => {
   try {
      const { courseID } = req.params
      collabID = req.user.id
      collab = await courseCollab.findOne({
         where:{
          courseID,
          collabID,
         },
      })
      if(!collab) return res.status(401).json({message: 'Unauthorized'})
      next()
   }catch(err){
      res.status(500).json({ message: 'Failed to access course resourse'});      
   }
}

module.exports = checkCollabPrivilige