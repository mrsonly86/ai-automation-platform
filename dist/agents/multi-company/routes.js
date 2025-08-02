"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiCompanyRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controller_1 = require("./controller");
const validate_request_1 = require("@shared/middleware/validate-request");
const auth_1 = require("@shared/middleware/auth");
const router = (0, express_1.Router)();
exports.multiCompanyRoutes = router;
const multiCompanyController = new controller_1.MultiCompanyController();
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Corporate Structure Management
router.post('/', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('type').isIn(['holding', 'subsidiary', 'branch', 'representative']),
    (0, express_validator_1.body)('registrationNumber').notEmpty(),
    (0, express_validator_1.body)('taxCode').notEmpty(),
    (0, express_validator_1.body)('address').notEmpty(),
    (0, express_validator_1.body)('legalRepresentative').notEmpty()
], validate_request_1.validateRequest, multiCompanyController.createCompany);
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('type').optional(),
    (0, express_validator_1.query)('status').optional()
], validate_request_1.validateRequest, multiCompanyController.getCompanies);
router.get('/hierarchy', multiCompanyController.getCorporateHierarchy);
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.getCompany);
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.updateCompany);
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.deleteCompany);
// Subsidiary Management
router.post('/:id/subsidiaries', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('subsidiaryId').isMongoId(),
    (0, express_validator_1.body)('ownershipPercentage').isFloat({ min: 0, max: 100 }),
    (0, express_validator_1.body)('effectiveDate').isISO8601()
], validate_request_1.validateRequest, multiCompanyController.addSubsidiary);
router.get('/:id/subsidiaries', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.getSubsidiaries);
router.delete('/:id/subsidiaries/:subsidiaryId', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.param)('subsidiaryId').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.removeSubsidiary);
// Financial Consolidation
router.post('/consolidation/setup', [
    (0, express_validator_1.body)('parentCompanyId').isMongoId(),
    (0, express_validator_1.body)('subsidiaries').isArray({ min: 1 }),
    (0, express_validator_1.body)('consolidationMethod').isIn(['full', 'proportional', 'equity']),
    (0, express_validator_1.body)('reportingPeriod').isIn(['monthly', 'quarterly', 'annually'])
], validate_request_1.validateRequest, multiCompanyController.setupConsolidation);
router.get('/consolidation/:id/reports', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.query)('period').isIn(['month', 'quarter', 'year']),
    (0, express_validator_1.query)('year').isInt({ min: 2020 }),
    (0, express_validator_1.query)('month').optional().isInt({ min: 1, max: 12 }),
    (0, express_validator_1.query)('quarter').optional().isInt({ min: 1, max: 4 })
], validate_request_1.validateRequest, multiCompanyController.getConsolidationReports);
router.post('/consolidation/:id/process', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('period').notEmpty(),
    (0, express_validator_1.body)('eliminations').optional().isArray()
], validate_request_1.validateRequest, multiCompanyController.processConsolidation);
// Intercompany Transactions
router.post('/intercompany/transactions', [
    (0, express_validator_1.body)('fromCompanyId').isMongoId(),
    (0, express_validator_1.body)('toCompanyId').isMongoId(),
    (0, express_validator_1.body)('type').isIn(['sales', 'purchase', 'loan', 'service', 'dividend']),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }),
    (0, express_validator_1.body)('description').notEmpty(),
    (0, express_validator_1.body)('transactionDate').isISO8601()
], validate_request_1.validateRequest, multiCompanyController.createIntercompanyTransaction);
router.get('/intercompany/transactions', [
    (0, express_validator_1.query)('companyId').optional().isMongoId(),
    (0, express_validator_1.query)('type').optional(),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601()
], validate_request_1.validateRequest, multiCompanyController.getIntercompanyTransactions);
router.get('/intercompany/reconciliation', [
    (0, express_validator_1.query)('companyId1').isMongoId(),
    (0, express_validator_1.query)('companyId2').isMongoId(),
    (0, express_validator_1.query)('period').isIn(['month', 'quarter', 'year'])
], validate_request_1.validateRequest, multiCompanyController.getIntercompanyReconciliation);
// Governance & Compliance
router.post('/:id/board-members', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('position').notEmpty(),
    (0, express_validator_1.body)('appointmentDate').isISO8601(),
    (0, express_validator_1.body)('termEnd').optional().isISO8601(),
    (0, express_validator_1.body)('qualifications').optional().isArray()
], validate_request_1.validateRequest, multiCompanyController.addBoardMember);
router.get('/:id/board-members', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.getBoardMembers);
router.post('/:id/board-meetings', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('title').notEmpty(),
    (0, express_validator_1.body)('meetingDate').isISO8601(),
    (0, express_validator_1.body)('agenda').isArray({ min: 1 }),
    (0, express_validator_1.body)('attendees').isArray({ min: 1 })
], validate_request_1.validateRequest, multiCompanyController.scheduleBoardMeeting);
router.get('/:id/compliance-status', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, multiCompanyController.getComplianceStatus);
router.post('/:id/compliance-reports', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('reportType').isIn(['annual', 'quarterly', 'tax', 'audit']),
    (0, express_validator_1.body)('period').notEmpty(),
    (0, express_validator_1.body)('submissionDeadline').isISO8601()
], validate_request_1.validateRequest, multiCompanyController.createComplianceReport);
// Shared Services
router.post('/shared-services/centers', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('location').notEmpty(),
    (0, express_validator_1.body)('services').isArray({ min: 1 }),
    (0, express_validator_1.body)('servingCompanies').isArray({ min: 1 })
], validate_request_1.validateRequest, multiCompanyController.createSharedServiceCenter);
router.get('/shared-services/centers', multiCompanyController.getSharedServiceCenters);
router.post('/shared-services/sla', [
    (0, express_validator_1.body)('centerId').isMongoId(),
    (0, express_validator_1.body)('companyId').isMongoId(),
    (0, express_validator_1.body)('serviceType').notEmpty(),
    (0, express_validator_1.body)('slaMetrics').isArray({ min: 1 }),
    (0, express_validator_1.body)('effectiveDate').isISO8601()
], validate_request_1.validateRequest, multiCompanyController.createServiceLevelAgreement);
router.get('/shared-services/performance/:centerId', [
    (0, express_validator_1.param)('centerId').isMongoId(),
    (0, express_validator_1.query)('period').optional().isIn(['month', 'quarter', 'year'])
], validate_request_1.validateRequest, multiCompanyController.getSharedServicePerformance);
// Cost Allocation
router.post('/cost-allocation/setup', [
    (0, express_validator_1.body)('allocationMethod').isIn(['direct', 'proportional', 'activity-based']),
    (0, express_validator_1.body)('costCenters').isArray({ min: 1 }),
    (0, express_validator_1.body)('allocationKeys').isArray({ min: 1 })
], validate_request_1.validateRequest, multiCompanyController.setupCostAllocation);
router.post('/cost-allocation/process', [
    (0, express_validator_1.body)('period').notEmpty(),
    (0, express_validator_1.body)('costAllocations').isArray({ min: 1 })
], validate_request_1.validateRequest, multiCompanyController.processCostAllocation);
router.get('/cost-allocation/reports/:period', [
    (0, express_validator_1.param)('period').notEmpty()
], validate_request_1.validateRequest, multiCompanyController.getCostAllocationReports);
// Group Analytics
router.get('/analytics/group-performance', [
    (0, express_validator_1.query)('period').optional().isIn(['month', 'quarter', 'year']),
    (0, express_validator_1.query)('metrics').optional()
], validate_request_1.validateRequest, multiCompanyController.getGroupPerformance);
router.get('/analytics/subsidiary-comparison', [
    (0, express_validator_1.query)('metrics').optional(),
    (0, express_validator_1.query)('period').optional()
], validate_request_1.validateRequest, multiCompanyController.getSubsidiaryComparison);
router.get('/analytics/benchmark', [
    (0, express_validator_1.query)('industry').optional(),
    (0, express_validator_1.query)('region').optional(),
    (0, express_validator_1.query)('companySize').optional()
], validate_request_1.validateRequest, multiCompanyController.getBenchmarkAnalysis);
router.get('/analytics/executive-dashboard', multiCompanyController.getExecutiveDashboard);
// Risk Management
router.post('/:id/risks', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('riskType').notEmpty(),
    (0, express_validator_1.body)('description').notEmpty(),
    (0, express_validator_1.body)('probability').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('impact').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('mitigation').optional()
], validate_request_1.validateRequest, multiCompanyController.addRisk);
router.get('/:id/risks', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.query)('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
], validate_request_1.validateRequest, multiCompanyController.getRisks);
router.get('/analytics/group-risks', multiCompanyController.getGroupRiskAnalysis);
//# sourceMappingURL=routes.js.map