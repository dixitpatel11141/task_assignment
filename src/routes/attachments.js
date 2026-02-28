const express = require('express');
const { body } = require('express-validator');
const attachments = require('../controllers/attachments');

const router = express.Router();

// Add User details
router.post('/upload', [
  body('name').trim().notEmpty().withMessage('User name is required.').isAlphanumeric('en-US', { ignore: ' ' }).withMessage('User name must be alphabetic including spaces.'),
  body('email').trim().notEmpty().withMessage('Email can\'t be empty.').isEmail().withMessage('Invalid email'),
  body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d_])(?=.*[\W_]).{8,}$/).withMessage('Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number and 1 symbol.'),
  body('role').isIn(['admin', 'manager', 'user']).withMessage('Invalid role.'),
], attachments.upload);

module.exports = router;
