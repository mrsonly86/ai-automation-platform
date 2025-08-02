import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { MultiCompanyController } from './controller';
import { validateRequest } from '@shared/middleware/validate-request';
import { authenticateToken } from '@shared/middleware/auth';

const router = Router();
const multiCompanyController = new MultiCompanyController();

// Apply authentication to all routes
router.use(authenticateToken);

// Corporate Structure Management
router.post('/', [
  body('name').notEmpty().trim(),
  body('type').isIn(['holding', 'subsidiary', 'branch', 'representative']),
  body('registrationNumber').notEmpty(),
  body('taxCode').notEmpty(),
  body('address').notEmpty(),
  body('legalRepresentative').notEmpty()
], validateRequest, multiCompanyController.createCompany);

router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional(),
  query('status').optional()
], validateRequest, multiCompanyController.getCompanies);

router.get('/hierarchy', multiCompanyController.getCorporateHierarchy);

router.get('/:id', [
  param('id').isMongoId()
], validateRequest, multiCompanyController.getCompany);

router.put('/:id', [
  param('id').isMongoId()
], validateRequest, multiCompanyController.updateCompany);

router.delete('/:id', [
  param('id').isMongoId()
], validateRequest, multiCompanyController.deleteCompany);

// Subsidiary Management
router.post('/:id/subsidiaries', [
  param('id').isMongoId(),
  body('subsidiaryId').isMongoId(),
  body('ownershipPercentage').isFloat({ min: 0, max: 100 }),
  body('effectiveDate').isISO8601()
], validateRequest, multiCompanyController.addSubsidiary);

router.get('/:id/subsidiaries', [
  param('id').isMongoId()
], validateRequest, multiCompanyController.getSubsidiaries);

router.delete('/:id/subsidiaries/:subsidiaryId', [
  param('id').isMongoId(),
  param('subsidiaryId').isMongoId()
], validateRequest, multiCompanyController.removeSubsidiary);

// Financial Consolidation
router.post('/consolidation/setup', [
  body('parentCompanyId').isMongoId(),
  body('subsidiaries').isArray({ min: 1 }),
  body('consolidationMethod').isIn(['full', 'proportional', 'equity']),
  body('reportingPeriod').isIn(['monthly', 'quarterly', 'annually'])
], validateRequest, multiCompanyController.setupConsolidation);

router.get('/consolidation/:id/reports', [
  param('id').isMongoId(),
  query('period').isIn(['month', 'quarter', 'year']),
  query('year').isInt({ min: 2020 }),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('quarter').optional().isInt({ min: 1, max: 4 })
], validateRequest, multiCompanyController.getConsolidationReports);

router.post('/consolidation/:id/process', [
  param('id').isMongoId(),
  body('period').notEmpty(),
  body('eliminations').optional().isArray()
], validateRequest, multiCompanyController.processConsolidation);

// Intercompany Transactions
router.post('/intercompany/transactions', [
  body('fromCompanyId').isMongoId(),
  body('toCompanyId').isMongoId(),
  body('type').isIn(['sales', 'purchase', 'loan', 'service', 'dividend']),
  body('amount').isFloat({ min: 0 }),
  body('description').notEmpty(),
  body('transactionDate').isISO8601()
], validateRequest, multiCompanyController.createIntercompanyTransaction);

