import researcherRoutes from './routes/researcherRoutes.js';

export default {
  name: 'researcher',
  version: '1.0.0',
  basePath: '/api/personas/researcher',
  routes: researcherRoutes,
  persona: 'researcher',
  
  initialize: async () => {
    console.log('✓ Researcher persona module initialized');
  },
  
  shutdown: async () => {
    console.log('✓ Researcher persona module shutdown');
  }
};
