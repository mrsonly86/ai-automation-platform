const express = require('express');
const path = require('path');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/demo
 * Start comprehensive demo environment
 */
router.get('/', asyncHandler(async (req, res) => {
    const demoConfig = {
        environment: 'demo',
        features: {
            vietnameseVoiceCommands: true,
            eInvoiceCompliance: true,
            bhxhIntegration: true,
            aiAgents: 18,
            realTimeProcessing: true
        },
        sampleData: {
            company: {
                name: 'Công ty Demo Technology',
                taxCode: '0123456789',
                employees: 25,
                industry: 'Công nghệ thông tin'
            },
            users: [
                {
                    name: 'Nguyễn Văn A',
                    role: 'Kế toán trưởng',
                    permissions: ['e-invoice', 'compliance', 'reporting']
                },
                {
                    name: 'Trần Thị B',
                    role: 'Nhân viên HR',
                    permissions: ['bhxh', 'payroll', 'hr-management']
                }
            ]
        },
        demoScenarios: [
            {
                id: 'voice-invoice',
                title: 'Tạo hóa đơn bằng giọng nói',
                description: 'Sử dụng lệnh giọng nói tiếng Việt để tạo hóa đơn điện tử',
                duration: '5 phút',
                difficulty: 'Dễ'
            },
            {
                id: 'bhxh-calculation',
                title: 'Tính toán BHXH tự động',
                description: 'Tính toán và nộp BHXH theo quy định mới nhất',
                duration: '10 phút',
                difficulty: 'Trung bình'
            },
            {
                id: 'compliance-check',
                title: 'Kiểm tra tuân thủ toàn diện',
                description: 'Kiểm tra tuân thủ E-Invoice, BHXH và Luật Doanh nghiệp',
                duration: '15 phút',
                difficulty: 'Nâng cao'
            },
            {
                id: 'ai-agents-showcase',
                title: 'Trải nghiệm 18 AI Agents',
                description: 'Tương tác với tất cả 18 AI agents chuyên biệt',
                duration: '20 phút',
                difficulty: 'Toàn diện'
            }
        ]
    };
    
    res.json({
        demo: demoConfig,
        startUrl: `${req.protocol}://${req.get('host')}/demo/start`,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/demo/start-scenario
 * Start a specific demo scenario
 */
router.post('/start-scenario', asyncHandler(async (req, res) => {
    const { scenarioId, userId = 'demo-user' } = req.body;
    
    if (!scenarioId) {
        return res.status(400).json({
            error: 'Scenario ID is required'
        });
    }
    
    const scenarios = {
        'voice-invoice': {
            steps: [
                'Kích hoạt microphone',
                'Nói: "Tạo hóa đơn cho công ty XYZ"',
                'Xác nhận thông tin được nhận diện',
                'Điền thêm chi tiết nếu cần',
                'Xuất hóa đơn PDF'
            ],
            sampleData: {
                customer: 'Công ty TNHH XYZ',
                amount: 10000000,
                items: [
                    { name: 'Dịch vụ tư vấn IT', quantity: 1, price: 10000000 }
                ]
            }
        },
        'bhxh-calculation': {
            steps: [
                'Nhập thông tin nhân viên',
                'Hệ thống tự động tính BHXH',
                'Kiểm tra tuân thủ quy định',
                'Tạo báo cáo nộp BHXH',
                'Gửi dữ liệu lên hệ thống quốc gia'
            ],
            sampleData: {
                employees: [
                    { name: 'Nguyễn Văn C', salary: 15000000, position: 'Developer' },
                    { name: 'Trần Thị D', salary: 12000000, position: 'Tester' }
                ]
            }
        },
        'compliance-check': {
            steps: [
                'Chọn loại kiểm tra tuân thủ',
                'Upload dữ liệu doanh nghiệp',
                'Hệ thống phân tích tự động',
                'Xem báo cáo chi tiết',
                'Nhận khuyến nghị cải thiện'
            ],
            sampleData: {
                companyType: 'TNHH',
                revenue: 50000000000,
                employees: 25
            }
        },
        'ai-agents-showcase': {
            steps: [
                'Khám phá danh sách 18 AI agents',
                'Thử nghiệm từng agent',
                'Xem demo tương tác',
                'Kiểm tra hiệu suất',
                'Đánh giá tổng thể'
            ],
            sampleData: {
                availableAgents: 18,
                averageResponseTime: '2.5s',
                accuracy: '95%+'
            }
        }
    };
    
    const scenario = scenarios[scenarioId];
    if (!scenario) {
        return res.status(404).json({
            error: 'Scenario not found'
        });
    }
    
    // Create demo session
    const demoSession = {
        sessionId: `demo-${Date.now()}`,
        userId,
        scenarioId,
        startTime: new Date(),
        status: 'active',
        currentStep: 0,
        totalSteps: scenario.steps.length,
        data: scenario.sampleData
    };
    
    res.json({
        session: demoSession,
        scenario,
        nextStep: scenario.steps[0],
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/demo/next-step
 * Progress to next step in demo scenario
 */
router.post('/next-step', asyncHandler(async (req, res) => {
    const { sessionId, stepData } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({
            error: 'Session ID is required'
        });
    }
    
    // Mock progression (in real app, would get from database)
    const currentStep = (stepData?.currentStep || 0) + 1;
    const totalSteps = stepData?.totalSteps || 5;
    
    const response = {
        sessionId,
        currentStep,
        totalSteps,
        progress: Math.round((currentStep / totalSteps) * 100),
        completed: currentStep >= totalSteps,
        timestamp: new Date().toISOString()
    };
    
    if (response.completed) {
        response.message = 'Demo scenario hoàn thành!';
        response.nextActions = [
            'Thử scenario khác',
            'Đăng ký trial account',
            'Liên hệ sales team',
            'Tải tài liệu chi tiết'
        ];
    } else {
        response.nextStep = `Bước ${currentStep + 1}`;
    }
    
    res.json(response);
}));

/**
 * GET /api/demo/sample-voice-commands
 * Get sample Vietnamese voice commands for demo
 */
router.get('/sample-voice-commands', asyncHandler(async (req, res) => {
    const sampleCommands = [
        {
            command: 'Tạo hóa đơn cho công ty ABC',
            agent: 'e-invoice',
            expectedResult: 'Mở form tạo hóa đơn với thông tin công ty ABC',
            difficulty: 'Dễ'
        },
        {
            command: 'Tính bảo hiểm xã hội cho nhân viên mới',
            agent: 'bhxh',
            expectedResult: 'Mở calculator BHXH và yêu cầu thông tin nhân viên',
            difficulty: 'Trung bình'
        },
        {
            command: 'Kiểm tra tuân thủ quy định thuế mới nhất',
            agent: 'compliance',
            expectedResult: 'Chạy kiểm tra compliance và hiển thị báo cáo',
            difficulty: 'Trung bình'
        },
        {
            command: 'Tạo báo cáo doanh thu tháng này',
            agent: 'reporting',
            expectedResult: 'Tạo báo cáo doanh thu với dữ liệu demo',
            difficulty: 'Dễ'
        },
        {
            command: 'Phân tích xu hướng bán hàng quý này',
            agent: 'analytics',
            expectedResult: 'Hiển thị dashboard phân tích bán hàng',
            difficulty: 'Nâng cao'
        }
    ];
    
    res.json({
        commands: sampleCommands,
        instructions: {
            setup: [
                'Đảm bảo microphone hoạt động',
                'Nói rõ ràng và không quá nhanh',
                'Sử dụng tiếng Việt chuẩn',
                'Chờ hệ thống xử lý sau mỗi lệnh'
            ],
            tips: [
                'Bắt đầu với các lệnh đơn giản',
                'Có thể kết hợp tiếng Việt và tiếng Anh',
                'Sử dụng từ khóa rõ ràng như "tạo", "tính", "kiểm tra"',
                'Nói tên công ty/người rõ ràng'
            ]
        },
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/demo/performance-metrics
 * Get demo environment performance metrics
 */
router.get('/performance-metrics', asyncHandler(async (req, res) => {
    const metrics = {
        system: {
            uptime: '99.9%',
            responseTime: '1.2s',
            concurrent_users: 150,
            daily_transactions: 5420
        },
        voiceCommands: {
            accuracy: '96.5%',
            avgRecognitionTime: '0.8s',
            supportedLanguages: ['vi-VN', 'en-US'],
            dailyCommands: 1250
        },
        compliance: {
            eInvoiceSuccess: '98.7%',
            bhxhProcessing: '99.2%',
            auditTrailCoverage: '100%',
            lastUpdate: new Date().toISOString()
        },
        aiAgents: {
            totalAgents: 18,
            averageResponseTime: '2.1s',
            successRate: '97.3%',
            concurrentRequests: 45
        }
    };
    
    res.json({
        metrics,
        lastUpdated: new Date().toISOString(),
        refreshInterval: '30s'
    });
}));

/**
 * POST /api/demo/reset
 * Reset demo environment to initial state
 */
router.post('/reset', asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    
    // Reset demo data (mock implementation)
    const resetResult = {
        sessionId: sessionId || `demo-${Date.now()}`,
        resetTime: new Date(),
        status: 'success',
        message: 'Demo environment đã được reset về trạng thái ban đầu',
        newData: {
            sampleInvoices: 3,
            sampleEmployees: 5,
            sampleComplianceReports: 2,
            availableFeatures: 'all'
        }
    };
    
    res.json({
        reset: resetResult,
        timestamp: new Date().toISOString()
    });
}));

module.exports = router;