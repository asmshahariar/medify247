import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string|ObjectId} id - User/Doctor ID
 * @param {string} role - Optional role (patient, doctor, hospital_admin, super_admin)
 * @returns {string} JWT token
 */
export const generateToken = (id, role = null) => {
  const payload = {
    id: id.toString() // Convert ObjectId to string if needed
  };

  // Add role to payload if provided
  if (role) {
    payload.role = role;
  }

  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d'; // Default 7 days

  return jwt.sign(payload, secret, {
    expiresIn
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  return jwt.verify(token, secret);
};

