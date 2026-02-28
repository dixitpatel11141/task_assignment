const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Attachments = require('../models/attachments');

// Register new User
const upload = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // Get fields from request body
        const { name, email, password, role, is_active } = req.body;

        // Check if email already exists for another User
        const existing = await Attachments.findOne({ where: { email } });
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
        const user = await Attachments.create(payload);
        res.status(201).json({ message: 'User is registered successfully', user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        next(err);
    }
};

module.exports = { upload };
