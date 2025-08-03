const OpenAI = require('openai');
const { logger } = require('../utils/logger');

/**
 * AI Agent Orchestrator - Điều phối 18 AI agents chuyên biệt
 * Manages 18 specialized AI agents for Vietnamese business automation
 */
class AIAgentOrchestrator {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.isInitialized = false;
        
        // Define 18 specialized AI agents for Vietnamese business
        this.agents = {
            // Core Business Agents
            'e-invoice': {
                name: 'E-Invoice Agent',
                nameVi: 'Đại lý Hóa đơn điện tử',
                specialty: 'Vietnamese e-invoice generation and compliance',
                prompt: 'You are an expert in Vietnamese e-invoice regulations and XML generation per Thông tư 32/2025/TT-BTC',
                tools: ['xml-generation', 'vat-calculation', 'compliance-check'],
                priority: 'high'
            },
            'bhxh': {
                name: 'BHXH Agent',
                nameVi: 'Đại lý Bảo hiểm xã hội',
                specialty: 'Vietnamese social insurance calculations and submissions',
                prompt: 'You specialize in Vietnamese BHXH calculations per Luật BHXH 2024 and national system integration',
                tools: ['bhxh-calculation', 'api-integration', 'report-generation'],
                priority: 'high'
            },
            'compliance': {
                name: 'Compliance Agent',
                nameVi: 'Đại lý Tuân thủ',
                specialty: 'Vietnamese regulatory compliance and audit trails',
                prompt: 'You ensure compliance with Vietnamese Enterprise Law 2025 and all regulatory requirements',
                tools: ['compliance-check', 'audit-trail', 'regulation-updates'],
                priority: 'high'
            },
            'crm': {
                name: 'CRM Agent',
                nameVi: 'Đại lý Quản lý khách hàng',
                specialty: 'Customer relationship management for Vietnamese market',
                prompt: 'You manage customer relationships with Vietnamese business culture and practices',
                tools: ['customer-analysis', 'relationship-tracking', 'communication'],
                priority: 'medium'
            },
            'sales-tracking': {
                name: 'Sales Tracking Agent',
                nameVi: 'Đại lý Theo dõi bán hàng',
                specialty: 'Sales performance monitoring and Vietnamese market analysis',
                prompt: 'You track sales performance and analyze Vietnamese market trends',
                tools: ['sales-analytics', 'performance-tracking', 'market-analysis'],
                priority: 'medium'
            },

            // Financial & Accounting Agents
            'tax-calculator': {
                name: 'Tax Calculator Agent',
                nameVi: 'Đại lý Tính thuế',
                specialty: 'Vietnamese tax calculations and VAT processing',
                prompt: 'You calculate Vietnamese taxes including VAT, corporate tax, and personal income tax',
                tools: ['tax-calculation', 'vat-processing', 'tax-optimization'],
                priority: 'high'
            },
            'financial-analysis': {
                name: 'Financial Analysis Agent',
                nameVi: 'Đại lý Phân tích tài chính',
                specialty: 'Financial analysis and Vietnamese accounting standards',
                prompt: 'You analyze financial data according to Vietnamese accounting standards',
                tools: ['financial-modeling', 'vas-compliance', 'profitability-analysis'],
                priority: 'medium'
            },
            'payroll': {
                name: 'Payroll Agent',
                nameVi: 'Đại lý Tính lương',
                specialty: 'Vietnamese payroll processing and labor law compliance',
                prompt: 'You process payroll according to Vietnamese labor law and tax regulations',
                tools: ['salary-calculation', 'labor-law-compliance', 'benefit-processing'],
                priority: 'medium'
            },

            // Operations & Workflow Agents
            'workflow': {
                name: 'Workflow Automation Agent',
                nameVi: 'Đại lý Tự động hóa quy trình',
                specialty: 'Business process automation for Vietnamese enterprises',
                prompt: 'You design and automate business workflows for Vietnamese companies',
                tools: ['process-automation', 'workflow-design', 'efficiency-optimization'],
                priority: 'medium'
            },
            'hr-management': {
                name: 'HR Management Agent',
                nameVi: 'Đại lý Quản lý nhân sự',
                specialty: 'Human resources management with Vietnamese labor laws',
                prompt: 'You manage HR processes according to Vietnamese labor regulations',
                tools: ['employee-management', 'labor-law-compliance', 'performance-evaluation'],
                priority: 'medium'
            },
            'inventory': {
                name: 'Inventory Management Agent',
                nameVi: 'Đại lý Quản lý kho',
                specialty: 'Inventory tracking and Vietnamese supply chain management',
                prompt: 'You manage inventory and supply chains for Vietnamese businesses',
                tools: ['inventory-tracking', 'supply-chain-optimization', 'demand-forecasting'],
                priority: 'medium'
            },

            // Analytics & Reporting Agents
            'reporting': {
                name: 'Reporting Agent',
                nameVi: 'Đại lý Báo cáo',
                specialty: 'Vietnamese business reporting and data visualization',
                prompt: 'You generate comprehensive reports for Vietnamese business requirements',
                tools: ['report-generation', 'data-visualization', 'regulatory-reporting'],
                priority: 'medium'
            },
            'analytics': {
                name: 'Analytics Agent',
                nameVi: 'Đại lý Phân tích dữ liệu',
                specialty: 'Business intelligence and Vietnamese market analytics',
                prompt: 'You analyze business data and provide insights for Vietnamese market',
                tools: ['data-analysis', 'business-intelligence', 'market-insights'],
                priority: 'medium'
            },
            'forecasting': {
                name: 'Forecasting Agent',
                nameVi: 'Đại lý Dự báo',
                specialty: 'Business forecasting and Vietnamese economic trend analysis',
                prompt: 'You forecast business trends and Vietnamese economic indicators',
                tools: ['trend-analysis', 'economic-forecasting', 'risk-assessment'],
                priority: 'low'
            },

            // Marketing & Sales Agents
            'marketing': {
                name: 'Marketing Agent',
                nameVi: 'Đại lý Marketing',
                specialty: 'Vietnamese digital marketing and customer acquisition',
                prompt: 'You create marketing campaigns optimized for Vietnamese consumers',
                tools: ['campaign-creation', 'market-research', 'customer-targeting'],
                priority: 'medium'
            },
            'pricing': {
                name: 'Pricing Agent',
                nameVi: 'Đại lý Định giá',
                specialty: 'Dynamic pricing for Vietnamese market conditions',
                prompt: 'You optimize pricing strategies for Vietnamese market dynamics',
                tools: ['price-optimization', 'market-analysis', 'competitor-analysis'],
                priority: 'medium'
            },
            'customer-service': {
                name: 'Customer Service Agent',
                nameVi: 'Đại lý Chăm sóc khách hàng',
                specialty: 'Vietnamese customer service and support automation',
                prompt: 'You provide customer service in Vietnamese language and culture',
                tools: ['customer-support', 'issue-resolution', 'service-automation'],
                priority: 'medium'
            },

            // Utility & Support Agents
            'document-processing': {
                name: 'Document Processing Agent',
                nameVi: 'Đại lý Xử lý tài liệu',
                specialty: 'Vietnamese document processing and digitization',
                prompt: 'You process Vietnamese business documents and forms',
                tools: ['document-ocr', 'form-processing', 'data-extraction'],
                priority: 'low'
            },
            'general': {
                name: 'General Assistant Agent',
                nameVi: 'Đại lý Hỗ trợ chung',
                specialty: 'General Vietnamese business assistance and coordination',
                prompt: 'You provide general assistance and coordinate between other agents',
                tools: ['general-assistance', 'agent-coordination', 'task-routing'],
                priority: 'low'
            }
        };

