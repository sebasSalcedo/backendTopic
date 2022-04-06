'use strict'

const express = require('express');
const TopicController = require('../controllers/topic');


const router = express.Router();
var md_auth = require('../middleware/authenticated');

router.get('/test', TopicController.test);
router.post('/saveTopic',md_auth.authenticated, TopicController.save);
router.get('/getTopics/:page?',md_auth.authenticated, TopicController.getTopics);
router.get('/getUserTopics/:user?',md_auth.authenticated, TopicController.getMyTopicsByUser);
router.get('/getTopic/:id',md_auth.authenticated, TopicController.getTopic);





module.exports = router;


