const express = require('express');
const router = express.Router();
const { getActivities, createActivity } = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(getActivities)
  .post(createActivity);

module.exports = router;