        this.activeConversations = new Map();
        this.agentMetrics = new Map();
    }

    async initialize() {
        try {
            logger.info('Initializing AI Agent Orchestrator...');
            
            // Initialize metrics for each agent
            for (const agentId of Object.keys(this.agents)) {
                this.agentMetrics.set(agentId, {
                    requestCount: 0,
                    successCount: 0,
                    averageResponseTime: 0,
                    lastUsed: null
                });
            }

            // Test OpenAI connection
            await this.testOpenAIConnection();
            
            this.isInitialized = true;
            logger.info(`AI Agent Orchestrator initialized with ${Object.keys(this.agents).length} agents`);
            
            return true;
        } catch (error) {
            logger.error('Failed to initialize AI Agent Orchestrator', error);
            throw error;
        }
    }

    /**
     * Process request and route to appropriate AI agent
     */
    async processRequest(request) {
        if (!this.isInitialized) {
            throw new Error('AI Agent Orchestrator not initialized');
        }

        try {
            const startTime = Date.now();
            
            // Determine the best agent for this request
            const selectedAgent = await this.selectAgent(request);
            
            // Process the request with the selected agent
            const response = await this.executeAgent(selectedAgent, request);
            
            // Update metrics
            this.updateAgentMetrics(selectedAgent.id, true, Date.now() - startTime);
            
            logger.info('Agent request processed successfully', {
                agent: selectedAgent.id,
                responseTime: Date.now() - startTime
            });

            return {
                agent: selectedAgent,
                response,
                processingTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Agent request processing failed', error);
            throw error;
        }
    }

    /**
     * Select the most appropriate agent for the request
     */
    async selectAgent(request) {
        // Voice command routing
        if (request.source === 'voice' && request.command) {
            return this.agents[request.command.agent] || this.agents['general'];
        }

        // Intent-based routing
        if (request.intent) {
            const agentMapping = {
                'create-invoice': 'e-invoice',
                'calculate-bhxh': 'bhxh',
                'check-compliance': 'compliance',
                'manage-customer': 'crm',
                'track-sales': 'sales-tracking',
                'calculate-tax': 'tax-calculator',
                'analyze-financial': 'financial-analysis',
                'process-payroll': 'payroll',
                'automate-workflow': 'workflow',
                'manage-hr': 'hr-management',
                'manage-inventory': 'inventory',
                'generate-report': 'reporting',
                'analyze-data': 'analytics',
                'forecast-business': 'forecasting',
                'create-marketing': 'marketing',
                'optimize-pricing': 'pricing',
                'support-customer': 'customer-service',
                'process-document': 'document-processing'
            };
            
            const agentId = agentMapping[request.intent] || 'general';
            return { id: agentId, ...this.agents[agentId] };
        }

        // Text analysis for agent selection
        const agentId = await this.analyzeTextForAgent(request.text || request.message || '');
        return { id: agentId, ...this.agents[agentId] };
    }

    /**
     * Execute the selected agent with the request
     */
    async executeAgent(agent, request) {
        const conversationId = request.conversationId || `conv-${Date.now()}`;
        
        // Get or create conversation context
        let conversation = this.activeConversations.get(conversationId);
        if (!conversation) {
            conversation = {
                id: conversationId,
                agent: agent.id,
                messages: [],
                context: {},
                startTime: new Date()
            };
            this.activeConversations.set(conversationId, conversation);
        }

        // Build the prompt for the agent
        const systemPrompt = this.buildSystemPrompt(agent, conversation.context);
        const userMessage = this.buildUserMessage(request);

        // Add to conversation history
        conversation.messages.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        try {
            // Call OpenAI with agent-specific configuration
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversation.messages.slice(-10).map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
                temperature: 0.7,
                max_tokens: 2000,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            const assistantResponse = completion.choices[0].message.content;

            // Add assistant response to conversation
            conversation.messages.push({
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date()
            });

            // Update conversation context
            await this.updateConversationContext(conversation, request, assistantResponse);

            return {
                message: assistantResponse,
                conversationId,
                agent: agent.id,
                context: conversation.context,
                suggestions: await this.generateSuggestions(agent, assistantResponse)
            };
        } catch (error) {
            logger.error('Agent execution failed', error);
            
            // Fallback response
            return {
                message: 'Xin lỗi, tôi đang gặp khó khăn trong việc xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
                conversationId,
                agent: agent.id,
                error: true
            };
        }
    }

    /**
     * Build system prompt for the agent
     */
    buildSystemPrompt(agent, context) {
        let prompt = `${agent.prompt}

Bạn đang làm việc trong môi trường doanh nghiệp Việt Nam và cần:
1. Trả lời bằng tiếng Việt một cách chuyên nghiệp
2. Tuân thủ các quy định pháp luật Việt Nam
3. Hiểu rõ văn hóa kinh doanh Việt Nam
4. Cung cấp thông tin chính xác và hữu ích

Chuyên môn của bạn: ${agent.specialty}
Công cụ có sẵn: ${agent.tools.join(', ')}
`;

        // Add context if available
        if (context && Object.keys(context).length > 0) {
            prompt += `\nNgữ cảnh cuộc hội thoại:\n${JSON.stringify(context, null, 2)}`;
        }

        return prompt;
    }

    /**
     * Build user message from request
     */
    buildUserMessage(request) {
        let message = '';

        if (request.text || request.message) {
            message = request.text || request.message;
        } else if (request.command) {
            message = `Thực hiện lệnh: ${request.command.action}`;
            if (request.entities) {
                message += `\nThông tin bổ sung: ${JSON.stringify(request.entities, null, 2)}`;
            }
        } else if (request.data) {
            message = `Xử lý dữ liệu: ${JSON.stringify(request.data, null, 2)}`;
        }

        return message;
    }

    /**
     * Update conversation context
     */
    async updateConversationContext(conversation, request, response) {
        // Extract entities and context from the response
        if (request.entities) {
            conversation.context.entities = { ...conversation.context.entities, ...request.entities };
        }

        // Update last action
        conversation.context.lastAction = {
            agent: conversation.agent,
            request: request.intent || request.command?.action || 'general',
            timestamp: new Date()
        };

        // Extract business context from response
        if (response.includes('hóa đơn') || response.includes('invoice')) {
            conversation.context.businessType = 'e-invoice';
        } else if (response.includes('BHXH') || response.includes('bảo hiểm')) {
            conversation.context.businessType = 'bhxh';
        } else if (response.includes('khách hàng') || response.includes('customer')) {
            conversation.context.businessType = 'crm';
        }
    }

    /**
     * Generate suggestions for next actions
     */
    async generateSuggestions(agent, response) {
        const suggestions = [];

        // Agent-specific suggestions
        switch (agent.id) {
            case 'e-invoice':
                suggestions.push(
                    'Kiểm tra tuân thủ VAT',
                    'Xuất hóa đơn PDF',
                    'Gửi hóa đơn email'
                );
                break;
            case 'bhxh':
                suggestions.push(
                    'Tính BHXH cho nhân viên mới',
                    'Xuất báo cáo BHXH',
                    'Kiểm tra mức đóng BHXH'
                );
                break;
            case 'compliance':
                suggestions.push(
                    'Kiểm tra tuân thủ mới nhất',
                    'Tạo báo cáo tuân thủ',
                    'Cập nhật quy định'
                );
                break;
            default:
                suggestions.push(
                    'Hỗ trợ thêm thông tin',
                    'Chuyển sang agent khác',
                    'Tạo báo cáo tổng hợp'
                );
        }

        return suggestions;
    }

    /**
     * Analyze text to determine best agent
     */
    async analyzeTextForAgent(text) {
        const keywords = {
            'e-invoice': ['hóa đơn', 'invoice', 'VAT', 'thuế', 'xuất hóa đơn'],
            'bhxh': ['BHXH', 'bảo hiểm xã hội', 'social insurance', 'đóng BHXH'],
            'compliance': ['tuân thủ', 'compliance', 'quy định', 'audit'],
            'crm': ['khách hàng', 'customer', 'CRM', 'quan hệ khách hàng'],
            'sales-tracking': ['bán hàng', 'sales', 'doanh số', 'theo dõi bán hàng'],
            'tax-calculator': ['tính thuế', 'tax', 'thuế VAT', 'thuế thu nhập'],
            'payroll': ['lương', 'payroll', 'tính lương', 'bảng lương'],
            'reporting': ['báo cáo', 'report', 'thống kê', 'tổng hợp'],
            'analytics': ['phân tích', 'analytics', 'dữ liệu', 'insight'],
            'marketing': ['marketing', 'quảng cáo', 'campaign', 'chiến dịch'],
            'pricing': ['giá', 'pricing', 'định giá', 'tính giá']
        };

        const lowercaseText = text.toLowerCase();
        
        for (const [agentId, agentKeywords] of Object.entries(keywords)) {
            if (agentKeywords.some(keyword => lowercaseText.includes(keyword))) {
                return agentId;
            }
        }

        return 'general';
    }

    /**
     * Update agent metrics
     */
    updateAgentMetrics(agentId, success, responseTime) {
        const metrics = this.agentMetrics.get(agentId);
        if (metrics) {
            metrics.requestCount++;
            if (success) metrics.successCount++;
            metrics.averageResponseTime = 
                (metrics.averageResponseTime * (metrics.requestCount - 1) + responseTime) / metrics.requestCount;
            metrics.lastUsed = new Date();
            
            this.agentMetrics.set(agentId, metrics);
        }
    }

    /**
     * Get agent performance metrics
     */
    getAgentMetrics() {
        const metrics = {};
        for (const [agentId, agentMetrics] of this.agentMetrics.entries()) {
            metrics[agentId] = {
                ...agentMetrics,
                successRate: agentMetrics.requestCount > 0 
                    ? (agentMetrics.successCount / agentMetrics.requestCount * 100).toFixed(2) + '%'
                    : '0%'
            };
        }
        return metrics;
    }

    /**
     * Test OpenAI connection
     */
    async testOpenAIConnection() {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Test connection' }],
                max_tokens: 10
            });
            
            logger.info('OpenAI connection test successful');
            return true;
        } catch (error) {
            logger.warn('OpenAI connection test failed (using mock mode)', error.message);
            return false;
        }
    }

    /**
     * Get available agents list
     */
    getAvailableAgents() {
        return Object.entries(this.agents).map(([id, agent]) => ({
            id,
            name: agent.name,
            nameVi: agent.nameVi,
            specialty: agent.specialty,
            tools: agent.tools,
            priority: agent.priority
        }));
    }

    /**
     * Route voice command to appropriate agent
     */
    async routeVoiceCommand(voiceResult) {
        if (!voiceResult.actionPlan) {
            throw new Error('Voice result must contain action plan');
        }

        const request = {
            source: 'voice',
            command: voiceResult.command,
            entities: voiceResult.entities,
            intent: voiceResult.command.action,
            conversationId: `voice-${Date.now()}`
        };

        return await this.processRequest(request);
    }
}

module.exports = AIAgentOrchestrator;