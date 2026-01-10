import entrepreneurRoutes from './routes/entrepreneurRoutes.js';

export default {
  name: 'entrepreneur',
  version: '1.0.0',
  basePath: '/api/personas/entrepreneur',
  routes: entrepreneurRoutes,
  persona: 'entrepreneur',
  
  initialize: async () => {
    console.log('✓ Entrepreneur persona module initialized');
  },
  
  shutdown: async () => {
    console.log('✓ Entrepreneur persona module shutdown');
  }
};
