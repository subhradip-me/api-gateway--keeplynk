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

    // Graceful shutdown - only on explicit termination
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}, gracefully shutting down...`);
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    };
    
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export { connectDatabase };
