import crypto from 'crypto';
import axios from 'axios';
import { 
  PaymentGateway, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus,
  PaymentStatusType,
  PaymentMethod,
  PaymentProvider,
  VietnamTaxCalculation,
  PaymentWebhook,
  WebhookEvent
} from '@/types/payment';

/**
 * VNPay Payment Gateway Integration
 * Implements VNPay payment processing for Vietnamese market
 */
export class VNPayIntegration {
  
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly apiUrl: string;
  private readonly version: string = '2.1.0';
  private readonly command: string = 'pay';
  private readonly currCode: string = 'VND';
  private readonly locale: string = 'vn';

  constructor() {
    this.tmnCode = process.env.VNPAY_TMN_CODE || '';
    this.hashSecret = process.env.VNPAY_HASH_SECRET || '';
    this.apiUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    
    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('VNPay credentials not configured');
    }
  }

  /**
   * Create VNPay payment request
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const vnpParams = this.buildVNPayParams(paymentRequest);
      const sortedParams = this.sortParams(vnpParams);
      const signData = this.createSignData(sortedParams);
      const secureHash = this.createSecureHash(signData);
      
      sortedParams.vnp_SecureHash = secureHash;
      
      const paymentUrl = this.buildPaymentUrl(sortedParams);
      
      return {
        success: true,
        paymentId: paymentRequest.id,
        redirectUrl: paymentUrl,
        message: 'Chuyển hướng đến VNPay để thanh toán',
        data: {
          vnpParams: sortedParams,
          expiresAt: paymentRequest.expiresAt
        }
      };
    } catch (error) {
      console.error('VNPay payment creation failed:', error);
      return {
        success: false,
        paymentId: paymentRequest.id,
        message: 'Không thể tạo thanh toán VNPay',
        errorCode: 'VNPAY_CREATE_FAILED'
      };
    }
  }

  /**
   * Build VNPay parameters
   */
  private buildVNPayParams(paymentRequest: PaymentRequest): Record<string, string> {
    const createDate = new Date();
    const expireDate = paymentRequest.expiresAt || new Date(createDate.getTime() + 15 * 60 * 1000); // 15 minutes default
    
    return {
      vnp_Version: this.version,
      vnp_Command: this.command,
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: (paymentRequest.amount * 100).toString(), // VNPay expects amount in VND cents
      vnp_CurrCode: this.currCode,
      vnp_TxnRef: paymentRequest.orderId,
      vnp_OrderInfo: this.formatOrderInfo(paymentRequest.description),
      vnp_OrderType: this.getOrderType(paymentRequest),
      vnp_Locale: this.locale,
      vnp_ReturnUrl: paymentRequest.returnUrl || process.env.VNPAY_RETURN_URL || '',
      vnp_IpAddr: this.getClientIP(),
      vnp_CreateDate: this.formatDate(createDate),
      vnp_ExpireDate: this.formatDate(expireDate),
      vnp_BankCode: '', // Let user choose bank
      // Additional Vietnamese-specific fields
      vnp_Bill_Mobile: paymentRequest.customer.phone,
      vnp_Bill_Email: paymentRequest.customer.email,
      vnp_Bill_FirstName: this.getFirstName(paymentRequest.customer.name),
      vnp_Bill_LastName: this.getLastName(paymentRequest.customer.name),
      vnp_Bill_Address: paymentRequest.customer.address?.street || '',
      vnp_Bill_City: paymentRequest.customer.address?.city || '',
      vnp_Bill_Country: 'VN'
    };
  }

  /**
   * Process VNPay callback/return
   */
  async processCallback(callbackParams: Record<string, string>): Promise<PaymentStatus> {
    try {
      // Verify secure hash
      const isValidHash = this.verifySecureHash(callbackParams);
      if (!isValidHash) {
        throw new Error('Invalid secure hash');
      }

      const vnpTransactionStatus = callbackParams.vnp_TransactionStatus;
      const vnpResponseCode = callbackParams.vnp_ResponseCode;
      
      let paymentStatus: PaymentStatusType;
      let failureReason: string | undefined;

      if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
        paymentStatus = PaymentStatusType.COMPLETED;
      } else {
        paymentStatus = PaymentStatusType.FAILED;
        failureReason = this.getVNPayErrorMessage(vnpResponseCode);
      }

      const paymentAmount = parseInt(callbackParams.vnp_Amount) / 100; // Convert from cents

      return {
        paymentId: callbackParams.vnp_TxnRef,
        orderId: callbackParams.vnp_TxnRef,
        status: paymentStatus,
        amount: paymentAmount,
        currency: this.currCode,
        paidAmount: paymentStatus === PaymentStatusType.COMPLETED ? paymentAmount : 0,
        transactionId: callbackParams.vnp_TransactionNo || '',
        gatewayTransactionId: callbackParams.vnp_TransactionNo || '',
        paymentMethod: this.mapBankCodeToPaymentMethod(callbackParams.vnp_BankCode),
        paidAt: paymentStatus === PaymentStatusType.COMPLETED ? new Date(this.parseVNPayDate(callbackParams.vnp_PayDate)) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        failureReason,
        refunds: []
      };
    } catch (error) {
      console.error('VNPay callback processing failed:', error);
      throw new Error('Xử lý callback VNPay thất bại');
    }
  }

  /**
   * Query payment status from VNPay
   */
  async queryPaymentStatus(transactionRef: string, transactionDate: Date): Promise<PaymentStatus> {
    try {
      const queryParams = {
        vnp_Version: this.version,
        vnp_Command: 'querydr',
        vnp_TmnCode: this.tmnCode,
        vnp_TxnRef: transactionRef,
        vnp_OrderInfo: `Truy van giao dich ${transactionRef}`,
        vnp_TransactionDate: this.formatDate(transactionDate),
        vnp_CreateDate: this.formatDate(new Date()),
        vnp_IpAddr: this.getClientIP()
      };

      const sortedParams = this.sortParams(queryParams);
      const signData = this.createSignData(sortedParams);
      const secureHash = this.createSecureHash(signData);
      sortedParams.vnp_SecureHash = secureHash;

      const response = await axios.post(
        'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
        new URLSearchParams(sortedParams).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return this.parseQueryResponse(response.data, transactionRef);
    } catch (error) {
      console.error('VNPay query failed:', error);
      throw new Error('Không thể truy vấn trạng thái thanh toán');
    }
  }

  /**
   * Process VNPay webhook
   */
  async processWebhook(webhookData: any): Promise<PaymentWebhook> {
    try {
      // Verify webhook signature
      const isValidSignature = this.verifyWebhookSignature(webhookData);
      if (!isValidSignature) {
        throw new Error('Invalid webhook signature');
      }

      const event = this.mapVNPayEventToWebhookEvent(webhookData.vnp_TransactionStatus);
      
      return {
        id: `vnpay_webhook_${Date.now()}`,
        paymentId: webhookData.vnp_TxnRef,
        event,
        data: webhookData,
        signature: webhookData.vnp_SecureHash,
        receivedAt: new Date(),
        processed: false
      };
    } catch (error) {
      console.error('VNPay webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Calculate Vietnam VAT for payment
   */
  calculateVietnameseVAT(
    subtotal: number, 
    vatRate: number = 0.1, // 10% default VAT rate in Vietnam
    taxCode?: string
  ): VietnamTaxCalculation {
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;
    
    return {
      subtotal,
      vatAmount: Math.round(vatAmount),
      vatRate,
      total: Math.round(total),
      taxCode,
      invoiceNumber: this.generateInvoiceNumber(),
      invoiceDate: new Date()
    };
  }

  /**
   * Generate QR code for VNPay payment
   */
  async generateQRCode(paymentRequest: PaymentRequest): Promise<string> {
    // VNPay QR code format following VietQR standard
    const qrData = {
      bankCode: 'VNPAY',
      accountNumber: this.tmnCode,
      amount: paymentRequest.amount,
      description: paymentRequest.description,
      orderId: paymentRequest.orderId
    };

    // Generate QR code string (simplified version)
    const qrString = JSON.stringify(qrData);
    return Buffer.from(qrString).toString('base64');
  }

  /**
   * Get supported Vietnamese banks
   */
  getSupportedBanks(): Array<{code: string, name: string, displayName: string}> {
    return [
      { code: 'VIETCOMBANK', name: 'Vietcombank', displayName: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
      { code: 'VIETINBANK', name: 'VietinBank', displayName: 'Ngân hàng TMCP Công thương Việt Nam' },
      { code: 'BIDV', name: 'BIDV', displayName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
      { code: 'AGRIBANK', name: 'Agribank', displayName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn' },
      { code: 'OCB', name: 'OCB', displayName: 'Ngân hàng TMCP Phương Đông' },
      { code: 'MBBANK', name: 'MBBank', displayName: 'Ngân hàng TMCP Quân đội' },
      { code: 'TECHCOMBANK', name: 'Techcombank', displayName: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
      { code: 'ACB', name: 'ACB', displayName: 'Ngân hàng TMCP Á Châu' },
      { code: 'VPBANK', name: 'VPBank', displayName: 'Ngân hàng TMCP Việt Nam Thịnh vượng' },
      { code: 'TPBANK', name: 'TPBank', displayName: 'Ngân hàng TMCP Tiên Phong' },
      { code: 'SACOMBANK', name: 'Sacombank', displayName: 'Ngân hàng TMCP Sài Gòn Thương tín' },
      { code: 'HDBANK', name: 'HDBank', displayName: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh' }
    ];
  }

  // Private helper methods
  private sortParams(params: Record<string, string>): Record<string, string> {
    const sortedKeys = Object.keys(params).sort();
    const sortedParams: Record<string, string> = {};
    sortedKeys.forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        sortedParams[key] = params[key];
      }
    });
    return sortedParams;
  }

  private createSignData(params: Record<string, string>): string {
    return Object.entries(params)
      .filter(([key, value]) => key !== 'vnp_SecureHash' && value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  private createSecureHash(data: string): string {
    return crypto
      .createHmac('sha512', this.hashSecret)
      .update(data, 'utf-8')
      .digest('hex');
  }

  private verifySecureHash(params: Record<string, string>): boolean {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    
    const sortedParams = this.sortParams(params);
    const signData = this.createSignData(sortedParams);
    const computedHash = this.createSecureHash(signData);
    
    return secureHash === computedHash;
  }

  private buildPaymentUrl(params: Record<string, string>): string {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${this.apiUrl}?${queryString}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '')
      .substring(0, 14);
  }

  private parseVNPayDate(vnpDate: string): Date {
    const year = parseInt(vnpDate.substring(0, 4));
    const month = parseInt(vnpDate.substring(4, 6)) - 1;
    const day = parseInt(vnpDate.substring(6, 8));
    const hour = parseInt(vnpDate.substring(8, 10));
    const minute = parseInt(vnpDate.substring(10, 12));
    const second = parseInt(vnpDate.substring(12, 14));
    
    return new Date(year, month, day, hour, minute, second);
  }

  private formatOrderInfo(description: string): string {
    // Clean and format order info for VNPay
    return description
      .replace(/[^a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF]/g, '') // Remove special chars except Vietnamese
      .substring(0, 255); // Max 255 characters
  }

  private getOrderType(paymentRequest: PaymentRequest): string {
    // Default order type for digital services
    return 'billpayment';
  }

  private getClientIP(): string {
    // In production, get real client IP
    return '127.0.0.1';
  }

  private getFirstName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1]; // Last word is first name in Vietnamese
  }

  private getLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts.slice(0, -1).join(' '); // All except last word
  }

  private getVNPayErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '01': 'Giao dịch chưa hoàn tất',
      '02': 'Giao dịch bị lỗi',
      '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
      '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
      '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'GD Hoàn trả bị từ chối',
      '10': 'Đã giao hàng',
      '11': 'Giao dịch không thành công do: Khách hàng nhập sai mật khẩu xác thực giao dịch (OTP)',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác'
    };

    return errorMessages[responseCode] || 'Lỗi không xác định';
  }

  private mapBankCodeToPaymentMethod(bankCode: string): PaymentMethod {
    if (!bankCode) return PaymentMethod.INTERNET_BANKING;
    
    const cardBanks = ['VISA', 'MASTERCARD', 'JCB', 'AMEX'];
    if (cardBanks.includes(bankCode)) {
      return PaymentMethod.CREDIT_CARD;
    }
    
    return PaymentMethod.INTERNET_BANKING;
  }

  private parseQueryResponse(responseData: any, transactionRef: string): PaymentStatus {
    const status = responseData.vnp_TransactionStatus === '00' ? 
      PaymentStatusType.COMPLETED : 
      PaymentStatusType.FAILED;
    
    return {
      paymentId: transactionRef,
      orderId: transactionRef,
      status,
      amount: parseInt(responseData.vnp_Amount) / 100,
      currency: this.currCode,
      paidAmount: status === PaymentStatusType.COMPLETED ? parseInt(responseData.vnp_Amount) / 100 : 0,
      transactionId: responseData.vnp_TransactionNo || '',
      gatewayTransactionId: responseData.vnp_TransactionNo || '',
      paymentMethod: this.mapBankCodeToPaymentMethod(responseData.vnp_BankCode),
      paidAt: status === PaymentStatusType.COMPLETED ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      failureReason: status === PaymentStatusType.FAILED ? this.getVNPayErrorMessage(responseData.vnp_ResponseCode) : undefined,
      refunds: []
    };
  }

  private verifyWebhookSignature(webhookData: any): boolean {
    // Implement webhook signature verification
    return true; // Simplified for demo
  }

  private mapVNPayEventToWebhookEvent(transactionStatus: string): WebhookEvent {
    switch (transactionStatus) {
      case '00':
        return WebhookEvent.PAYMENT_COMPLETED;
      case '02':
        return WebhookEvent.PAYMENT_FAILED;
      case '24':
        return WebhookEvent.PAYMENT_CANCELLED;
      default:
        return WebhookEvent.PAYMENT_CREATED;
    }
  }

  private generateInvoiceNumber(): string {
    const prefix = 'INV';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}