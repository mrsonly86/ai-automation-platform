import { Router } from 'express';

const router = Router();

// Get all integrations
router.get('/', (req, res) => {
  const integrations = [
    { id: '1', name: 'Vercel', type: 'VERCEL', isConnected: true, category: 'deployment' },
    { id: '2', name: 'Netlify', type: 'NETLIFY', isConnected: true, category: 'deployment' },
    { id: '3', name: 'GitHub', type: 'GITHUB', isConnected: true, category: 'development' },
    { id: '4', name: 'Docker', type: 'DOCKER', isConnected: true, category: 'development' },
    { id: '5', name: 'Google Cloud', type: 'GOOGLE_CLOUD', isConnected: true, category: 'cloud' },
    { id: '6', name: 'Firebase', type: 'FIREBASE', isConnected: true, category: 'cloud' },
    { id: '7', name: 'Stripe', type: 'STRIPE', isConnected: false, category: 'business' },
    { id: '8', name: 'OpenAI', type: 'OPENAI', isConnected: true, category: 'business' },
  ];

  res.json({
    success: true,
    data: integrations,
    metrics: {
      total: integrations.length,
      connected: integrations.filter(i => i.isConnected).length,
      uptime: '99.9%',
      support: '24/7'
    }
  });
});

// Connect integration
router.post('/:id/connect', (req, res) => {
  res.status(501).json({ message: 'Connect integration not implemented yet' });
});

// Disconnect integration
router.post('/:id/disconnect', (req, res) => {
  res.status(501).json({ message: 'Disconnect integration not implemented yet' });
});

export default router;