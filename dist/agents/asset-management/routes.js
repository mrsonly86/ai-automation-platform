"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controller_1 = require("./controller");
const validate_request_1 = require("@shared/middleware/validate-request");
const auth_1 = require("@shared/middleware/auth");
const router = (0, express_1.Router)();
exports.assetRoutes = router;
const assetController = new controller_1.AssetController();
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Fixed Assets Management
router.post('/fixed-assets', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('category').notEmpty(),
    (0, express_validator_1.body)('purchasePrice').isNumeric(),
    (0, express_validator_1.body)('purchaseDate').isISO8601(),
    (0, express_validator_1.body)('location').notEmpty()
], validate_request_1.validateRequest, assetController.createFixedAsset);
router.get('/fixed-assets', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('category').optional(),
    (0, express_validator_1.query)('status').optional()
], validate_request_1.validateRequest, assetController.getFixedAssets);
router.get('/fixed-assets/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, assetController.getFixedAsset);
router.put('/fixed-assets/:id', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'maintenance', 'disposed', 'lost'])
], validate_request_1.validateRequest, assetController.updateFixedAsset);
router.delete('/fixed-assets/:id', [
    (0, express_validator_1.param)('id').isMongoId()
], validate_request_1.validateRequest, assetController.deleteFixedAsset);
// Asset Tracking
router.post('/tracking/rfid', [
    (0, express_validator_1.body)('assetId').isMongoId(),
    (0, express_validator_1.body)('rfidTag').notEmpty(),
    (0, express_validator_1.body)('location').notEmpty()
], validate_request_1.validateRequest, assetController.updateRFIDTracking);
router.post('/tracking/barcode', [
    (0, express_validator_1.body)('assetId').isMongoId(),
    (0, express_validator_1.body)('barcode').notEmpty(),
    (0, express_validator_1.body)('scannedBy').isMongoId()
], validate_request_1.validateRequest, assetController.scanBarcode);
router.get('/tracking/real-time/:assetId', [
    (0, express_validator_1.param)('assetId').isMongoId()
], validate_request_1.validateRequest, assetController.getRealTimeLocation);
// Maintenance Management
router.post('/maintenance/schedule', [
    (0, express_validator_1.body)('assetId').isMongoId(),
    (0, express_validator_1.body)('type').isIn(['preventive', 'corrective']),
    (0, express_validator_1.body)('scheduledDate').isISO8601(),
    (0, express_validator_1.body)('description').notEmpty()
], validate_request_1.validateRequest, assetController.scheduleMaintenance);
router.get('/maintenance/schedule', [
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('type').optional()
], validate_request_1.validateRequest, assetController.getMaintenanceSchedule);
router.put('/maintenance/:id/complete', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('notes').optional(),
    (0, express_validator_1.body)('cost').optional().isNumeric(),
    (0, express_validator_1.body)('completedBy').isMongoId()
], validate_request_1.validateRequest, assetController.completeMaintenance);
// Inventory Management
router.post('/inventory', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('sku').notEmpty(),
    (0, express_validator_1.body)('category').notEmpty(),
    (0, express_validator_1.body)('quantity').isInt({ min: 0 })
], validate_request_1.validateRequest, assetController.createInventoryItem);
router.get('/inventory', [
    (0, express_validator_1.query)('category').optional(),
    (0, express_validator_1.query)('lowStock').optional().isBoolean()
], validate_request_1.validateRequest, assetController.getInventory);
router.put('/inventory/:id/adjust', [
    (0, express_validator_1.param)('id').isMongoId(),
    (0, express_validator_1.body)('quantity').isInt(),
    (0, express_validator_1.body)('reason').notEmpty()
], validate_request_1.validateRequest, assetController.adjustInventory);
// Asset Analytics
router.get('/analytics/performance', assetController.getAssetPerformance);
router.get('/analytics/utilization', assetController.getUtilizationAnalysis);
router.get('/analytics/costs', assetController.getCostAnalysis);
router.get('/analytics/roi', assetController.getROICalculation);
//# sourceMappingURL=routes.js.map