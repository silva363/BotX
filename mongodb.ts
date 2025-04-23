import mongoose from 'mongoose';
import { settings } from './settings';

// MongoDB connection
let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(settings.MONGODB_URI);
    isConnected = !!db.connection.readyState;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectToDatabase;
