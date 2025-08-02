import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { BuildingController } from './controller';
import { validateRequest } from '@shared/middleware/validate-request';
import { authenticateToken } from '@shared/middleware/auth';

const router = Router();
const buildingController = new BuildingController();

// Apply authentication to all routes
router.use(authenticateToken);

// Facility Operations
router.post('/facilities', [
  body('name').notEmpty().trim(),
  body('address').notEmpty(),
  body('type').isIn(['office', 'warehouse', 'factory', 'retail', 'mixed'])
], validateRequest, buildingController.createFacility);

router.get('/facilities', buildingController.getFacilities);
router.get('/facilities/:id', [
  param('id').isMongoId()
], validateRequest, buildingController.getFacility);

// HVAC Control
router.post('/hvac/control', [
  body('facilityId').isMongoId(),
  body('zone').notEmpty(),
  body('temperature').isFloat({ min: 16, max: 30 }),
  body('humidity').optional().isFloat({ min: 30, max: 70 })
], validateRequest, buildingController.controlHVAC);

router.get('/hvac/status/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getHVACStatus);

// Lighting Automation
router.post('/lighting/control', [
  body('facilityId').isMongoId(),
  body('zone').notEmpty(),
  body('brightness').isInt({ min: 0, max: 100 }),
  body('schedule').optional()
], validateRequest, buildingController.controlLighting);

router.get('/lighting/status/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getLightingStatus);

// Security Access Control
router.post('/security/access-control', [
  body('facilityId').isMongoId(),
  body('userId').isMongoId(),
  body('accessLevel').isIn(['visitor', 'employee', 'manager', 'admin']),
  body('validFrom').isISO8601(),
  body('validUntil').isISO8601()
], validateRequest, buildingController.grantAccess);

router.get('/security/access-logs/:facilityId', [
  param('facilityId').isMongoId(),
  query('date').optional().isISO8601()
], validateRequest, buildingController.getAccessLogs);

// Space Management
router.post('/space/desk-booking', [
  body('facilityId').isMongoId(),
  body('deskId').notEmpty(),
  body('userId').isMongoId(),
  body('bookingDate').isISO8601(),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], validateRequest, buildingController.bookDesk);

router.get('/space/desk-availability/:facilityId', [
  param('facilityId').isMongoId(),
  query('date').isISO8601(),
  query('floor').optional()
], validateRequest, buildingController.getDeskAvailability);

router.post('/space/meeting-room', [
  body('facilityId').isMongoId(),
  body('roomId').notEmpty(),
  body('userId').isMongoId(),
  body('title').notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('attendees').isArray()
], validateRequest, buildingController.bookMeetingRoom);

// Parking Management
router.post('/parking/reserve', [
  body('facilityId').isMongoId(),
  body('userId').isMongoId(),
  body('vehicleNumber').notEmpty(),
  body('parkingDate').isISO8601(),
  body('duration').isInt({ min: 1, max: 24 })
], validateRequest, buildingController.reserveParking);

router.get('/parking/availability/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getParkingAvailability);

// Visitor Management
router.post('/visitors/register', [
  body('facilityId').isMongoId(),
  body('visitorName').notEmpty().trim(),
  body('company').notEmpty(),
  body('hostEmployeeId').isMongoId(),
  body('purpose').notEmpty(),
  body('expectedDuration').isInt({ min: 1, max: 480 }),
  body('contactNumber').isMobilePhone('vi-VN')
], validateRequest, buildingController.registerVisitor);

router.get('/visitors/active/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getActiveVisitors);

// Energy Management
router.get('/energy/consumption/:facilityId', [
  param('facilityId').isMongoId(),
  query('period').isIn(['day', 'week', 'month', 'year'])
], validateRequest, buildingController.getEnergyConsumption);

router.get('/energy/optimization/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getEnergyOptimization);

// Maintenance Operations
router.post('/maintenance/work-order', [
  body('facilityId').isMongoId(),
  body('type').isIn(['electrical', 'plumbing', 'hvac', 'cleaning', 'security', 'general']),
  body('priority').isIn(['low', 'medium', 'high', 'emergency']),
  body('description').notEmpty(),
  body('location').notEmpty()
], validateRequest, buildingController.createWorkOrder);

router.get('/maintenance/work-orders/:facilityId', [
  param('facilityId').isMongoId(),
  query('status').optional().isIn(['pending', 'assigned', 'in-progress', 'completed', 'cancelled'])
], validateRequest, buildingController.getWorkOrders);

router.put('/maintenance/work-orders/:id/assign', [
  param('id').isMongoId(),
  body('contractorId').isMongoId(),
  body('estimatedCompletionDate').isISO8601()
], validateRequest, buildingController.assignWorkOrder);

// Building Analytics
router.get('/analytics/occupancy/:facilityId', [
  param('facilityId').isMongoId(),
  query('period').optional().isIn(['day', 'week', 'month'])
], validateRequest, buildingController.getOccupancyAnalytics);

router.get('/analytics/space-utilization/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getSpaceUtilization);

router.get('/analytics/energy-efficiency/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getEnergyEfficiency);

router.get('/analytics/dashboard/:facilityId', [
  param('facilityId').isMongoId()
], validateRequest, buildingController.getFacilityDashboard);

export { router as buildingRoutes };