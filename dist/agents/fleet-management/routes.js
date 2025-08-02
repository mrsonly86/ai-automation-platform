"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fleetRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controller_1 = require("./controller");
const validate_request_1 = require("@shared/middleware/validate-request");
const auth_1 = require("@shared/middleware/auth");
const router = (0, express_1.Router)();
exports.fleetRoutes = router;
const fleetController = new controller_1.FleetController();
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Vehicle Operations
router.post('/vehicles', [
    (0, express_validator_1.body)('make').notEmpty().trim(),
    (0, express_validator_1.body)('model').notEmpty().trim(),
    (0, express_validator_1.body)('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    (0, express_validator_1.body)('licensePlate').notEmpty().trim(),
    (0, express_validator_1.body)('vin').optional().isLength({ min: 17, max: 17 }),
    (0, express_validator_1.body)('type').isIn(['car', 'truck', 'van', 'motorcycle', 'bus', 'other'])
], validate_request_1.validateRequest, fleetController.createVehicle);
router.get('/vehicles', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('type').optional(),
    (0, express_validator_1.query)('status').optional()
], validate_request_1.validateRequest, fleetController.getVehicles);
router.get('/vehicles/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, fleetController.getVehicle);
router.put('/vehicles/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, fleetController.updateVehicle);
router.delete('/vehicles/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, fleetController.deleteVehicle);
// Vehicle Assignment
router.post('/vehicles/:id/assign', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('driverId').isMongoId(),
    (0, express_validator_1.body)('assignmentType').isIn(['permanent', 'temporary', 'pool']),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601()
], validate_request_1.validateRequest, fleetController.assignVehicle);
router.post('/vehicles/:id/unassign', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, fleetController.unassignVehicle);
// Driver Management
router.post('/drivers', [
    (0, express_validator_1.body)('firstName').notEmpty().trim(),
    (0, express_validator_1.body)('lastName').notEmpty().trim(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('phone').isMobilePhone('vi-VN'),
    (0, express_validator_1.body)('licenseNumber').notEmpty(),
    (0, express_validator_1.body)('licenseExpiry').isISO8601(),
    (0, express_validator_1.body)('employeeId').optional()
], validate_request_1.validateRequest, fleetController.createDriver);
router.get('/drivers', fleetController.getDrivers);
router.get('/drivers/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, fleetController.getDriver);
// Real-time Tracking
router.get('/tracking/real-time', fleetController.getRealTimeTracking);
router.get('/tracking/vehicle/:id', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601()
], validate_request_1.validateRequest, fleetController.getVehicleTracking);
router.post('/tracking/location-update', [
    (0, express_validator_1.body)('vehicleId').isMongoId(),
    (0, express_validator_1.body)('latitude').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('longitude').isFloat({ min: -180, max: 180 }),
    (0, express_validator_1.body)('speed').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('heading').optional().isFloat({ min: 0, max: 360 })
], validate_request_1.validateRequest, fleetController.updateLocation);
// Route Optimization
router.post('/routes/optimize', [
    (0, express_validator_1.body)('startLocation').notEmpty(),
    (0, express_validator_1.body)('destinations').isArray({ min: 1 }),
    (0, express_validator_1.body)('vehicleType').optional(),
    (0, express_validator_1.body)('preferences').optional()
], validate_request_1.validateRequest, fleetController.optimizeRoute);
router.get('/routes/history/:vehicleId', [
    (0, express_validator_1.param)('vehicleId').isMongoId(),
    (0, express_validator_1.query)('date').isISO8601()
], validate_request_1.validateRequest, fleetController.getRouteHistory);
// Fuel Management
router.post('/fuel/transactions', [
    (0, express_validator_1.body)('vehicleId').isMongoId(),
    (0, express_validator_1.body)('driverId').isMongoId(),
    (0, express_validator_1.body)('stationName').notEmpty(),
    (0, express_validator_1.body)('fuelType').isIn(['gasoline', 'diesel', 'electric', 'lpg', 'cng']),
    (0, express_validator_1.body)('quantity').isFloat({ min: 0 }),
    (0, express_validator_1.body)('costPerLiter').isFloat({ min: 0 }),
    (0, express_validator_1.body)('totalCost').isFloat({ min: 0 }),
    (0, express_validator_1.body)('odometer').isInt({ min: 0 })
], validate_request_1.validateRequest, fleetController.addFuelTransaction);
router.get('/fuel/transactions', [
    (0, express_validator_1.query)('vehicleId').optional().isMongoId(),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601()
], validate_request_1.validateRequest, fleetController.getFuelTransactions);
router.get('/fuel/efficiency/:vehicleId', [
    (0, express_validator_1.param)('vehicleId').isMongoId(),
    (0, express_validator_1.query)('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], validate_request_1.validateRequest, fleetController.getFuelEfficiency);
// Maintenance Management
router.post('/maintenance/schedule', [
    (0, express_validator_1.body)('vehicleId').isMongoId(),
    (0, express_validator_1.body)('type').isIn(['preventive', 'corrective', 'emergency']),
    (0, express_validator_1.body)('description').notEmpty(),
    (0, express_validator_1.body)('scheduledDate').isISO8601(),
    (0, express_validator_1.body)('estimatedCost').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('serviceProvider').optional()
], validate_request_1.validateRequest, fleetController.scheduleMaintenance);
router.get('/maintenance/schedule', [
    (0, express_validator_1.query)('vehicleId').optional().isMongoId(),
    (0, express_validator_1.query)('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601()
], validate_request_1.validateRequest, fleetController.getMaintenanceSchedule);
router.put('/maintenance/:id/complete', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('actualCost').isFloat({ min: 0 }),
    (0, express_validator_1.body)('notes').optional(),
    (0, express_validator_1.body)('nextServiceDue').optional().isISO8601()
], validate_request_1.validateRequest, fleetController.completeMaintenance);
// Compliance & Safety
router.post('/compliance/license', [
    (0, express_validator_1.body)('driverId').isMongoId(),
    (0, express_validator_1.body)('licenseType').notEmpty(),
    (0, express_validator_1.body)('licenseNumber').notEmpty(),
    (0, express_validator_1.body)('issueDate').isISO8601(),
    (0, express_validator_1.body)('expiryDate').isISO8601()
], validate_request_1.validateRequest, fleetController.addDriverLicense);
router.post('/compliance/insurance', [
    (0, express_validator_1.body)('vehicleId').isMongoId(),
    (0, express_validator_1.body)('provider').notEmpty(),
    (0, express_validator_1.body)('policyNumber').notEmpty(),
    (0, express_validator_1.body)('coverage').notEmpty(),
    (0, express_validator_1.body)('premium').isFloat({ min: 0 }),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601()
], validate_request_1.validateRequest, fleetController.addInsurance);
router.get('/compliance/expiring', [
    (0, express_validator_1.query)('type').isIn(['license', 'insurance', 'inspection']),
    (0, express_validator_1.query)('days').optional().isInt({ min: 1, max: 365 })
], validate_request_1.validateRequest, fleetController.getExpiringCompliance);
router.post('/violations', [
    (0, express_validator_1.body)('vehicleId').isMongoId(),
    (0, express_validator_1.body)('driverId').isMongoId(),
    (0, express_validator_1.body)('type').notEmpty(),
    (0, express_validator_1.body)('description').notEmpty(),
    (0, express_validator_1.body)('fineAmount').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('violationDate').isISO8601(),
    (0, express_validator_1.body)('location').optional()
], validate_request_1.validateRequest, fleetController.addViolation);
// Fleet Analytics
router.get('/analytics/overview', fleetController.getFleetOverview);
router.get('/analytics/costs', [
    (0, express_validator_1.query)('period').optional().isIn(['month', 'quarter', 'year'])
], validate_request_1.validateRequest, fleetController.getCostAnalysis);
router.get('/analytics/efficiency', fleetController.getEfficiencyMetrics);
router.get('/analytics/utilization', fleetController.getUtilizationReports);
router.get('/analytics/performance', fleetController.getPerformanceKPIs);
router.get('/analytics/dashboard', fleetController.getFleetDashboard);
// Geofencing
router.post('/geofences', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('coordinates').isArray({ min: 3 }),
    (0, express_validator_1.body)('type').isIn(['include', 'exclude']),
    (0, express_validator_1.body)('alertEnabled').isBoolean()
], validate_request_1.validateRequest, fleetController.createGeofence);
router.get('/geofences', fleetController.getGeofences);
router.get('/geofences/violations', fleetController.getGeofenceViolations);
//# sourceMappingURL=routes.js.map