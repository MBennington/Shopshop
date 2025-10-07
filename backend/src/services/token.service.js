const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'your_default_jwt_secret_key_change_this_in_production';

/**
 * Generate JSON web token
 * @param id
 * @param email
 * @param role
 * @returns {*}
 */
module.exports.generateJwt = (id, email, role) => jwt.sign(
  {
    id,
    email,
    role,
  },
  secret,
  {
    expiresIn: '7d', // Set token expiration time to 7 days
  },
);

/**
 * Verify JWT
 * @returns {*}
 * @param token
 */
module.exports.verifyJwt = (token) => jwt.verify(token, secret);