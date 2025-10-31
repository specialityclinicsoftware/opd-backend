import mongoose from 'mongoose';
import logger from './logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/med-opd';

    await mongoose.connect(mongoUri);

    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error: any) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
