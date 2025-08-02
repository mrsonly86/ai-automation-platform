import { Router } from 'express';

const router = Router();

// Get all projects
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get projects not implemented yet' });
});

// Create new project
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create project not implemented yet' });
});

// Get project by ID
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Get project by ID not implemented yet' });
});

// Update project
router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Update project not implemented yet' });
});

// Delete project
router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Delete project not implemented yet' });
});

export default router;