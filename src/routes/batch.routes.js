import express from 'express';
const router = express.Router();
import { getBatches, createBatch, updateBatch, deleteBatch } from '../controllers/batch.controller.js';
import { protect } from '../middleware/auth.middleware.js';

router.use(protect);

router.route('/')
  .get(getBatches)
  .post(createBatch);

router.post('/update/:id', updateBatch);
router.post('/delete/:id', deleteBatch);

export default router;
