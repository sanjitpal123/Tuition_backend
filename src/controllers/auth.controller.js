import Tutor from '../models/Tutor.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';


export const registerTutor = async (req, res) => {
  try {
    const { name, email, password, tuitionName } = req.body;

    // Check if tutor already exists
    const tutorExists = await Tutor.findOne({ email });
    if (tutorExists) {
      return res.status(400).json({ message: 'A tutor with this email already exists' });
    }

    // Create the tutor in the database
    const tutor = await Tutor.create({
      name,
      email,
      password,
      tuitionName,
    });

    if (!tutor) {
      return res.status(400).json({ message: 'Invalid user data provided' });
    }

    // Return success response with token
    return res.status(201).json({
      _id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      tuitionName: tutor.tuitionName,
      token: generateToken(tutor.id),
    });
  } catch (error) {
    console.error('Error in registerTutor:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const loginTutor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the tutor by email
    const tutor = await Tutor.findOne({ email });

    // Verify tutor exists and password matches
    if (tutor && (await bcrypt.compare(password, tutor.password))) {
      return res.status(200).json({
        _id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        tuitionName: tutor.tuitionName,
        token: generateToken(tutor.id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in loginTutor:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Please provide email and new password' });
    }

    const tutor = await Tutor.findOne({ email });
    if (!tutor) {
      return res.status(404).json({ message: 'Account not found for this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Use updateOne to bypass pre-save hook and ensure explicit hashing
    await Tutor.updateOne({ email }, { password: hashedPassword });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