router.get('/intercompany/transactions', [
  query('companyId').optional().isMongoId(),
  query('type').optional(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validateRequest, multiCompanyController.getIntercompanyTransactions);

router.get('/intercompany/reconciliation', [
  query('companyId1').isMongoId(),
  query('companyId2').isMongoId(),
  query('period').isIn(['month', 'quarter', 'year'])
], validateRequest, multiCompanyController.getIntercompanyReconciliation);

// Governance & Compliance
router.post('/:id/board-members', [
  param('id').isMongoId(),
  body('name').notEmpty().trim(),
  body('position').notEmpty(),
  body('appointmentDate').isISO8601(),
  body('termEnd').optional().isISO8601(),
  body('qualifications').optional().isArray()
], validateRequest, multiCompanyController.addBoardMember);

router.get('/:id/board-members', [
  param('id').isMongoId()
], validateRequest, multiCompanyController.getBoardMembers);

router.post('/:id/board-meetings', [
  param('id').isMongoId(),
  body('title').notEmpty(),
  body('meetingDate').isISO8601(),
  body('agenda').isArray({ min: 1 }),
  body('attendees').isArray({ min: 1 })
], validateRequest, multiCompanyController.scheduleBoardMeeting);

router.get('/:id/compliance-status', [
  param('id').isMongoId()
], validateRequest, multiCompanyController.getComplianceStatus);

router.post('/:id/compliance-reports', [
  param('id').isMongoId(),
  body('reportType').isIn(['annual', 'quarterly', 'tax', 'audit']),
  body('period').notEmpty(),
  body('submissionDeadline').isISO8601()
], validateRequest, multiCompanyController.createComplianceReport);

// Shared Services
router.post('/shared-services/centers', [
  body('name').notEmpty().trim(),
  body('location').notEmpty(),
  body('services').isArray({ min: 1 }),
  body('servingCompanies').isArray({ min: 1 })
], validateRequest, multiCompanyController.createSharedServiceCenter);

router.get('/shared-services/centers', multiCompanyController.getSharedServiceCenters);

router.post('/shared-services/sla', [
  body('centerId').isMongoId(),
  body('companyId').isMongoId(),
  body('serviceType').notEmpty(),
  body('slaMetrics').isArray({ min: 1 }),
  body('effectiveDate').isISO8601()
], validateRequest, multiCompanyController.createServiceLevelAgreement);

router.get('/shared-services/performance/:centerId', [
  param('centerId').isMongoId(),
  query('period').optional().isIn(['month', 'quarter', 'year'])
], validateRequest, multiCompanyController.getSharedServicePerformance);

// Cost Allocation
router.post('/cost-allocation/setup', [
  body('allocationMethod').isIn(['direct', 'proportional', 'activity-based']),
  body('costCenters').isArray({ min: 1 }),
  body('allocationKeys').isArray({ min: 1 })
], validateRequest, multiCompanyController.setupCostAllocation);

router.post('/cost-allocation/process', [
  body('period').notEmpty(),
  body('costAllocations').isArray({ min: 1 })
], validateRequest, multiCompanyController.processCostAllocation);

router.get('/cost-allocation/reports/:period', [
  param('period').notEmpty()
], validateRequest, multiCompanyController.getCostAllocationReports);

// Group Analytics
router.get('/analytics/group-performance', [
  query('period').optional().isIn(['month', 'quarter', 'year']),
  query('metrics').optional()
], validateRequest, multiCompanyController.getGroupPerformance);

router.get('/analytics/subsidiary-comparison', [
  query('metrics').optional(),
  query('period').optional()
], validateRequest, multiCompanyController.getSubsidiaryComparison);

router.get('/analytics/benchmark', [
  query('industry').optional(),
  query('region').optional(),
  query('companySize').optional()
], validateRequest, multiCompanyController.getBenchmarkAnalysis);

router.get('/analytics/executive-dashboard', multiCompanyController.getExecutiveDashboard);

// Risk Management
router.post('/:id/risks', [
  param('id').isMongoId(),
  body('riskType').notEmpty(),
  body('description').notEmpty(),
  body('probability').isInt({ min: 1, max: 5 }),
  body('impact').isInt({ min: 1, max: 5 }),
  body('mitigation').optional()
], validateRequest, multiCompanyController.addRisk);

router.get('/:id/risks', [
  param('id').isMongoId(),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
], validateRequest, multiCompanyController.getRisks);

router.get('/analytics/group-risks', multiCompanyController.getGroupRiskAnalysis);

export { router as multiCompanyRoutes };