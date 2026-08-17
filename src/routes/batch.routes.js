const express = require('express');
const router = express.Router();
const { getBatches, createBatch, updateBatch, deleteBatch } = require('../controllers/batch.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(getBatches)
  .post(createBatch);

router.route('/:id')
  .put(updateBatch)
  .delete(deleteBatch);

module.exports = router;
