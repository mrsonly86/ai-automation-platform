const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Vietnamese Pricing Calculator Tool
 */
const vietnamesePricingCalculator = {
    // Base pricing for Vietnamese market
    basePricing: {
        startup: {
            monthly: 500000, // VND
            annual: 5400000, // 10% discount
            features: ['basic-ai-agents', 'e-invoice', 'basic-support']
        },
        business: {
            monthly: 1500000,
            annual: 16200000,
            features: ['all-ai-agents', 'full-compliance', 'priority-support', 'voice-commands']
        },
        enterprise: {
            monthly: 3000000,
            annual: 32400000,
            features: ['unlimited', 'custom-integration', '24/7-support', 'on-premise']
        }
    },
    
    // Calculate pricing based on requirements
    calculatePrice(requirements) {
        const { plan, employees, features, billingCycle } = requirements;
        let basePrice = this.basePricing[plan][billingCycle];
        
        // Employee-based scaling
        if (employees > 50) {
            basePrice *= 1.5;
        }
        if (employees > 200) {
            basePrice *= 2;
        }
        
        // Feature add-ons
        let addOnCost = 0;
        if (features.includes('advanced-analytics')) addOnCost += 300000;
        if (features.includes('custom-reports')) addOnCost += 200000;
        if (features.includes('api-integration')) addOnCost += 400000;
        
        return {
            basePrice,
            addOnCost,
            totalPrice: basePrice + addOnCost,
            currency: 'VND',
            savings: billingCycle === 'annual' ? basePrice * 0.1 : 0
        };
    }
};

/**
 * POST /api/sales/calculate-pricing
 * Calculate pricing for Vietnamese customers
 */
