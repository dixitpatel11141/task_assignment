const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/config');

const Users = sequelize.define('Users', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      is: {
        args: /^[a-zA-Z ]+$/i,
        msg: 'User name must be alphabetic including spaces.'
      },
      notEmpty: { msg: 'User name is required.' }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: "Email is already taken."
    },
    validate: {
      notEmpty: { msg: "Email can't be empty." },
      isEmail: { msg: 'Invalid email' },
      len: { args: [0, 150], msg: 'Email length can\'t be exceed 150 characters' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isStrongPassword(value) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d_])(?=.*[\W_]).{8,}$/;
        if (!regex.test(value)) {
          throw new Error('Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number and 1 symbol.');
        }
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'user'),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  login_attemptes: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = Users;
