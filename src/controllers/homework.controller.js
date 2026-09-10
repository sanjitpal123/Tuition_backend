import Homework from '../models/Homework.model.js';
import Batch from '../models/Batch.model.js';

export const createHomework = async (req, res) => {
  try {
    const { batchId, title, subject, description, dueDate } = req.body;
    
    // Check if batch belongs to tutor
    const batch = await Batch.findOne({ _id: batchId, tutorId: req.user._id });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found or unauthorized' });
    }

    const homeworkData = {
      tutorId: req.user._id,
      batchId,
      title,
      subject,
      description,
      dueDate,
    };

    if (req.file) {
      // Cloudinary returns the full URL in req.file.path
      homeworkData.imageUrl = req.file.path;
    }

    const homework = new Homework(homeworkData);
    await homework.save();

    res.status(201).json(homework);
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ message: 'Server error creating homework' });
  }
};

export const getHomeworks = async (req, res) => {
  try {
    const { batchId } = req.query;
    const query = { tutorId: req.user._id };
    
    if (batchId) {
      query.batchId = batchId;
    }

    const homeworks = await Homework.find(query)
      .populate('batchId', 'name')
      .sort({ createdAt: -1 });
      
    res.json(homeworks);
  } catch (error) {
    console.error('Error fetching homeworks:', error);
    res.status(500).json({ message: 'Server error fetching homeworks' });
  }
};

export const getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findOne({ _id: req.params.id, tutorId: req.user._id })
      .populate('batchId', 'name');
      
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    
    res.json(homework);
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ message: 'Server error fetching homework' });
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findOneAndDelete({ _id: req.params.id, tutorId: req.user._id });
    
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found or unauthorized' });
    }
    
    res.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    console.error('Error deleting homework:', error);
    res.status(500).json({ message: 'Server error deleting homework' });
  }
};
