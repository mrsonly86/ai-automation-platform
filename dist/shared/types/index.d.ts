export interface Enterprise {
    id: string;
    name: string;
    type: 'holding' | 'subsidiary' | 'branch' | 'representative';
    registrationNumber: string;
    taxCode: string;
    establishedDate: Date;
    legalRepresentative: Person;
    address: Address;
    parentCompany?: string;
    subsidiaries: string[];
    industry: Industry;
    status: 'active' | 'inactive' | 'suspended' | 'dissolved';
    compliance: ComplianceStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    citizenId: string;
    dateOfBirth: Date;
    address: Address;
}
export interface Address {
    street: string;
    ward: string;
    district: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface Industry {
    code: string;
    name: string;
    nameVi: string;
    sector: string;
    regulations: string[];
}
export interface ComplianceStatus {
    taxCompliance: boolean;
    laborCompliance: boolean;
    environmentalCompliance: boolean;
    industryCompliance: boolean;
    lastAuditDate: Date;
    nextAuditDate: Date;
    violations: Violation[];
}
export interface Violation {
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    authority: string;
    fineAmount?: number;
    status: 'pending' | 'resolved' | 'appealing';
    dateIssued: Date;
    dueDate: Date;
}
export interface AIAgent {
    id: string;
    name: string;
    type: AgentType;
    description: string;
    capabilities: string[];
    status: 'active' | 'inactive' | 'maintenance';
    configuration: AgentConfiguration;
    metrics: AgentMetrics;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum AgentType {
    CONTENT_CREATION = "content-creation",
    CUSTOMER_SERVICE = "customer-service",
    SALES_GENERATION = "sales-generation",
    DATA_ANALYSIS = "data-analysis",
    EMAIL_COMMUNICATION = "email-communication",
    SOCIAL_MEDIA = "social-media",
    PROJECT_MANAGEMENT = "project-management",
    QUALITY_ASSURANCE = "quality-assurance",
    BUSINESS_INTELLIGENCE = "business-intelligence",
    MARKETING_AUTOMATION = "marketing-automation",
    LEGAL_COMPLIANCE = "legal-compliance",
    FINANCIAL_PLANNING = "financial-planning",
    HR_MANAGEMENT = "hr-management",
    DOCUMENT_MANAGEMENT = "document-management",
    ASSET_MANAGEMENT = "asset-management",
    BUILDING_MANAGEMENT = "building-management",
    FLEET_MANAGEMENT = "fleet-management",
    MULTI_COMPANY = "multi-company"
}
export interface AgentConfiguration {
    automationLevel: 'manual' | 'semi-automatic' | 'automatic';
    workingHours: {
        start: string;
        end: string;
        timezone: string;
        workingDays: number[];
    };
    integrations: string[];
    permissions: string[];
    thresholds: Record<string, number>;
}
export interface AgentMetrics {
    tasksProcessed: number;
    successRate: number;
    averageProcessingTime: number;
    errorCount: number;
    lastExecuted: Date;
    performance: {
        efficiency: number;
        accuracy: number;
        reliability: number;
    };
}
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    permissions: Permission[];
    companies: string[];
    preferences: UserPreferences;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    SUPER_ADMIN = "super-admin",
    ENTERPRISE_ADMIN = "enterprise-admin",
    COMPANY_ADMIN = "company-admin",
    MANAGER = "manager",
    EMPLOYEE = "employee",
    VIEWER = "viewer"
}
export interface Permission {
    resource: string;
    actions: string[];
    scope: 'global' | 'company' | 'department' | 'self';
}
export interface UserPreferences {
    language: 'vi' | 'en';
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications: NotificationSettings;
}
export interface NotificationSettings {
    email: boolean;
    sms: boolean;
    push: boolean;
    types: string[];
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
    timestamp: string;
    requestId: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    stack?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
export interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    changes: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}
export interface SystemConfiguration {
    app: {
        name: string;
        version: string;
        environment: string;
    };
    database: {
        url: string;
        poolSize: number;
        timeout: number;
    };
    security: {
        jwtSecret: string;
        sessionTimeout: number;
        maxLoginAttempts: number;
    };
    integrations: Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map