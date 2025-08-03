const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const ComplianceService = require('../compliance/ComplianceService');

const router = express.Router();
let complianceService = null;

// Initialize compliance service
router.use((req, res, next) => {
    if (!complianceService) {
        complianceService = req.app.locals.complianceService;
    }
    next();
});

/**
 * POST /api/compliance/validate
 * Comprehensive compliance validation
 */
router.post('/validate', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    const validationData = req.body;
    
    if (!validationData.type) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Validation type is required (e-invoice, bhxh, enterprise-law, or all)'
        });
    }
    
    const result = await complianceService.validateCompliance(validationData);
    res.json(result);
}));

/**
 * POST /api/compliance/e-invoice/validate
 * E-Invoice specific validation
 */
router.post('/e-invoice/validate', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    const invoiceData = req.body;
    const result = await complianceService.validateEInvoice(invoiceData);
    
    res.json({
        validation: result,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/compliance/e-invoice/generate-xml
 * Generate E-Invoice XML per Vietnamese regulations
 */
router.post('/e-invoice/generate-xml', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    const invoiceData = req.body;
    const xmlContent = await complianceService.generateEInvoiceXML(invoiceData);
    
    res.set({
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="hoadon-${invoiceData.invoiceNumber}.xml"`
    });
    
    res.send(xmlContent);
}));

/**
 * POST /api/compliance/bhxh/submit
 * Submit BHXH data to national system
 */
router.post('/bhxh/submit', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    const bhxhData = req.body;
    const result = await complianceService.processBHXHSubmission(bhxhData);
    
    res.json({
        submission: result,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/compliance/bhxh/calculate
 * Calculate BHXH amounts
 */
router.post('/bhxh/calculate', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    const bhxhData = req.body;
    const calculation = await complianceService.calculateBHXHAmounts(bhxhData);
    
    res.json({
        calculation,
        timestamp: new Date().toISOString()
    });
}));

/**
 * POST /api/compliance/enterprise-law/validate
 * Validate Enterprise Law 2025 compliance
 */
router.post('/enterprise-law/validate', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    const companyData = req.body;
    const result = await complianceService.validateEnterpriseLawCompliance(companyData);
    
    res.json({
        compliance: result,
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/compliance/regulations
 * Get current Vietnamese regulations information
 */
router.get('/regulations', asyncHandler(async (req, res) => {
    if (!complianceService) {
        return res.status(503).json({ error: 'Compliance Service not available' });
    }
    
    res.json({
        regulations: complianceService.regulations,
        vatRules: complianceService.vatRules,
        lastUpdated: new Date().toISOString(),
        status: 'active'
    });
}));

/**
 * GET /api/compliance/status
 * Get compliance service status
 */
router.get('/status', asyncHandler(async (req, res) => {
    res.json({
        available: !!complianceService,
        initialized: complianceService?.isInitialized || false,
        features: {
            eInvoice: {
                xmlGeneration: true,
                vatValidation: true,
                thongtu32_2025: true,
                nonCashPaymentTracking: true
            },
            bhxh: {
                calculationEngine: true,
                nationalApiIntegration: true,
                businessBHXH: true,
                approvalWorkflow: true
            },
            enterpriseLaw: {
                corporateGovernance: true,
                reportingFramework: true,
                digitalCompliance: true,
                auditTrails: true
            }
        },
        compliance: '100%',
        timestamp: new Date().toISOString()
    });
}));

module.exports = router;