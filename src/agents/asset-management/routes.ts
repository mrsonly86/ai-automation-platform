import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AssetController } from './controller';
import { validateRequest } from '@shared/middleware/validate-request';
import { authenticateToken } from '@shared/middleware/auth';

const router = Router();
const assetController = new AssetController();

// Apply authentication to all routes
router.use(authenticateToken);

// Fixed Assets Management
router.post('/fixed-assets', [
  body('name').notEmpty().trim(),
  body('category').notEmpty(),
  body('purchasePrice').isNumeric(),
  body('purchaseDate').isISO8601(),
  body('location').notEmpty()
], validateRequest, assetController.createFixedAsset);

router.get('/fixed-assets', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional(),
  query('status').optional()
], validateRequest, assetController.getFixedAssets);

router.get('/fixed-assets/:id', [
  param('id').isMongoId()
], validateRequest, assetController.getFixedAsset);

router.put('/fixed-assets/:id', [
  param('id').isMongoId(),
  body('name').optional().trim(),
  body('status').optional().isIn(['active', 'maintenance', 'disposed', 'lost'])
], validateRequest, assetController.updateFixedAsset);

router.delete('/fixed-assets/:id', [
  param('id').isMongoId()
], validateRequest, assetController.deleteFixedAsset);

// Asset Tracking
router.post('/tracking/rfid', [
  body('assetId').isMongoId(),
  body('rfidTag').notEmpty(),
  body('location').notEmpty()
], validateRequest, assetController.updateRFIDTracking);

router.post('/tracking/barcode', [
  body('assetId').isMongoId(),
  body('barcode').notEmpty(),
  body('scannedBy').isMongoId()
], validateRequest, assetController.scanBarcode);

router.get('/tracking/real-time/:assetId', [
  param('assetId').isMongoId()
], validateRequest, assetController.getRealTimeLocation);

// Maintenance Management
router.post('/maintenance/schedule', [
  body('assetId').isMongoId(),
  body('type').isIn(['preventive', 'corrective']),
  body('scheduledDate').isISO8601(),
  body('description').notEmpty()
], validateRequest, assetController.scheduleMaintenance);

router.get('/maintenance/schedule', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional()
], validateRequest, assetController.getMaintenanceSchedule);

router.put('/maintenance/:id/complete', [
  param('id').isMongoId(),
  body('notes').optional(),
  body('cost').optional().isNumeric(),
  body('completedBy').isMongoId()
], validateRequest, assetController.completeMaintenance);

// Inventory Management
router.post('/inventory', [
  body('name').notEmpty().trim(),
  body('sku').notEmpty(),
  body('category').notEmpty(),
  body('quantity').isInt({ min: 0 })
], validateRequest, assetController.createInventoryItem);

router.get('/inventory', [
  query('category').optional(),
  query('lowStock').optional().isBoolean()
], validateRequest, assetController.getInventory);

router.put('/inventory/:id/adjust', [
  param('id').isMongoId(),
  body('quantity').isInt(),
  body('reason').notEmpty()
], validateRequest, assetController.adjustInventory);

// Asset Analytics
router.get('/analytics/performance', assetController.getAssetPerformance);
router.get('/analytics/utilization', assetController.getUtilizationAnalysis);
router.get('/analytics/costs', assetController.getCostAnalysis);
router.get('/analytics/roi', assetController.getROICalculation);

export { router as assetRoutes };