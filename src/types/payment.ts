export interface PaymentGateway {
  id: string;
  name: string;
  provider: PaymentProvider;
  isActive: boolean;
  supportedCurrencies: string[];
  supportedMethods: PaymentMethod[];
  configuration: PaymentGatewayConfig;
}

export enum PaymentProvider {
  VNPAY = 'vnpay',
  ZALOPAY = 'zalopay',
  MOMO = 'momo',
  VIETCOMBANK = 'vietcombank',
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  QR_CODE = 'qr_code',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  E_WALLET = 'e_wallet',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  INTERNET_BANKING = 'internet_banking'
}

export interface PaymentGatewayConfig {
  merchantId: string;
  secretKey: string;
  apiKey?: string;
  webhookUrl: string;
  returnUrl: string;
  environment: 'sandbox' | 'production';
  timeout: number; // seconds
}

export interface PaymentRequest {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customer: CustomerInfo;
  items?: PaymentItem[];
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  expiresAt?: Date;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: AddressInfo;
  nationalId?: string;
  taxCode?: string;
}

export interface AddressInfo {
  street: string;
  city: string;
  district: string;
  ward: string;
  postalCode: string;
  country: string;
}

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  redirectUrl?: string;
  qrCode?: string;
  message: string;
  errorCode?: string;
  data?: any;
}

export interface PaymentStatus {
  paymentId: string;
  orderId: string;
  status: PaymentStatusType;
  amount: number;
  currency: string;
  paidAmount?: number;
  transactionId?: string;
  gatewayTransactionId?: string;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  failureReason?: string;
  refunds?: PaymentRefund[];
}

export enum PaymentStatusType {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  refundedAt?: Date;
  createdAt: Date;
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface PaymentWebhook {
  id: string;
  paymentId: string;
  event: WebhookEvent;
  data: any;
  signature: string;
  receivedAt: Date;
  processed: boolean;
  processingError?: string;
}

export enum WebhookEvent {
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  REFUND_COMPLETED = 'refund.completed',
  REFUND_FAILED = 'refund.failed'
}

export interface VietnamesePaymentOptions {
  enableVNPay: boolean;
  enableZaloPay: boolean;
  enableMoMo: boolean;
  enableBanking: boolean;
  enableCOD: boolean;
  preferredLanguage: 'vi' | 'en';
  vatIncluded: boolean;
  vatRate: number; // Vietnam VAT rate (usually 10%)
  businessLicense?: string;
  taxCode?: string;
}

export interface VietnamTaxCalculation {
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  taxCode?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  averageAmount: number;
  topPaymentMethods: PaymentMethodStats[];
  failureReasons: FailureReasonStats[];
  dailyTrends: DailyPaymentTrend[];
  monthlyTrends: MonthlyPaymentTrend[];
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  provider: PaymentProvider;
  count: number;
  amount: number;
  successRate: number;
  averageProcessingTime: number; // seconds
}

export interface FailureReasonStats {
  reason: string;
  count: number;
  percentage: number;
}

export interface DailyPaymentTrend {
  date: Date;
  transactions: number;
  amount: number;
  successRate: number;
}

export interface MonthlyPaymentTrend {
  month: string;
  year: number;
  transactions: number;
  amount: number;
  successRate: number;
  growth: number; // percentage
}