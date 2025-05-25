const { Comment } = require('../../sequelize');
// const { param } = require('../../routes/auth.route');

const createComment = async (req, res) => {
  try {
    const { text, userID, parentID } = req.body;
    await Comment.create({ text, userID, parentID });
    res.status(201).json({message: 'Create comment successfully'});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all parent comments
const getComments = async (req, res) => {
  try {
    const { courseID } = req.params 
    const comments = await Comment.findAll({
      where: {
        courseID,
        parentID: null}
    });
    res.status(200).json({'comments': comments});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get children comments
const getSubComments = async (req, res) => {
  try {
    const { courseID } = req.params 
    const parentID = rq.body
    const comments = await Comment.findAll({
      where: {
        courseID,
        parentID
      }
    });
    res.status(200).json({'comments': comments});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { userID } = req.user.id;
    const {commentID, text} = req.body;
    const comment = await Comment.findByPk(id);
    if(comment.userID !== userID) return res.status(401).json({message:'Unauthorized'})
    updated = await Comment.update(
      {text},
      {where: {commentID}},
    )
    if(!updated) return res.status(404).json({message: 'Comment not found'})

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentID } = req.body;
    deleted = await Comment.destroy({
      where:{ commentID },
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComment,
  getComments,
  getSubComments,
  deleteComment,
  updateComment
};
