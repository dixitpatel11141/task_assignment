const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/config');

const Tasks = sequelize.define('Tasks', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required.' },
      len: { args: [0, 100], msg: 'Title length can\'t be exceed 100 characters.' }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: { args: [0, 500], msg: 'Description length can\'t be exceed 500 characters.' }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false
  },
  assigned_to: {
    type: DataTypes.STRING(150),
  },
  created_by: {
    type: DataTypes.BIGINT,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    validate: {
      isDate: { msg: 'Invalid date format. Pass in YYYY-MM-DD format.' },
      isFutureDate(value) {
        // Convert the input value and the current date to Date objects for comparison
        const inputDate = new Date(value);
        const now = new Date();

        // Compare the dates. If the input date is not in the future, throw an error.
        // The comparison logic (>= for today or after, > for strictly future) can be adjusted as needed.
        if (inputDate < now) {
          throw new Error('Due date must be in the future.');
        }
      }
    }
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

module.exports = Tasks;
