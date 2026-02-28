const jwt = require('jsonwebtoken');

// Authenticate user token
const authenticate = (req, res, next) => {
  // Get token from Authorization header
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Authorization header missing' });

  // Check if header is in Bearer token format
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};

module.exports = authenticate;
