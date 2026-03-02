import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from './src/modules/shared/config/database.js';
import config from './src/modules/shared/config/environment.js';
import logger from './src/modules/shared/utils/logger.js';
import routes from './src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.PORT || 3000;

//cors options
const corsOptions = {
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-persona']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize application
const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Connect to database
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully');
    
    // Start server with proper error handling
    console.log('Starting HTTP server...');
    const server = app.listen(PORT, () => {
      console.log('Server started successfully');
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${config.NODE_ENV}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
    });

    // Handle server startup errors (like EADDRINUSE)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Trying to find an available port...');
        
        // Try alternative ports
        const alternativePorts = [3001, 3002, 3003, 8000, 8080];
        tryAlternativePort(0, alternativePorts);
      } else {
        console.error('❌ Server startup error:', error.message);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Received ${signal}, gracefully shutting down...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✓ HTTP server closed');
        
        // Close database connection
        import('./src/modules/shared/config/database.js').then(({ closeDatabase }) => {
          closeDatabase()
            .then(() => {
              console.log('✓ Database connection closed');
              process.exit(0);
            })
            .catch((dbErr) => {
              console.error('❌ Error closing database:', dbErr);
              process.exit(1);
            });
        });
      });
      
      // Force shutdown if graceful shutdown takes too long
      setTimeout(() => {
        console.error('❌ Forced shutdown - graceful shutdown timed out');
        process.exit(1);
      }, 10000);
    };

    // Alternative port finder function
    const tryAlternativePort = (index, ports) => {
      if (index >= ports.length) {
        console.error('❌ No available ports found. Please free up some ports and try again.');
        process.exit(1);
        return;
      }

      const alternativePort = ports[index];
      console.log(`🔄 Trying port ${alternativePort}...`);
      
      const altServer = app.listen(alternativePort, () => {
        console.log('Server started successfully');
        console.log(`✓ Server is running on port ${alternativePort}`);
        console.log(`✓ Environment: ${config.NODE_ENV}`);
        console.log(`✓ Health check: http://localhost:${alternativePort}/health`);
        console.log(`✓ API endpoint: http://localhost:${alternativePort}/api`);
        
        // Setup graceful shutdown for alternative server too
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      });

      altServer.on('error', (altError) => {
        if (altError.code === 'EADDRINUSE') {
          console.log(`❌ Port ${alternativePort} is also in use`);
          tryAlternativePort(index + 1, ports);
        } else {
          console.error('❌ Server startup error:', altError.message);
          process.exit(1);
        }
      });
    };

    // Setup graceful shutdown handlers
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

startServer();