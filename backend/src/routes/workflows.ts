import { Router } from 'express';

const router = Router();

// Get all workflows
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get workflows not implemented yet' });
});

// Create workflow
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create workflow not implemented yet' });
});

// Execute workflow
router.post('/:id/execute', (req, res) => {
  res.status(501).json({ message: 'Execute workflow not implemented yet' });
});

export default router;