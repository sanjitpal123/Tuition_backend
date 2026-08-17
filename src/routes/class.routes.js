const express = require('express');
const router = express.Router();
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/class.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(createClass);

router.route('/:id')
  .put(updateClass)
  .delete(deleteClass);

module.exports = router;
