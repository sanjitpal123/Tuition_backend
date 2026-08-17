const express = require('express');
const router = express.Router();
const { registerTutor, loginTutor, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerTutor);
router.post('/login', loginTutor);
router.get('/me', protect, getMe);

module.exports = router;
