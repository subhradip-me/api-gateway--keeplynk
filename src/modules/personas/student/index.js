import studentRoutes from './routes/studentRoutes.js';

export default {
  name: 'student',
  version: '1.0.0',
  basePath: '/api/personas/student',
  routes: studentRoutes,
  persona: 'student',
  
  initialize: async () => {
    console.log('✓ Student persona module initialized');
  },
  
  shutdown: async () => {
    console.log('✓ Student persona module shutdown');
  }
};
