const express = require('express');
const multer = require('multer');
const { asyncHandler } = require('../middleware/errorHandler');
const VoiceCommandService = require('../voice/VoiceCommandService');

const router = express.Router();
let voiceService = null;

// Configure multer for audio file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// Initialize voice service
router.use((req, res, next) => {
    if (!voiceService) {
        voiceService = req.app.locals.voiceService;
    }
    next();
});

/**
 * POST /api/voice/process
 * Process voice command from audio data
 */
router.post('/process', upload.single('audio'), asyncHandler(async (req, res) => {
    if (!voiceService) {
        return res.status(503).json({ error: 'Voice Command Service not available' });
    }
    
    if (!req.file) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Audio file is required'
        });
    }
    
    const audioData = req.file.buffer;
    const result = await voiceService.processCommand(audioData);
    
    res.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/voice/text-process
 * Process voice command from text (for testing)
 */
router.post('/text-process', asyncHandler(async (req, res) => {
    if (!voiceService) {
        return res.status(503).json({ error: 'Voice Command Service not available' });
    }
    
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Text is required'
        });
    }
    
    // Parse Vietnamese command directly
    const command = await voiceService.parseVietnameseCommand(text);
    const entities = await voiceService.extractBusinessEntities(text);
    const actionPlan = await voiceService.generateActionPlan(command, entities);
    
    const result = {
        transcription: text,
        command,
        entities,
        actionPlan,
        confidence: command.confidence,
        timestamp: new Date().toISOString(),
        language: 'vi-VN'
    };
    
    res.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/voice/synthesize
 * Convert text to Vietnamese speech
 */
router.post('/synthesize', asyncHandler(async (req, res) => {
    if (!voiceService) {
        return res.status(503).json({ error: 'Voice Command Service not available' });
    }
    
    const { text, voice = 'vi-VN-Standard-A' } = req.body;
    
    if (!text) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Text is required'
        });
    }
    
    const audioContent = await voiceService.textToSpeech(text, voice);
    
    res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="synthesized-speech.mp3"'
    });
    
    res.send(audioContent);
}));

/**
 * GET /api/voice/commands
 * Get list of available Vietnamese voice commands
 */
router.get('/commands', asyncHandler(async (req, res) => {
    if (!voiceService) {
        return res.status(503).json({ error: 'Voice Command Service not available' });
    }
    
    const commands = Object.entries(voiceService.vietnameseCommands).map(([command, config]) => ({
        command,
        agent: config.agent,
        action: config.action,
        confidence: config.confidence,
        description: voiceService.agents?.[config.agent]?.nameVi || config.agent
    }));
    
    res.json({
        commands,
        total: commands.length,
        language: 'vi-VN',
        accuracy: '95%+',
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/voice/test-accuracy
 * Test voice command accuracy
 */
router.get('/test-accuracy', asyncHandler(async (req, res) => {
    if (!voiceService) {
        return res.status(503).json({ error: 'Voice Command Service not available' });
    }
    
    const testResult = await voiceService.testAccuracy();
    
    res.json({
        testResult,
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/voice/status
 * Get voice service status
 */
router.get('/status', asyncHandler(async (req, res) => {
    res.json({
        available: !!voiceService,
        initialized: voiceService?.isInitialized || false,
        language: 'vi-VN',
        features: {
            speechToText: true,
            textToSpeech: true,
            entityExtraction: true,
            businessContext: true,
            agentRouting: true
        },
        accuracy: '95%+',
        timestamp: new Date().toISOString()
    });
}));

module.exports = router;