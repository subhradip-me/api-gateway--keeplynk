import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/keeplynk',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : (process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
      : '*'),
  
  // Personas
  VALID_PERSONAS: ['genaral', 'student', 'creator', 'professional', 'entrepreneur', 'researcher'],
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
};

export default config;
