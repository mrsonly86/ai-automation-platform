import { Request, Response, NextFunction } from 'express';
export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin?: string;
    type: VehicleType;
    fuelType: FuelType;
    capacity: VehicleCapacity;
    specifications: VehicleSpecifications;
    status: VehicleStatus;
    condition: VehicleCondition;
    assignment?: VehicleAssignment;
    tracking: TrackingDevice;
    maintenance: MaintenanceInfo;
    insurance: InsuranceInfo;
    costs: VehicleCosts;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum VehicleType {
    CAR = "car",
    TRUCK = "truck",
    VAN = "van",
    MOTORCYCLE = "motorcycle",
    BUS = "bus",
    OTHER = "other"
}
export declare enum FuelType {
    GASOLINE = "gasoline",
    DIESEL = "diesel",
    ELECTRIC = "electric",
    LPG = "lpg",
    CNG = "cng",
    HYBRID = "hybrid"
}
export declare enum VehicleStatus {
    ACTIVE = "active",
    MAINTENANCE = "maintenance",
    OUT_OF_SERVICE = "out-of-service",
    RETIRED = "retired"
}
export declare enum VehicleCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor"
}
export interface VehicleCapacity {
    passengers: number;
    cargoWeight: number;
    cargoVolume: number;
}
export interface VehicleSpecifications {
    engine: string;
    transmission: string;
    fuelTankCapacity: number;
    mileage: number;
    color: string;
    doors: number;
}
export interface VehicleAssignment {
    driverId: string;
    type: 'permanent' | 'temporary' | 'pool';
    startDate: Date;
    endDate?: Date;
    purpose: string;
}
export interface TrackingDevice {
    deviceId: string;
    provider: string;
    status: 'active' | 'inactive' | 'offline';
    lastUpdate: Date;
    currentLocation?: Location;
    features: string[];
}
export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
    speed?: number;
    heading?: number;
    altitude?: number;
    timestamp: Date;
}
export interface MaintenanceInfo {
    lastServiceDate?: Date;
    nextServiceDate?: Date;
    serviceInterval: number;
    currentMileage: number;
    warrantyExpiry?: Date;
    serviceHistory: ServiceRecord[];
}
export interface ServiceRecord {
    id: string;
    type: 'preventive' | 'corrective' | 'emergency';
    description: string;
    serviceDate: Date;
    mileage: number;
    cost: number;
    serviceProvider: string;
    partsReplaced: string[];
    nextServiceDue?: Date;
    warranty?: {
        parts: Date;
        labor: Date;
    };
}
export interface InsuranceInfo {
    provider: string;
    policyNumber: string;
    coverage: string[];
    premium: number;
    startDate: Date;
    endDate: Date;
    deductible: number;
    claimHistory: InsuranceClaim[];
}
export interface InsuranceClaim {
    id: string;
    claimNumber: string;
    incidentDate: Date;
    claimDate: Date;
    type: string;
    description: string;
    amount: number;
    status: 'pending' | 'approved' | 'denied' | 'closed';
    resolution?: string;
}
export interface VehicleCosts {
    purchasePrice: number;
    currentValue: number;
    totalFuelCost: number;
    totalMaintenanceCost: number;
    totalInsuranceCost: number;
    totalOperatingCost: number;
    costPerKilometer: number;
}
export interface Driver {
    id: string;
    employeeId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    hireDate: Date;
    status: DriverStatus;
    licenses: DriverLicense[];
    assignedVehicles: string[];
    performance: DriverPerformance;
    violations: TrafficViolation[];
    createdAt: Date;
    updatedAt: Date;
}
export declare enum DriverStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    TERMINATED = "terminated"
}
export interface DriverLicense {
    type: string;
    number: string;
    issueDate: Date;
    expiryDate: Date;
    issuingAuthority: string;
    restrictions?: string[];
}
export interface DriverPerformance {
    totalDistance: number;
    totalDrivingHours: number;
    averageSpeed: number;
    fuelEfficiency: number;
    safetyScore: number;
    violationCount: number;
    accidentCount: number;
    onTimePercentage: number;
}
export interface TrafficViolation {
    id: string;
    type: string;
    description: string;
    violationDate: Date;
    location: string;
    fineAmount: number;
    points: number;
    status: 'pending' | 'paid' | 'contested' | 'dismissed';
    vehicleId: string;
}
export interface FuelTransaction {
    id: string;
    vehicleId: string;
    driverId: string;
    transactionDate: Date;
    stationName: string;
    stationLocation: string;
    fuelType: FuelType;
    quantity: number;
    costPerLiter: number;
    totalCost: number;
    odometer: number;
    efficiency?: number;
    receiptNumber?: string;
}
export interface Route {
    id: string;
    name: string;
    startLocation: Location;
    endLocation: Location;
    waypoints: Location[];
    estimatedDistance: number;
    estimatedDuration: number;
    actualDistance?: number;
    actualDuration?: number;
    trafficConditions: string;
    optimized: boolean;
    createdAt: Date;
}
export interface Geofence {
    id: string;
    name: string;
    description?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    }[];
    type: 'include' | 'exclude';
    alertEnabled: boolean;
    vehicles: string[];
    violations: GeofenceViolation[];
    createdAt: Date;
}
export interface GeofenceViolation {
    id: string;
    vehicleId: string;
    driverId: string;
    geofenceId: string;
    violationType: 'entry' | 'exit';
    timestamp: Date;
    location: Location;
    duration?: number;
    acknowledged: boolean;
}
export declare class FleetController {
    createVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVehicles(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    unassignVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    createDriver(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDrivers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDriver(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRealTimeTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVehicleTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateLocation(req: Request, res: Response, next: NextFunction): Promise<void>;
    optimizeRoute(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRouteHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    addFuelTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFuelTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFuelEfficiency(req: Request, res: Response, next: NextFunction): Promise<void>;
    scheduleMaintenance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMaintenanceSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    completeMaintenance(req: Request, res: Response, next: NextFunction): Promise<void>;
    addDriverLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
    addInsurance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getExpiringCompliance(req: Request, res: Response, next: NextFunction): Promise<void>;
    addViolation(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFleetOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCostAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEfficiencyMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUtilizationReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPerformanceKPIs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFleetDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    createGeofence(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGeofences(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGeofenceViolations(req: Request, res: Response, next: NextFunction): Promise<void>;
    private calculateViolationPoints;
}
//# sourceMappingURL=controller.d.ts.map