import { Router } from 'express';
import { getAIAgents, getAIAgentById } from '../controllers/aiAgentsController';

const router = Router();

// Get all AI agents
router.get('/', getAIAgents);

// Get specific AI agent by ID
router.get('/:id', getAIAgentById);

export default router;