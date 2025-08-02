import { Request, Response, NextFunction } from 'express';
export interface FixedAsset {
    id: string;
    name: string;
    category: AssetCategory;
    assetTag: string;
    serialNumber?: string;
    model?: string;
    manufacturer?: string;
    purchasePrice: number;
    currentValue: number;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    location: AssetLocation;
    assignedTo?: string;
    status: AssetStatus;
    condition: AssetCondition;
    depreciation: DepreciationInfo;
    maintenance: MaintenanceInfo;
    tracking: TrackingInfo;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum AssetCategory {
    EQUIPMENT = "equipment",
    FURNITURE = "furniture",
    VEHICLE = "vehicle",
    IT_HARDWARE = "it-hardware",
    BUILDING = "building",
    MACHINERY = "machinery",
    TOOLS = "tools"
}
export declare enum AssetStatus {
    ACTIVE = "active",
    MAINTENANCE = "maintenance",
    DISPOSED = "disposed",
    LOST = "lost",
    RESERVED = "reserved"
}
export declare enum AssetCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    DAMAGED = "damaged"
}
export interface AssetLocation {
    building: string;
    floor?: string;
    room?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface DepreciationInfo {
    method: 'straight-line' | 'declining-balance' | 'units-of-production';
    usefulLife: number;
    salvageValue: number;
    annualDepreciation: number;
    accumulatedDepreciation: number;
}
export interface MaintenanceInfo {
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    maintenanceInterval: number;
    totalMaintenanceCost: number;
    maintenanceHistory: MaintenanceRecord[];
}
export interface MaintenanceRecord {
    id: string;
    type: 'preventive' | 'corrective' | 'emergency';
    description: string;
    scheduledDate: Date;
    completedDate?: Date;
    cost: number;
    performedBy: string;
    notes?: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}
export interface TrackingInfo {
    rfidTag?: string;
    barcode?: string;
    gpsEnabled: boolean;
    lastTrackedLocation?: AssetLocation;
    lastTrackedDate?: Date;
    iotSensors: IoTSensor[];
}
export interface IoTSensor {
    id: string;
    type: 'temperature' | 'humidity' | 'vibration' | 'pressure' | 'usage';
    value: number;
    unit: string;
    lastReading: Date;
    thresholds: {
        min?: number;
        max?: number;
    };
}
export declare class AssetController {
    createFixedAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFixedAssets(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFixedAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateFixedAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteFixedAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRFIDTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    scanBarcode(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRealTimeLocation(req: Request, res: Response, next: NextFunction): Promise<void>;
    scheduleMaintenance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMaintenanceSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    completeMaintenance(req: Request, res: Response, next: NextFunction): Promise<void>;
    createInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
    adjustInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAssetPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUtilizationAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCostAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    getROICalculation(req: Request, res: Response, next: NextFunction): Promise<void>;
    private generateAssetTag;
    private calculateDepreciation;
}
//# sourceMappingURL=controller.d.ts.map