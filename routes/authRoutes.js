const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/github', authController.startGitHubLogin);

router.get('/callback', authController.githubCallback);

router.post('/refresh', authController.refreshToken);

module.exports = router;