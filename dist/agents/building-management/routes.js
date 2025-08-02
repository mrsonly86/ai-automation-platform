"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controller_1 = require("./controller");
const validate_request_1 = require("../../shared/middleware/validate-request");
const auth_1 = require("../../shared/middleware/auth");
const router = (0, express_1.Router)();
exports.buildingRoutes = router;
const buildingController = new controller_1.BuildingController();
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Facility Operations
router.post('/facilities', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('address').notEmpty(),
    (0, express_validator_1.body)('type').isIn(['office', 'warehouse', 'factory', 'retail', 'mixed'])
], validate_request_1.validateRequest, buildingController.createFacility);
router.get('/facilities', buildingController.getFacilities);
router.get('/facilities/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, buildingController.getFacility);
// HVAC Control
router.post('/hvac/control', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('zone').notEmpty(),
    (0, express_validator_1.body)('temperature').isFloat({ min: 16, max: 30 }),
    (0, express_validator_1.body)('humidity').optional().isFloat({ min: 30, max: 70 })
], validate_request_1.validateRequest, buildingController.controlHVAC);
router.get('/hvac/status/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getHVACStatus);
// Lighting Automation
router.post('/lighting/control', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('zone').notEmpty(),
    (0, express_validator_1.body)('brightness').isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('schedule').optional()
], validate_request_1.validateRequest, buildingController.controlLighting);
router.get('/lighting/status/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getLightingStatus);
// Security Access Control
router.post('/security/access-control', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('userId').isMongoId(),
    (0, express_validator_1.body)('accessLevel').isIn(['visitor', 'employee', 'manager', 'admin']),
    (0, express_validator_1.body)('validFrom').isISO8601(),
    (0, express_validator_1.body)('validUntil').isISO8601()
], validate_request_1.validateRequest, buildingController.grantAccess);
router.get('/security/access-logs/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId(),
    (0, express_validator_1.query)('date').optional().isISO8601()
], validate_request_1.validateRequest, buildingController.getAccessLogs);
// Space Management
router.post('/space/desk-booking', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('deskId').notEmpty(),
    (0, express_validator_1.body)('userId').isMongoId(),
    (0, express_validator_1.body)('bookingDate').isISO8601(),
    (0, express_validator_1.body)('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    (0, express_validator_1.body)('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], validate_request_1.validateRequest, buildingController.bookDesk);
router.get('/space/desk-availability/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId(),
    (0, express_validator_1.query)('date').isISO8601(),
    (0, express_validator_1.query)('floor').optional()
], validate_request_1.validateRequest, buildingController.getDeskAvailability);
router.post('/space/meeting-room', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('roomId').notEmpty(),
    (0, express_validator_1.body)('userId').isMongoId(),
    (0, express_validator_1.body)('title').notEmpty(),
    (0, express_validator_1.body)('startTime').isISO8601(),
    (0, express_validator_1.body)('endTime').isISO8601(),
    (0, express_validator_1.body)('attendees').isArray()
], validate_request_1.validateRequest, buildingController.bookMeetingRoom);
// Parking Management
router.post('/parking/reserve', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('userId').isMongoId(),
    (0, express_validator_1.body)('vehicleNumber').notEmpty(),
    (0, express_validator_1.body)('parkingDate').isISO8601(),
    (0, express_validator_1.body)('duration').isInt({ min: 1, max: 24 })
], validate_request_1.validateRequest, buildingController.reserveParking);
router.get('/parking/availability/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getParkingAvailability);
// Visitor Management
router.post('/visitors/register', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('visitorName').notEmpty().trim(),
    (0, express_validator_1.body)('company').notEmpty(),
    (0, express_validator_1.body)('hostEmployeeId').isMongoId(),
    (0, express_validator_1.body)('purpose').notEmpty(),
    (0, express_validator_1.body)('expectedDuration').isInt({ min: 1, max: 480 }),
    (0, express_validator_1.body)('contactNumber').isMobilePhone('vi-VN')
], validate_request_1.validateRequest, buildingController.registerVisitor);
router.get('/visitors/active/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getActiveVisitors);
// Energy Management
router.get('/energy/consumption/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId(),
    (0, express_validator_1.query)('period').isIn(['day', 'week', 'month', 'year'])
], validate_request_1.validateRequest, buildingController.getEnergyConsumption);
router.get('/energy/optimization/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getEnergyOptimization);
// Maintenance Operations
router.post('/maintenance/work-order', [
    (0, express_validator_1.body)('facilityId').isMongoId(),
    (0, express_validator_1.body)('type').isIn(['electrical', 'plumbing', 'hvac', 'cleaning', 'security', 'general']),
    (0, express_validator_1.body)('priority').isIn(['low', 'medium', 'high', 'emergency']),
    (0, express_validator_1.body)('description').notEmpty(),
    (0, express_validator_1.body)('location').notEmpty()
], validate_request_1.validateRequest, buildingController.createWorkOrder);
router.get('/maintenance/work-orders/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId(),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'assigned', 'in-progress', 'completed', 'cancelled'])
], validate_request_1.validateRequest, buildingController.getWorkOrders);
router.put('/maintenance/work-orders/:id/assign', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('contractorId').isMongoId(),
    (0, express_validator_1.body)('estimatedCompletionDate').isISO8601()
], validate_request_1.validateRequest, buildingController.assignWorkOrder);
// Building Analytics
router.get('/analytics/occupancy/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId(),
    (0, express_validator_1.query)('period').optional().isIn(['day', 'week', 'month'])
], validate_request_1.validateRequest, buildingController.getOccupancyAnalytics);
router.get('/analytics/space-utilization/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getSpaceUtilization);
router.get('/analytics/energy-efficiency/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getEnergyEfficiency);
router.get('/analytics/dashboard/:facilityId', [
    (0, express_validator_1.param)('facilityId').isMongoId()
], validate_request_1.validateRequest, buildingController.getFacilityDashboard);
//# sourceMappingURL=routes.js.map