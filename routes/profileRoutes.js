const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/search', profileController.searchProfiles);
router.get('/', profileController.getAllProfiles);

router.route('/:id')
    .get(profileController.getProfile)
    .patch(profileController.updateProfile) // Handled properly now
    .delete(profileController.deleteProfile);

module.exports = router;