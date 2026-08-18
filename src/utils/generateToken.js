import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a tutor
 * @param {string} id - The tutor's MongoDB ObjectId
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
