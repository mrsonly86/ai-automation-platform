// Common types for the AI Automation Platform

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Predictive Analytics Types
export interface PredictionData {
  timestamp: Date;
  value: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface EquipmentData extends BaseEntity {
  equipmentId: string;
  type: string;
  status: 'operational' | 'maintenance' | 'failed';
  sensors: SensorReading[];
  maintenanceHistory: MaintenanceRecord[];
}

export interface SensorReading {
  sensorId: string;
  type: 'temperature' | 'vibration' | 'pressure' | 'humidity' | 'current';
  value: number;
  unit: string;
  timestamp: Date;
}

export interface MaintenanceRecord {
  date: Date;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  cost: number;
  duration: number; // in hours
}

export interface FailurePrediction {
  equipmentId: string;
  predictionDate: Date;
  failureProbability: number;
  timeToFailure: number; // days
  recommendedActions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BusinessForecast {
  type: 'revenue' | 'expenses' | 'cashflow' | 'demand';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  predictions: PredictionData[];
  accuracy: number;
  trends: string[];
}

// E-Invoice Types
export interface VietnamEInvoice extends BaseEntity {
  invoiceNumber: string;
  invoiceType: 'VAT' | 'Standard' | 'Export';
  issueDate: Date;
  taxCode: string;
  customerInfo: CustomerInfo;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  taxDetails: TaxDetail[];
  digitalSignature: string;
  submissionStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  governmentResponse?: GovernmentResponse;
}

export interface CustomerInfo {
  name: string;
  taxCode?: string;
  address: string;
  phone?: string;
  email?: string;
  bankAccount?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalVAT: number;
  totalAmount: number;
  discountAmount?: number;
}

export interface TaxDetail {
  taxType: 'VAT' | 'Import' | 'Excise' | 'Environment';
  rate: number;
  amount: number;
  description: string;
}

export interface GovernmentResponse {
  submissionId: string;
  status: 'accepted' | 'rejected' | 'pending';
  message: string;
  timestamp: Date;
  lookupCode?: string;
}

// Voice Assistant Types
export interface VoiceCommand {
  command: string;
  intent: string;
  entities: VoiceEntity[];
  confidence: number;
  dialect: 'northern' | 'central' | 'southern';
  userId: string;
  timestamp: Date;
}

export interface VoiceEntity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface VoiceResponse {
  text: string;
  audioUrl?: string;
  actions?: VoiceAction[];
  context?: Record<string, unknown>;
}

export interface VoiceAction {
  type: 'navigate' | 'execute' | 'query' | 'report';
  target: string;
  parameters?: Record<string, unknown>;
}

export interface BusinessVocabulary {
  term: string;
  category: 'finance' | 'hr' | 'operations' | 'legal';
  synonyms: string[];
  definition: string;
  examples: string[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// System Types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  timestamp: Date;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: Date;
  details?: string;
}