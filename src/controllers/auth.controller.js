import Tutor from '../models/Tutor.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerTutor = async (req, res) => {
  try {
    const { name, email, password, tuitionName } = req.body;
    const tutorExists = await Tutor.findOne({ email });
    if (tutorExists) return res.status(400).json({ message: 'Tutor already exists' });

    const tutor = await Tutor.create({ name, email, password, tuitionName });
    if (tutor) {
      res.status(201).json({
        _id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        tuitionName: tutor.tuitionName,
        token: generateToken(tutor.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginTutor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tutor = await Tutor.findOne({ email });
    if (tutor && (await bcrypt.compare(password, tutor.password))) {
      res.json({
        _id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        tuitionName: tutor.tuitionName,
        token: generateToken(tutor.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.tutor);
};
