const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/auth');

// Register new User
const register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Get fields from request body
    const { name, email, password, role, is_active } = req.body;

    // Check if email already exists for another User
    const existing = await Users.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use for another User' });
    }

    // Encrypt password using bcrypt
    const hashed = await bcrypt.hash(password, 10);

    // Set default login attemptes
    const loginAttemptes = 0

    // Create payload for new User
    const payload = { name, email, password: hashed, role, is_active, login_attemptes: loginAttemptes };

    // Create new User
    const user = await Users.create(payload);
    res.status(201).json({ message: 'User is registered successfully', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// Login User and return a JWT token
const login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Get fields from request body
    const { email, password } = req.body;

    // Find user by email
    const user = await Users.findOne({ where: { email } });

    // Check if user exists or not
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check user is active or not
    if (!user.is_active) {
        return res.status(400).json({ message: 'User is not active.' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
