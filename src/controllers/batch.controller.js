import * as batchService from '../services/batch.service.js';

/**
 * @desc    Get all batches for the logged-in tutor
 * @route   GET /api/batches
 * @access  Private
 */
export const getBatches = async (req, res) => {
  try {
    const batches = await batchService.getAllBatchesForTutor(req.tutor._id);
    return res.status(200).json(batches);
  } catch (error) {
    console.error('Error in getBatches:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Create a new batch
 * @route   POST /api/batches
 * @access  Private
 */
export const createBatch = async (req, res) => {
  try {
    const batch = await batchService.createNewBatch(req.tutor._id, req.body);
    return res.status(201).json(batch);
  } catch (error) {
    console.error('Error in createBatch:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Update a batch
 * @route   PUT /api/batches/:id
 * @access  Private
 */
export const updateBatch = async (req, res) => {
  try {
    const batch = await batchService.updateExistingBatch(req.params.id, req.tutor._id, req.body);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found or unauthorized' });
    }
    return res.status(200).json(batch);
  } catch (error) {
    console.error('Error in updateBatch:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/**
 * @desc    Delete a batch
 * @route   DELETE /api/batches/:id
 * @access  Private
 */
export const deleteBatch = async (req, res) => {
  try {
    const batch = await batchService.deleteExistingBatch(req.params.id, req.tutor._id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found or unauthorized' });
    }
    return res.status(200).json({ message: 'Batch removed successfully' });
  } catch (error) {
    console.error('Error in deleteBatch:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
