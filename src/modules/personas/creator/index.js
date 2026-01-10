import creatorRoutes from './routes/creatorRoutes.js';

export default {
  name: 'creator',
  version: '1.0.0',
  basePath: '/api/personas/creator',
  routes: creatorRoutes,
  persona: 'creator',
  
  initialize: async () => {
    console.log('✓ Creator persona module initialized');
  },
  
  shutdown: async () => {
    console.log('✓ Creator persona module shutdown');
  }
};
