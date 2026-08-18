import Batch from '../models/Batch.model.js';
import Student from '../models/Student.model.js';

export const getAllBatchesForTutor = async (tutorId) => {
  const batches = await Batch.find({ tutorId });
  
  // Attach student count to each batch
  const batchesWithCount = await Promise.all(batches.map(async (batch) => {
    const studentsCount = await Student.countDocuments({ batchId: batch._id });
    return { ...batch.toObject(), studentsCount };
  }));

  return batchesWithCount;
};

export const createNewBatch = async (tutorId, batchData) => {
  // Accommodate both old frontend payload and new schema
  const batchClass = batchData.class || batchData.className;
  const batchFees = batchData.fees || (batchData.fee ? String(batchData.fee) : "0");
  const batchSubjects = batchData.subjects || (batchData.subject ? [batchData.subject] : []);

  const batch = await Batch.create({
    tutorId,
    name: batchData.name,
    class: batchClass,
    fees: batchFees,
    subjects: batchSubjects
  });

  return batch;
};

export const updateExistingBatch = async (batchId, tutorId, updateData) => {
  // Map old fields to new schema if present
  if (updateData.fee) updateData.fees = String(updateData.fee);
  if (updateData.subject) updateData.subjects = [updateData.subject];
  
  const batch = await Batch.findOneAndUpdate(
    { _id: batchId, tutorId },
    updateData,
    { new: true }
  );
  return batch;
};

export const deleteExistingBatch = async (batchId, tutorId) => {
  const batch = await Batch.findOneAndDelete({ _id: batchId, tutorId });
  return batch;
};
