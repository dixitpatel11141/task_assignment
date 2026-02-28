const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/config');

const Attachments = sequelize.define('Attachments', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.BIGINT.UNSIGNED
  },
  filename: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'attachments',
  timestamps: true
});

module.exports = Attachments;
