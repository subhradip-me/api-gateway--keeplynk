import professionalRoutes from './routes/professionalRoutes.js';

export default {
  name: 'professional',
  version: '1.0.0',
  basePath: '/api/personas/professional',
  routes: professionalRoutes,
  persona: 'professional',
  
  initialize: async () => {
    console.log('✓ Professional persona module initialized');
  },
  
  shutdown: async () => {
    console.log('✓ Professional persona module shutdown');
  }
};
