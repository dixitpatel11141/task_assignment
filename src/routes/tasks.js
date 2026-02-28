const express = require('express');
const { body, param, query } = require('express-validator');
const upload = require('../middlewares/upload');
const tasksController = require('../controllers/tasks');
const authenticate = require('../middlewares/tasks');

const router = express.Router();

router.use(authenticate);

// Create Task
router.post('/', upload.array('attachments'), [
  body('title').trim().notEmpty().withMessage('Title is required 13.').isLength({ max: 100 }).withMessage('Title length can\'t be exceed 100 characters.'),
  body('description').trim().optional().isLength({ max: 500 }).withMessage('Description length can\'t be exceed 500 characters.'),
  body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('assigned_to').trim().notEmpty().withMessage('Assigned to is required.').isEmail().withMessage('Pass valid email to assign.'),
  body('created_by').trim().notEmpty().withMessage('Created by is required.').isEmail().withMessage('Pass valid email.'),
  body('due_date').trim().notEmpty().withMessage('Due date is required.').custom((value, { req }) => {
    if (value != '') {
      const inputDate = new Date(value);
      const now = new Date();

      // Compare the dates. If the input date is not in the future, throw an error.
      // The comparison logic (>= for today or after, > for strictly future) can be adjusted as needed.
      if (inputDate < now) {
        throw new Error('Due date must be in the future. test');
      }
    }
    return true;
  })
], tasksController.create);

// Get Tasks list with pagination and search by title
router.get('/', [
  query('page').optional().toInt(),
  query('limit').optional().toInt(),
  query('search').optional().trim()
], tasksController.list);

// Get Task by ID
router.get('/:id', [
  param('id').isInt().withMessage('Invalid task id')
], tasksController.getById);

// Update Task by ID
router.put('/:id', upload.array('attachments'), [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 100 }).withMessage('Title length can\'t be exceed 100 characters.'),
  body('description').trim().optional().isLength({ max: 500 }).withMessage('Description length can\'t be exceed 500 characters.'),
  body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('assigned_to').trim().notEmpty().withMessage('Assigned to is required.').isEmail().withMessage('Pass valid email to assign.'),
  body('created_by').trim().notEmpty().withMessage('Created by is required.').isEmail().withMessage('Pass valid email.'),
  body('due_date').trim().notEmpty().withMessage('Due date is required.').custom((value, { req }) => {
    if (value != '') {
      const inputDate = new Date(value);
      const now = new Date();

      // Compare the dates. If the input date is not in the future, throw an error.
      // The comparison logic (>= for today or after, > for strictly future) can be adjusted as needed.
      if (inputDate < now) {
        throw new Error('Due date must be in the future. test');
      }
    }
    return true;
  })
], tasksController.update);

// Delete Task by ID
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid task id')
], tasksController.delete);

// Assign task
router.patch('/:id/assign', upload.array('attachments'), [
  param('id').isInt().withMessage('Invalid task id'),
  body('assigned_to').trim().notEmpty().withMessage('Assigned to is required.').isEmail().withMessage('Pass valid email to assign.'),
], tasksController.assign);

// Upload attachments
router.post('/:id/upload', upload.array('attachments'), [
  param('id').isInt().withMessage('Invalid task id')
], tasksController.uploadAttachments);

// Get files by task and file id
router.get('/:id/files/:fileId', [
  param('id').isInt().withMessage('Invalid task id'),
  param('fileId').isInt().withMessage('Invalid file id')
], tasksController.getAttachments);

// Delete file by task and file id
router.delete('/:id/files/:fileId', [
  param('id').isInt().withMessage('Invalid task id'),
  param('fileId').isInt().withMessage('Invalid file id')
], tasksController.deleteAttachments);

module.exports = router;
