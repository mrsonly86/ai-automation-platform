import { Router } from 'express';

const router = Router();

// Basic agents route for now - placeholder
router.get('/', (req, res) => {
  res.json({
    message: 'AI Agents Management API',
    availableAgents: [
      { id: 15, name: 'Asset Management', status: 'active' },
      { id: 16, name: 'Building Management', status: 'active' },
      { id: 17, name: 'Fleet Management', status: 'active' },
      { id: 18, name: 'Multi-Company Management', status: 'active' }
    ]
  });
});

export { router as agentRoutes };