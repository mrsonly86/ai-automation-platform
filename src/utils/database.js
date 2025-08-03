const mongoose = require('mongoose');
const { logger } = require('./logger');

/**
 * Database connection utility
 */
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-automation-platform';
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        logger.info('Connected to MongoDB successfully', { uri: mongoUri.replace(/\/\/.*@/, '//***@') });
        
        // Handle connection events
        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error', error);
        });
        
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });
        
        return mongoose.connection;
    } catch (error) {
        logger.error('Failed to connect to MongoDB', error);
        
        // In development, continue without database
        if (process.env.NODE_ENV === 'development') {
            logger.warn('Continuing without database in development mode');
            return null;
        }
        
        throw error;
    }
}

/**
 * Gracefully close database connection
 */
async function closeDatabaseConnection() {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
    } catch (error) {
        logger.error('Error closing MongoDB connection', error);
    }
}

module.exports = {
    connectDatabase,
    closeDatabaseConnection,
    mongoose
};