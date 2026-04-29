const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect); // All profile routes now require login

router.get('/search', profileController.searchProfiles);
router.get('/export', restrictTo('admin', 'analyst'), profileController.exportProfiles);
router.get('/', profileController.getAllProfiles);

router.route('/:id')
    .get(profileController.getProfile)
    .patch(restrictTo('admin'), profileController.updateProfile)
    .delete(restrictTo('admin'), profileController.deleteProfile);

module.exports = router;