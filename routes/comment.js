'use strict'

const express = require('express');
const CommentController = require('../controllers/comment');


const router = express.Router();
var md_auth = require('../middleware/authenticated');


router.post('/comment/topic/:topicId',md_auth.authenticated, CommentController.add);
router.put('/commentUpdate/:commentId',md_auth.authenticated, CommentController.update);
router.delete('/deleteComment/:topicId/:commentId',md_auth.authenticated, CommentController.delete);






module.exports = router;
