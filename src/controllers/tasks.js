const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const path = require('node:path');
const Tasks = require('../models/tasks');
const Attachments = require('../models/attachments');
const Users = require('../models/auth');

// Create Task
const create = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Get fields from request body
    const { title, description, status, priority, assigned_to, created_by, due_date } = req.body;

    // Get created by user id
    const createdByUser = await Users.findOne({ where: { email: created_by } });
    if (!createdByUser) {
      return res.status(400).json({ message: 'Created by user is not available.' });
    }

    // Get assigned to user id
    const assignedToUser = await Users.findOne({ where: { email: assigned_to } });
    if (!assignedToUser) {
      return res.status(400).json({ message: 'Assigned to user is not available.' });
    }

    // Create payload for new Task
    const payload = { title, description, status, priority, assigned_to: assignedToUser.id, created_by: createdByUser.id, due_date, is_deleted: false, version: 1 };

    // Create new Task
    const task = await Tasks.create(payload);

    // Get task attachments and save into database
    if (task.id && req.files) {
      // Iterate over the files array and save each one to the database
      const attachmentsPayload = req.files.map(file => ({
        task_id: task.id,
        filename: file.filename
      }));
      await Promise.all(attachmentsPayload.map(record => Attachments.create(record)));
    }

    res.status(201).json({ message: 'Task is created successfully', task: { id: task.id, title: task.title } });
  } catch (err) {
    next(err);
  }
};

// Get Tasks list with pagination and search
const list = async (req, res, next) => {
  try {
    // Query params: page, limit, search
    const page = Math.max(Number.parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Number.parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const where = {};

    // Apply where condition for search on title or description
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Tasks.findAndCountAll({ where, limit, offset, order: [['id', 'DESC']] });
    res.status(200).json({
      meta: { total: count, page, lastPage: Math.ceil(count / limit) },
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

// Get Task by ID
const getById = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Get Task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Requested task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// Update task
const update = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Find task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Get fields from request body
    const { title, description, status, priority, assigned_to, created_by, due_date } = req.body;

    // Get created by user id
    if (created_by) {
      const createdByUser = await Users.findOne({ where: { email: created_by } });
      if (!createdByUser) {
        return res.status(400).json({ message: 'Created by user is not available.' });
      }
      task.created_by = createdByUser.id;
    }

    // Get assigned to user id
    if (assigned_to) {
      const assignedToUser = await Users.findOne({ where: { email: assigned_to } });
      if (!assignedToUser) {
        return res.status(400).json({ message: 'Assigned to user is not available.' });
      }
      task.assigned_to = assignedToUser.id;
    }

    // Update fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = await bcrypt.hash(priority, 10);
    if (due_date) task.due_date = due_date;

    // Update details in database
    await task.save();

    // Get task attachments and save into database
    if (task.id && req.files) {
      // Delete older attachments
      const olderAttachments = await Attachments.findAll({ where: { task_id: task.id } });
      if (olderAttachments) {
        const filePath = `${process.env.UPLOAD_DIR || 'images'}/`;
        const filesToDelete = olderAttachments.map(row => filePath + row.filename);
        const fs = require('node:fs').promises; // Use the promise-based API

        // Wait for all promises to resolve
        await Promise.all(
          filesToDelete.map(file =>
            fs.unlink(file).catch(err => {
              // Log specific file errors but continue with other deletions
              if (err.code !== 'ENOENT') { // If file does not exits
                next(err);
              }
            })
          )
        );

        // Delete older attachments from database
        await Attachments.destroy({ where: { task_id: task.id } });
      }

      // Iterate over the files array and save each one to the database
      const attachmentsPayload = req.files.map(file => ({
        task_id: task.id,
        filename: file.filename
      }));
      await Promise.all(attachmentsPayload.map(record => Attachments.create(record)));
    }

    res.status(200).json({ message: 'Task details updated successfully', task: { id: task.id, title: task.title } });
  } catch (err) {
    next(err);
  }
};

// Delete Task
const deleteTask = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Find task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task is not found for provided id' });
    }

    // Delete task older attachments files
    const olderAttachments = await Attachments.findAll({ where: { task_id: task.id } });
    if (olderAttachments) {
      const filePath = `${process.env.UPLOAD_DIR || 'images'}/`;
      const filesToDelete = olderAttachments.map(row => filePath + row.filename);
      const fs = require('node:fs').promises; // Use the promise-based API

      // Wait for all promises to resolve
      await Promise.all(
        filesToDelete.map(file =>
          fs.unlink(file).catch(err => {
            // Log specific file errors but continue with other deletions
            if (err.code !== 'ENOENT') { // If file does not exits
              next(err);
            }
          })
        )
      );

      // Delete older attachments from database
      await Attachments.destroy({ where: { task_id: task.id } });
    }

    // Delete task from database
    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Assign task to user
const assignTask = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Find task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task is not found for provided id' });
    }

    // Get assigned to user id
    const assignedToUser = await Users.findOne({ where: { email: req.body.assigned_to } });
    if (!assignedToUser) {
      return res.status(400).json({ message: 'Assigned to user is not available.' });
    }

    // Update data into database
    task.assigned_to = assignedToUser.id;
    await task.save();

    res.status(200).json({ message: 'Task assigne successfully updated.', task: { id: task.id, title: task.title, assigned_to: req.body.assigned_to } });
  } catch (err) {
    next(err);
  }
};

// Upload attachments to task
const uploadAttachments = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Find task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task is not found for provided id' });
    }

    // Get task attachments and save into database
    if (task.id && req.files) {
      // Iterate over the files array and save each one to the database
      const attachmentsPayload = req.files.map(file => ({
        task_id: task.id,
        filename: file.filename
      }));
      await Promise.all(attachmentsPayload.map(record => Attachments.create(record)));
    }

    res.status(201).json({ message: 'Task is created successfully', task: { id: task.id, title: task.title } });
  } catch (err) {
    next(err);
  }
};

// Get attachments by task id and attachement id
const getAttachments = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Find task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task is not found for provided id' });
    }

    // Find attachment by task id and file id
    const attachment = await Attachments.findOne({ where: { task_id: id, id: req.params.fileId } });
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment is not found for provided id' });
    }

    // Send attachment file
    res.status(200).sendFile(path.resolve(`${process.env.UPLOAD_DIR || 'images'}/${attachment.filename}`));
  } catch (err) {
    next(err);
  }
};

// Delete attachments by task id and attachement id
const deleteAttachments = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Find task by ID
    const id = req.params.id;
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task is not found for provided id' });
    }

    // Find attachment by task id and file id
    const attachment = await Attachments.findOne({ where: { task_id: id, id: req.params.fileId } });
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment is not found for provided id' });
    }

    // Delete attachment file
    const filePath = `${process.env.UPLOAD_DIR || 'images'}/${attachment.filename}`;
    const fs = require('node:fs').promises; // Use the promise-based API
    await fs.unlink(filePath).catch(err => {
      if (err.code !== 'ENOENT') { // If file does not exits
        next(err);
      }
    });

    // Delete attachment record from database
    await attachment.destroy();
    res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, delete: deleteTask, assign: assignTask, uploadAttachments, getAttachments, deleteAttachments };
