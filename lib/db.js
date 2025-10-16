import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

export const Sender = sequelize.define('Sender', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('connected', 'disconnected', 'connecting'),
    defaultValue: 'disconnected'
  },
  authData: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true
  }
});

export const BugHistory = sequelize.define('BugHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  target: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bugType: {
    type: DataTypes.ENUM('delay', 'blank', 'stuck'),
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('sent', 'failed'),
    defaultValue: 'sent'
  }
});

// Initialize database
export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database connected and synced');
  } catch (error) {
    console.error('Database error:', error);
  }
}
