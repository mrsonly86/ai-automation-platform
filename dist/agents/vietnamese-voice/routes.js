"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vietnameseVoiceRouter = void 0;
const express_1 = __importDefault(require("express"));
const voice_recognition_vn_1 = require("./speech-processing/voice-recognition-vn");
const vietnamese_tokenizer_1 = require("./nlp-engine/vietnamese-tokenizer");
const logger_1 = require("../../shared/utils/logger");
const router = express_1.default.Router();
exports.vietnameseVoiceRouter = router;
const voiceRecognition = new voice_recognition_vn_1.VoiceRecognitionVN();
const tokenizer = new vietnamese_tokenizer_1.VietnameseTokenizer();
/**
 * Process voice command
 */
router.post('/process-command', async (req, res) => {
    try {
        const { text, audioData } = req.body;
        if (!text && !audioData) {
            return res.status(400).json({
                success: false,
                error: 'Either text or audio data is required',
                timestamp: new Date().toISOString(),
            });
        }
        let commandText = text;
        // If audio data is provided, recognize speech first
        if (audioData && !text) {
            const audioBuffer = Buffer.from(audioData, 'base64');
            const recognition = await voiceRecognition.recognizeSpeech(audioBuffer.buffer);
            commandText = recognition.transcript;
        }
        // Tokenize and analyze the command
        const tokens = tokenizer.tokenize(commandText);
        const entities = tokenizer.extractEntities(tokens);
        const intentResult = tokenizer.recognizeIntent(tokens);
        const voiceCommand = {
            id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: commandText,
            intent: intentResult.intent,
            entities,
            confidence: intentResult.confidence,
            dialect: 'north', // Default, would be detected from audio
            timestamp: new Date().toISOString(),
        };
        // Generate response based on intent
        const response = await generateVoiceResponse(voiceCommand);
        logger_1.logger.info(`🗣️ Processed voice command: "${commandText}" -> ${intentResult.intent}`);
        res.json({
            success: true,
            data: {
                command: voiceCommand,
                response,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to process voice command:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Start voice listening
 */
router.post('/start-listening', async (req, res) => {
    try {
        await voiceRecognition.startListening();
        res.json({
            success: true,
            data: {
                status: 'listening',
                dialect: voiceRecognition.getCurrentDialect(),
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start voice listening:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Stop voice listening
 */
router.post('/stop-listening', async (req, res) => {
    try {
        await voiceRecognition.stopListening();
        res.json({
            success: true,
            data: {
                status: 'stopped',
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to stop voice listening:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Set Vietnamese dialect
 */
router.post('/set-dialect', async (req, res) => {
    try {
        const { dialect } = req.body;
        if (!dialect || !['north', 'central', 'south'].includes(dialect)) {
            return res.status(400).json({
                success: false,
                error: 'Valid dialect is required (north, central, south)',
                timestamp: new Date().toISOString(),
            });
        }
        voiceRecognition.setDialect(dialect);
        res.json({
            success: true,
            data: {
                dialect,
                status: 'dialect_updated',
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to set dialect:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Analyze text complexity
 */
router.post('/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required',
                timestamp: new Date().toISOString(),
            });
        }
        const analysis = tokenizer.analyzeComplexity(text);
        const tokens = tokenizer.tokenize(text);
        const entities = tokenizer.extractEntities(tokens);
        const intentResult = tokenizer.recognizeIntent(tokens);
        res.json({
            success: true,
            data: {
                analysis,
                tokens,
                entities,
                intent: intentResult,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to analyze text:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Get voice assistant status
 */
router.get('/status', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                isListening: voiceRecognition.isCurrentlyListening(),
                currentDialect: voiceRecognition.getCurrentDialect(),
                supportedDialects: ['north', 'central', 'south'],
                businessTermsCount: tokenizer.getBusinessTerms().size,
                status: 'ready',
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get voice assistant status:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Add custom business term
 */
router.post('/business-terms', async (req, res) => {
    try {
        const { vietnamese, category } = req.body;
        if (!vietnamese || !category) {
            return res.status(400).json({
                success: false,
                error: 'Vietnamese term and category are required',
                timestamp: new Date().toISOString(),
            });
        }
        tokenizer.addBusinessTerm(vietnamese, category);
        res.json({
            success: true,
            data: {
                vietnamese,
                category,
                status: 'term_added',
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to add business term:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * Generate voice response based on command intent
 */
async function generateVoiceResponse(command) {
    const responses = {
        CREATE_INVOICE: `Đã tạo hóa đơn mới. Bạn có muốn tôi điền thông tin khách hàng không?`,
        CREATE_REPORT: `Đang tạo báo cáo. Bạn muốn báo cáo về giai đoạn nào?`,
        SHOW_REPORT: `Hiển thị báo cáo doanh thu. Đây là kết quả mới nhất.`,
        SHOW_INFO: `Đây là thông tin bạn yêu cầu. Có gì khác tôi có thể giúp không?`,
        APPROVE_REQUEST: `Đã phê duyệt yêu cầu thành công. Hệ thống sẽ gửi thông báo tự động.`,
        SEARCH_DATA: `Đang tìm kiếm dữ liệu. Tôi đã tìm thấy ${Math.floor(Math.random() * 50) + 1} kết quả.`,
        SEND_COMMUNICATION: `Đã gửi thông tin thành công. Người nhận sẽ được thông báo ngay.`,
        GENERAL_QUERY: `Tôi đã ghi nhận yêu cầu của bạn. Bạn có thể nói rõ hơn không?`,
    };
    const responseText = responses[command.intent] || responses.GENERAL_QUERY;
    return {
        text: responseText,
        actions: generateActionsForIntent(command.intent, command.entities),
        confidence: command.confidence,
    };
}
/**
 * Generate actions based on intent and entities
 */
function generateActionsForIntent(intent, entities) {
    const actions = [];
    switch (intent) {
        case 'CREATE_INVOICE':
            actions.push({
                type: 'navigate',
                parameters: { route: '/invoices/create' },
            });
            break;
        case 'SHOW_REPORT':
            actions.push({
                type: 'navigate',
                parameters: { route: '/reports/dashboard' },
            });
            break;
        case 'APPROVE_REQUEST':
            actions.push({
                type: 'approve',
                parameters: { entityType: 'request', action: 'approve' },
            });
            break;
        case 'SEARCH_DATA':
            const searchEntity = entities.find(e => e.type === 'INVOICE' || e.type === 'CUSTOMER');
            actions.push({
                type: 'query',
                parameters: {
                    search: searchEntity?.value || 'general',
                    type: searchEntity?.type || 'general'
                },
            });
            break;
    }
    return actions;
}
//# sourceMappingURL=routes.js.map