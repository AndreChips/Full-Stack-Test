import { Sequelize } from 'sequelize'
import db from '../config/Database.js'

const { DataTypes } = Sequelize

const Users = db.define(
  'users',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    refresh_token: {
      type: DataTypes.TEXT
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    signUpTimestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastLogoutTimestamp: {
      type: DataTypes.DATE
    }
  },
  {
    freezeTableName: true
  }
)

export default Users
