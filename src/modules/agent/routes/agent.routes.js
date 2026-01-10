import express from 'express';
const router = express.Router();

import decideAgentAction from '../services/agentService.js';

router.post('/decide', async (req, res) => {
  try {
    const decision = await decideAgentAction(req.body);
    res.json(decision);
  } catch (error) {
    console.error('Agent error:', error.message);
    res.status(500).json({
      error: 'Agent decision failed'
    });
  }
});

export default router;
