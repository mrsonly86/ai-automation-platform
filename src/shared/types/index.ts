// Vietnam E-Invoice Types
export interface VietnamInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  taxCode: string;
  customerInfo: CustomerInfo;
  items: InvoiceItem[];
  taxDetails: TaxDetails;
  totalAmount: number;
  digitalSignature?: string;
  submissionStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  governmentResponse?: GovernmentResponse;
}

export interface CustomerInfo {
  name: string;
  taxCode?: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  amount: number;
  vatAmount: number;
}

export interface TaxDetails {
  vatAmount: number;
  corporateTax?: number;
  personalIncomeTax?: number;
  otherTaxes?: number;
  totalTax: number;
}

export interface GovernmentResponse {
  transactionId: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  auditCode?: string;
}

// Vietnamese Voice Assistant Types
export interface VoiceCommand {
  id: string;
  text: string;
  intent: string;
  entities: VoiceEntity[];
  confidence: number;
  dialect: 'north' | 'central' | 'south';
  timestamp: string;
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
  audio?: ArrayBuffer;
  actions?: VoiceAction[];
  confidence: number;
}

export interface VoiceAction {
  type: 'navigate' | 'query' | 'report' | 'approve' | 'emergency';
  parameters: Record<string, any>;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: string[];
  dialect?: string;
}

export interface VoiceAnalytics {
  userId: string;
  sessionId: string;
  commandCount: number;
  accuracy: number;
  avgResponseTime: number;
  errors: number;
  timestamp: string;
}

// Common Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}