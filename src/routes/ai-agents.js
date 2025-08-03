const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const AIAgentOrchestrator = require('../ai-agents/AIAgentOrchestrator');

const router = express.Router();
let aiOrchestrator = null;

// Initialize orchestrator (will be set by main app)
router.use((req, res, next) => {
    if (!aiOrchestrator) {
        aiOrchestrator = req.app.locals.aiOrchestrator;
    }
    next();
});

/**
 * GET /api/ai-agents
 * Get list of available AI agents
 */
router.get('/', asyncHandler(async (req, res) => {
    if (!aiOrchestrator) {
        return res.status(503).json({ error: 'AI Orchestrator not available' });
    }
    
    const agents = aiOrchestrator.getAvailableAgents();
    res.json({
        agents,
        total: agents.length,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/ai-agents/process
 * Process a request with AI agents
 */
router.post('/process', asyncHandler(async (req, res) => {
    if (!aiOrchestrator) {
        return res.status(503).json({ error: 'AI Orchestrator not available' });
    }
    
    const { message, intent, data, conversationId } = req.body;
    
    if (!message && !intent && !data) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Must provide message, intent, or data'
        });
    }
    
    const request = {
        message,
        intent,
        data,
        conversationId,
        source: 'api',
        timestamp: new Date()
    };
    
    const result = await aiOrchestrator.processRequest(request);
    res.json(result);
}));

/**
 * GET /api/ai-agents/metrics
 * Get agent performance metrics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
    if (!aiOrchestrator) {
        return res.status(503).json({ error: 'AI Orchestrator not available' });
    }
    
    const metrics = aiOrchestrator.getAgentMetrics();
    res.json({
        metrics,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/ai-agents/:agentId/direct
 * Direct communication with specific agent
 */
router.post('/:agentId/direct', asyncHandler(async (req, res) => {
    if (!aiOrchestrator) {
        return res.status(503).json({ error: 'AI Orchestrator not available' });
    }
    
    const { agentId } = req.params;
    const { message, conversationId } = req.body;
    
    if (!message) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Message is required'
        });
    }
    
    const agents = aiOrchestrator.getAvailableAgents();
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Agent ${agentId} not found`
        });
    }
    
    const request = {
        message,
        conversationId,
        source: 'direct-api',
        forcedAgent: agentId,
        timestamp: new Date()
    };
    
    const result = await aiOrchestrator.executeAgent(agent, request);
    res.json(result);
}));

module.exports = router;