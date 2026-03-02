import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/urlyn', options);
    
    console.log('✓ MongoDB connected successfully');
    
    // Database event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const closeDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB disconnected');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

export { connectDatabase, closeDatabase };
