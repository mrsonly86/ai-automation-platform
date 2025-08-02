import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { FleetController } from './controller';
import { validateRequest } from '@shared/middleware/validate-request';
import { authenticateToken } from '@shared/middleware/auth';

const router = Router();
const fleetController = new FleetController();

// Apply authentication to all routes
router.use(authenticateToken);

// Vehicle Operations
router.post('/vehicles', [
  body('make').notEmpty().trim(),
  body('model').notEmpty().trim(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('licensePlate').notEmpty().trim(),
  body('vin').optional().isLength({ min: 17, max: 17 }),
  body('type').isIn(['car', 'truck', 'van', 'motorcycle', 'bus', 'other'])
], validateRequest, fleetController.createVehicle);

router.get('/vehicles', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional(),
  query('status').optional()
], validateRequest, fleetController.getVehicles);

router.get('/vehicles/:id', [
  param('id').isMongoId()
], validateRequest, fleetController.getVehicle);

router.put('/vehicles/:id', [
  param('id').isMongoId()
], validateRequest, fleetController.updateVehicle);

router.delete('/vehicles/:id', [
  param('id').isMongoId()
], validateRequest, fleetController.deleteVehicle);

// Vehicle Assignment
router.post('/vehicles/:id/assign', [
  param('id').isMongoId(),
  body('driverId').isMongoId(),
  body('assignmentType').isIn(['permanent', 'temporary', 'pool']),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601()
], validateRequest, fleetController.assignVehicle);

router.post('/vehicles/:id/unassign', [
  param('id').isMongoId()
], validateRequest, fleetController.unassignVehicle);

// Driver Management
router.post('/drivers', [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isMobilePhone('vi-VN'),
  body('licenseNumber').notEmpty(),
  body('licenseExpiry').isISO8601(),
  body('employeeId').optional()
], validateRequest, fleetController.createDriver);

router.get('/drivers', fleetController.getDrivers);
router.get('/drivers/:id', [
  param('id').isMongoId()
], validateRequest, fleetController.getDriver);

// Real-time Tracking
router.get('/tracking/real-time', fleetController.getRealTimeTracking);
router.get('/tracking/vehicle/:id', [
  param('id').isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validateRequest, fleetController.getVehicleTracking);

router.post('/tracking/location-update', [
  body('vehicleId').isMongoId(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('speed').optional().isFloat({ min: 0 }),
  body('heading').optional().isFloat({ min: 0, max: 360 })
], validateRequest, fleetController.updateLocation);

// Route Optimization
router.post('/routes/optimize', [
  body('startLocation').notEmpty(),
  body('destinations').isArray({ min: 1 }),
  body('vehicleType').optional(),
  body('preferences').optional()
], validateRequest, fleetController.optimizeRoute);

router.get('/routes/history/:vehicleId', [
  param('vehicleId').isMongoId(),
  query('date').isISO8601()
], validateRequest, fleetController.getRouteHistory);

// Fuel Management
router.post('/fuel/transactions', [
  body('vehicleId').isMongoId(),
  body('driverId').isMongoId(),
  body('stationName').notEmpty(),
  body('fuelType').isIn(['gasoline', 'diesel', 'electric', 'lpg', 'cng']),
  body('quantity').isFloat({ min: 0 }),
  body('costPerLiter').isFloat({ min: 0 }),
  body('totalCost').isFloat({ min: 0 }),
  body('odometer').isInt({ min: 0 })
], validateRequest, fleetController.addFuelTransaction);

router.get('/fuel/transactions', [
  query('vehicleId').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validateRequest, fleetController.getFuelTransactions);

router.get('/fuel/efficiency/:vehicleId', [
  param('vehicleId').isMongoId(),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], validateRequest, fleetController.getFuelEfficiency);

// Maintenance Management
router.post('/maintenance/schedule', [
  body('vehicleId').isMongoId(),
  body('type').isIn(['preventive', 'corrective', 'emergency']),
  body('description').notEmpty(),
  body('scheduledDate').isISO8601(),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('serviceProvider').optional()
], validateRequest, fleetController.scheduleMaintenance);

router.get('/maintenance/schedule', [
  query('vehicleId').optional().isMongoId(),
  query('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validateRequest, fleetController.getMaintenanceSchedule);

router.put('/maintenance/:id/complete', [
  param('id').isMongoId(),
  body('actualCost').isFloat({ min: 0 }),
  body('notes').optional(),
  body('nextServiceDue').optional().isISO8601()
], validateRequest, fleetController.completeMaintenance);

// Compliance & Safety
router.post('/compliance/license', [
  body('driverId').isMongoId(),
  body('licenseType').notEmpty(),
  body('licenseNumber').notEmpty(),
  body('issueDate').isISO8601(),
  body('expiryDate').isISO8601()
], validateRequest, fleetController.addDriverLicense);

router.post('/compliance/insurance', [
  body('vehicleId').isMongoId(),
  body('provider').notEmpty(),
  body('policyNumber').notEmpty(),
  body('coverage').notEmpty(),
  body('premium').isFloat({ min: 0 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], validateRequest, fleetController.addInsurance);

router.get('/compliance/expiring', [
  query('type').isIn(['license', 'insurance', 'inspection']),
  query('days').optional().isInt({ min: 1, max: 365 })
], validateRequest, fleetController.getExpiringCompliance);

router.post('/violations', [
  body('vehicleId').isMongoId(),
  body('driverId').isMongoId(),
  body('type').notEmpty(),
  body('description').notEmpty(),
  body('fineAmount').optional().isFloat({ min: 0 }),
  body('violationDate').isISO8601(),
  body('location').optional()
], validateRequest, fleetController.addViolation);

// Fleet Analytics
router.get('/analytics/overview', fleetController.getFleetOverview);
router.get('/analytics/costs', [
  query('period').optional().isIn(['month', 'quarter', 'year'])
], validateRequest, fleetController.getCostAnalysis);

router.get('/analytics/efficiency', fleetController.getEfficiencyMetrics);
router.get('/analytics/utilization', fleetController.getUtilizationReports);
router.get('/analytics/performance', fleetController.getPerformanceKPIs);
router.get('/analytics/dashboard', fleetController.getFleetDashboard);

// Geofencing
router.post('/geofences', [
  body('name').notEmpty().trim(),
  body('description').optional(),
  body('coordinates').isArray({ min: 3 }),
  body('type').isIn(['include', 'exclude']),
  body('alertEnabled').isBoolean()
], validateRequest, fleetController.createGeofence);

router.get('/geofences', fleetController.getGeofences);
router.get('/geofences/violations', fleetController.getGeofenceViolations);

export { router as fleetRoutes };