router.post('/calculate-pricing', asyncHandler(async (req, res) => {
    const { companySize, employees, features = [], plan = 'business', billingCycle = 'monthly' } = req.body;
    
    if (!plan || !['startup', 'business', 'enterprise'].includes(plan)) {
        return res.status(400).json({
            error: 'Invalid plan',
            message: 'Plan must be startup, business, or enterprise'
        });
    }
    
    const pricing = vietnamesePricingCalculator.calculatePrice({
        plan,
        employees: employees || 10,
        features,
        billingCycle
    });
    
    res.json({
        pricing,
        recommendations: generatePricingRecommendations(req.body),
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/sales/trial-signup
 * Handle trial signup with conversion tracking
 */
router.post('/trial-signup', asyncHandler(async (req, res) => {
    const { 
        companyName, 
        contactName, 
        email, 
        phone, 
        companySize, 
        industry, 
        interests = [] 
    } = req.body;
    
    if (!companyName || !contactName || !email) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'Company name, contact name, and email are required'
        });
    }
    
    // Generate trial account
    const trialData = {
        trialId: `trial-${Date.now()}`,
        companyName,
        contactName,
        email,
        phone,
        companySize,
        industry,
        interests,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'active',
        features: determineTrialFeatures(companySize, interests)
    };
    
    // TODO: Save to database
    // await saveTrialData(trialData);
    
    // TODO: Send welcome email
    // await sendTrialWelcomeEmail(trialData);
    
    res.json({
        success: true,
        trial: trialData,
        onboardingSteps: generateOnboardingSteps(trialData),
        nextActions: [
            'Kiểm tra email xác nhận',
            'Đăng nhập vào demo environment',
            'Thử nghiệm tính năng voice commands',
            'Liên hệ support để hỗ trợ setup'
        ],
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/sales/demo-data
 * Get comprehensive demo environment data
 */
router.get('/demo-data', asyncHandler(async (req, res) => {
    const demoData = {
        // Sample Vietnamese company data
        sampleCompany: {
            name: 'Công ty TNHH Công nghệ ABC',
            taxCode: '0123456789',
            address: '123 Nguyễn Văn Cừ, Quận 1, TP.HCM',
            industry: 'Công nghệ thông tin',
            employees: 50
        },
        
        // Sample e-invoices
        sampleEInvoices: [
            {
                invoiceNumber: 'HD001',
                issueDate: new Date(),
                totalAmount: 11000000,
                vatAmount: 1000000,
                status: 'published'
            },
            {
                invoiceNumber: 'HD002',
                issueDate: new Date(Date.now() - 24*60*60*1000),
                totalAmount: 5500000,
                vatAmount: 500000,
                status: 'draft'
            }
        ],
        
        // Sample BHXH data
        sampleBHXH: {
            totalEmployees: 50,
            monthlyContribution: 85000000,
            lastSubmission: new Date(Date.now() - 7*24*60*60*1000),
            status: 'compliant'
        },
        
        // Sample voice commands
        sampleVoiceCommands: [
            'Tạo hóa đơn cho khách hàng XYZ',
            'Tính BHXH cho tháng này',
            'Kiểm tra tuân thủ quy định mới',
            'Xuất báo cáo bán hàng'
        ],
        
        // Demo metrics
        metrics: {
            totalInvoicesThisMonth: 127,
            totalRevenue: 2850000000,
            complianceScore: 98,
            voiceCommandAccuracy: 96.5
        }
    };
    
    res.json({
        demoData,
        demoUrl: `${req.protocol}://${req.get('host')}/demo`,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/sales/conversion-track
 * Track conversion events
 */
router.post('/conversion-track', asyncHandler(async (req, res) => {
    const { trialId, event, data = {} } = req.body;
    
    if (!trialId || !event) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'Trial ID and event are required'
        });
    }
    
    // Track conversion event
    const conversionEvent = {
        trialId,
        event,
        data,
        timestamp: new Date(),
        source: req.get('User-Agent'),
        ip: req.ip
    };
    
    // TODO: Save to analytics database
    // await saveConversionEvent(conversionEvent);
    
    // Determine next action based on event
    const nextActions = getNextActionsForEvent(event);
    
    res.json({
        success: true,
        event: conversionEvent,
        nextActions,
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/sales/onboarding/:trialId
 * Get customer onboarding automation status
 */
router.get('/onboarding/:trialId', asyncHandler(async (req, res) => {
    const { trialId } = req.params;
    
    // TODO: Get from database
    const onboardingStatus = {
        trialId,
        currentStep: 2,
        totalSteps: 5,
        completedSteps: [
            { step: 1, name: 'Đăng ký trial', completed: true, date: new Date() },
            { step: 2, name: 'Xác nhận email', completed: true, date: new Date() }
        ],
        pendingSteps: [
            { step: 3, name: 'Thử nghiệm voice commands', completed: false },
            { step: 4, name: 'Tạo hóa đơn đầu tiên', completed: false },
            { step: 5, name: 'Tích hợp BHXH', completed: false }
        ],
        progress: 40,
        nextAction: 'Truy cập demo environment và thử lệnh giọng nói'
    };
    
    res.json({
        onboarding: onboardingStatus,
        timestamp: new Date().toISOString()
    });
}));

// Helper functions
function generatePricingRecommendations(requirements) {
    const recommendations = [];
    
    if (requirements.employees > 100) {
        recommendations.push('Gói Enterprise sẽ phù hợp với quy mô công ty của bạn');
    }
    
    if (requirements.features.includes('voice-commands')) {
        recommendations.push('Tính năng voice commands sẽ tăng hiệu quả làm việc 40%');
    }
    
    recommendations.push('Thanh toán hàng năm tiết kiệm 10% chi phí');
    
    return recommendations;
}

function determineTrialFeatures(companySize, interests) {
    const features = ['basic-ai-agents', 'e-invoice', 'basic-voice-commands'];
    
    if (companySize === 'large' || interests.includes('full-compliance')) {
        features.push('full-compliance', 'bhxh-integration');
    }
    
    if (interests.includes('advanced-features')) {
        features.push('advanced-analytics', 'custom-reports');
    }
    
    return features;
}

function generateOnboardingSteps(trialData) {
    return [
        {
            step: 1,
            title: 'Xác nhận email và đăng nhập',
            description: 'Kiểm tra email và click link xác nhận',
            estimated: '2 phút'
        },
        {
            step: 2,
            title: 'Thử nghiệm Vietnamese Voice Commands',
            description: 'Sử dụng micro để thử các lệnh giọng nói tiếng Việt',
            estimated: '10 phút'
        },
        {
            step: 3,
            title: 'Tạo hóa đơn điện tử đầu tiên',
            description: 'Tạo và xuất hóa đơn theo quy định Việt Nam',
            estimated: '15 phút'
        },
        {
            step: 4,
            title: 'Kiểm tra tính năng BHXH',
            description: 'Tính toán và nộp BHXH cho nhân viên',
            estimated: '10 phút'
        },
        {
            step: 5,
            title: 'Đánh giá và phản hồi',
            description: 'Chia sẻ trải nghiệm để được hỗ trợ tốt nhất',
            estimated: '5 phút'
        }
    ];
}

function getNextActionsForEvent(event) {
    const actionMap = {
        'login': ['Thử nghiệm voice commands', 'Tạo hóa đơn mẫu'],
        'voice-command-used': ['Tạo hóa đơn thực tế', 'Kiểm tra compliance'],
        'invoice-created': ['Tích hợp BHXH', 'Thiết lập báo cáo'],
        'compliance-checked': ['Liên hệ sales để upgrade', 'Tạo tài khoản chính thức']
    };
    
    return actionMap[event] || ['Tiếp tục khám phá các tính năng'];
}

module.exports = router;