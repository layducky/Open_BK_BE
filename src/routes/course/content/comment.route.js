const express = require('express');
const router = express.Router();

//!khuc nay de sai
const commentController = require('../../../controllers/comment/comment.controller');

router.post('/comments', async (req, res) => {
  try {
    await commentController.createComment(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/comments', async (req, res) => {
  try {
    await commentController.getComments(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/comments/:id', async (req, res) => {
  try {
    await commentController.updateComment(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    await commentController.deleteComment(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
