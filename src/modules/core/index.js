import coreRoutes from './routes/index.js';

export default {
  name: 'core',
  version: '1.0.0',
  basePath: '/api/core',
  routes: coreRoutes,
  
  initialize: async () => {
    console.log('✓ Core module initialized');
  },
  
  shutdown: async () => {
    console.log('✓ Core module shutdown');
  }
};
