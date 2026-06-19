const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGuideProfile, getGuidesByDestination, updateProfile, toggleAvailability } = require('../controllers/guideController');

router.post('/guides', auth, createGuideProfile);
router.get('/guides/destination/:destination', auth, getGuidesByDestination);
router.patch('/guides', auth, updateProfile);
router.post('/guides/toggle-availability', auth, toggleAvailability);

module.exports = router;


