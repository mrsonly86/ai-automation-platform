import { Request, Response, NextFunction } from 'express';
export interface Facility {
    id: string;
    name: string;
    address: string;
    type: FacilityType;
    totalFloors: number;
    totalArea: number;
    capacity: number;
    amenities: string[];
    hvacSystems: HVACSystem[];
    lightingSystems: LightingSystem[];
    securitySystems: SecuritySystem[];
    spaces: Space[];
    energyMetrics: EnergyMetrics;
    status: 'active' | 'maintenance' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}
export declare enum FacilityType {
    OFFICE = "office",
    WAREHOUSE = "warehouse",
    FACTORY = "factory",
    RETAIL = "retail",
    MIXED = "mixed"
}
export interface HVACSystem {
    id: string;
    name: string;
    zones: HVACZone[];
    type: 'central' | 'split' | 'vrf';
    capacity: number;
    efficiency: number;
    status: 'online' | 'offline' | 'maintenance';
    lastMaintenance: Date;
    nextMaintenance: Date;
}
export interface HVACZone {
    id: string;
    name: string;
    floor: number;
    areas: string[];
    currentTemperature: number;
    targetTemperature: number;
    humidity: number;
    airQuality: number;
    occupancy: number;
    schedule: ScheduleRule[];
}
export interface LightingSystem {
    id: string;
    name: string;
    zones: LightingZone[];
    type: 'led' | 'fluorescent' | 'halogen' | 'smart';
    powerConsumption: number;
    status: 'on' | 'off' | 'dimmed' | 'auto';
}
export interface LightingZone {
    id: string;
    name: string;
    brightness: number;
    schedule: ScheduleRule[];
    motionSensor: boolean;
    lightSensor: boolean;
    occupancyBased: boolean;
}
export interface SecuritySystem {
    id: string;
    name: string;
    type: 'access-control' | 'cctv' | 'alarm' | 'fire-safety';
    zones: SecurityZone[];
    status: 'armed' | 'disarmed' | 'partial' | 'alarm';
}
export interface SecurityZone {
    id: string;
    name: string;
    accessLevels: AccessLevel[];
    cameras: Camera[];
    sensors: Sensor[];
}
export interface AccessLevel {
    level: 'visitor' | 'employee' | 'manager' | 'admin';
    permissions: string[];
    timeRestrictions: TimeRestriction[];
}
export interface Camera {
    id: string;
    location: string;
    type: 'fixed' | 'ptz' | 'dome';
    resolution: string;
    nightVision: boolean;
    recording: boolean;
}
export interface Sensor {
    id: string;
    type: 'motion' | 'door' | 'window' | 'smoke' | 'temperature';
    status: 'normal' | 'triggered' | 'fault';
    lastTriggered?: Date;
}
export interface Space {
    id: string;
    name: string;
    type: SpaceType;
    floor: number;
    area: number;
    capacity: number;
    amenities: string[];
    bookingEnabled: boolean;
    currentOccupancy: number;
    reservations: Reservation[];
}
export declare enum SpaceType {
    DESK = "desk",
    MEETING_ROOM = "meeting-room",
    CONFERENCE_ROOM = "conference-room",
    PHONE_BOOTH = "phone-booth",
    LOUNGE = "lounge",
    CAFETERIA = "cafeteria",
    PARKING = "parking"
}
export interface Reservation {
    id: string;
    userId: string;
    spaceId: string;
    title?: string;
    startTime: Date;
    endTime: Date;
    attendees?: string[];
    status: 'confirmed' | 'cancelled' | 'completed';
    createdAt: Date;
}
export interface EnergyMetrics {
    totalConsumption: number;
    hvacConsumption: number;
    lightingConsumption: number;
    equipmentConsumption: number;
    renewableGeneration: number;
    efficiency: number;
    cost: number;
    carbonFootprint: number;
}
export interface WorkOrder {
    id: string;
    facilityId: string;
    type: MaintenanceType;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    title: string;
    description: string;
    location: string;
    reportedBy: string;
    assignedTo?: string;
    contractorId?: string;
    status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
    estimatedCost: number;
    actualCost?: number;
    estimatedCompletionDate?: Date;
    completedDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum MaintenanceType {
    ELECTRICAL = "electrical",
    PLUMBING = "plumbing",
    HVAC = "hvac",
    CLEANING = "cleaning",
    SECURITY = "security",
    GENERAL = "general"
}
export interface ScheduleRule {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    value: number;
    enabled: boolean;
}
export interface TimeRestriction {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
}
export interface Visitor {
    id: string;
    name: string;
    company: string;
    contactNumber: string;
    hostEmployeeId: string;
    purpose: string;
    facilityId: string;
    checkInTime: Date;
    expectedCheckOutTime: Date;
    actualCheckOutTime?: Date;
    badgeNumber?: string;
    photoId?: string;
    status: 'checked-in' | 'checked-out' | 'expired';
}
export declare class BuildingController {
    createFacility(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFacilities(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFacility(req: Request, res: Response, next: NextFunction): Promise<void>;
    controlHVAC(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHVACStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    controlLighting(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLightingStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    grantAccess(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAccessLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    bookDesk(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDeskAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
    bookMeetingRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
    reserveParking(req: Request, res: Response, next: NextFunction): Promise<void>;
    getParkingAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
    registerVisitor(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveVisitors(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEnergyConsumption(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEnergyOptimization(req: Request, res: Response, next: NextFunction): Promise<void>;
    createWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWorkOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOccupancyAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSpaceUtilization(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEnergyEfficiency(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFacilityDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=controller.d.ts.map