import crypto from 'crypto';
import axios from 'axios';
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus,
  PaymentStatusType,
  PaymentMethod,
  PaymentWebhook
} from '@/types/payment';

/**
 * MoMo Payment Gateway Integration
 * Implements MoMo wallet payment processing for Vietnamese market
 */
export class MoMoIntegration {
  
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly ipnUrl: string;
  private readonly redirectUrl: string;

  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE || '';
    this.accessKey = process.env.MOMO_ACCESS_KEY || '';
    this.secretKey = process.env.MOMO_SECRET_KEY || '';
    this.endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
    this.ipnUrl = process.env.MOMO_IPN_URL || '';
    this.redirectUrl = process.env.MOMO_REDIRECT_URL || '';
    
    if (!this.partnerCode || !this.accessKey || !this.secretKey) {
      throw new Error('MoMo credentials not configured');
    }
  }

  /**
   * Create MoMo payment request
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const orderId = this.generateOrderId();
      const requestId = this.generateRequestId();
      const extraData = this.encodeExtraData({
        paymentId: paymentRequest.id,
        customerId: paymentRequest.customer.id,
        customerName: paymentRequest.customer.name
      });

      const rawSignature = this.buildRawSignature({
        accessKey: this.accessKey,
        amount: paymentRequest.amount,
        extraData: extraData,
        ipnUrl: this.ipnUrl,
        orderId: orderId,
        orderInfo: paymentRequest.description,
        partnerCode: this.partnerCode,
        redirectUrl: paymentRequest.returnUrl || this.redirectUrl,
        requestId: requestId,
        requestType: 'payWithATM'
      });

      const signature = this.createSignature(rawSignature);

      const requestBody = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: requestId,
        amount: paymentRequest.amount,
        orderId: orderId,
        orderInfo: paymentRequest.description,
        redirectUrl: paymentRequest.returnUrl || this.redirectUrl,
        ipnUrl: this.ipnUrl,
        extraData: extraData,
        requestType: 'payWithATM',
        signature: signature,
        lang: 'vi',
        // Additional Vietnamese customer info
        customerInfo: {
          fullName: paymentRequest.customer.name,
          email: paymentRequest.customer.email,
          phoneNumber: paymentRequest.customer.phone
        },
        deliveryInfo: paymentRequest.customer.address ? {
          deliveryAddress: paymentRequest.customer.address.street,
          deliveryFee: '0',
          quantity: '1'
        } : undefined
      };

      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.resultCode === 0) {
        return {
          success: true,
          paymentId: paymentRequest.id,
          redirectUrl: response.data.payUrl,
          qrCode: response.data.qrCodeUrl,
          message: 'Chuyển hướng đến MoMo để thanh toán',
          data: {
            orderId: orderId,
            requestId: requestId,
            payUrl: response.data.payUrl,
            qrCodeUrl: response.data.qrCodeUrl,
            deeplink: response.data.deeplink
          }
        };
      } else {
        return {
          success: false,
          paymentId: paymentRequest.id,
          message: response.data.message || 'Không thể tạo thanh toán MoMo',
          errorCode: `MOMO_${response.data.resultCode}`
        };
      }
    } catch (error) {
      console.error('MoMo payment creation failed:', error);
      return {
        success: false,
        paymentId: paymentRequest.id,
        message: 'Lỗi kết nối MoMo',
        errorCode: 'MOMO_CONNECTION_ERROR'
      };
    }
  }

  /**
   * Process MoMo IPN callback
   */
  async processCallback(callbackData: any): Promise<PaymentStatus> {
    try {
      // Verify IPN signature
      const isValidSignature = this.verifyIPNSignature(callbackData);
      if (!isValidSignature) {
        throw new Error('Invalid IPN signature');
      }

      const extraData = this.decodeExtraData(callbackData.extraData || '');
      const paymentId = extraData.paymentId || callbackData.orderId;

      let status: PaymentStatusType;
      let failureReason: string | undefined;

      if (callbackData.resultCode === 0) {
        status = PaymentStatusType.COMPLETED;
      } else if (callbackData.resultCode === 1006) {
        status = PaymentStatusType.CANCELLED;
        failureReason = 'Người dùng hủy thanh toán';
      } else {
        status = PaymentStatusType.FAILED;
        failureReason = this.getMoMoErrorMessage(callbackData.resultCode);
      }

      return {
        paymentId,
        orderId: callbackData.orderId,
        status,
        amount: callbackData.amount,
        currency: 'VND',
        paidAmount: status === PaymentStatusType.COMPLETED ? callbackData.amount : 0,
        transactionId: callbackData.transId,
        gatewayTransactionId: callbackData.transId,
        paymentMethod: PaymentMethod.E_WALLET,
        paidAt: status === PaymentStatusType.COMPLETED ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        failureReason,
        refunds: []
      };
    } catch (error) {
      console.error('MoMo callback processing failed:', error);
      throw new Error('Xử lý callback MoMo thất bại');
    }
  }

  /**
   * Query MoMo transaction status
   */
  async queryTransactionStatus(orderId: string, requestId: string): Promise<PaymentStatus> {
    try {
      const rawSignature = this.buildQueryRawSignature({
        accessKey: this.accessKey,
        orderId: orderId,
        partnerCode: this.partnerCode,
        requestId: requestId
      });

      const signature = this.createSignature(rawSignature);

      const queryData = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: requestId,
        orderId: orderId,
        signature: signature,
        lang: 'vi'
      };

      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        queryData
      );

      let status: PaymentStatusType;
      let failureReason: string | undefined;

      if (response.data.resultCode === 0) {
        status = PaymentStatusType.COMPLETED;
      } else if (response.data.resultCode === 1006) {
        status = PaymentStatusType.CANCELLED;
        failureReason = 'Người dùng hủy thanh toán';
      } else if (response.data.resultCode === 1000) {
        status = PaymentStatusType.PENDING;
      } else {
        status = PaymentStatusType.FAILED;
        failureReason = this.getMoMoErrorMessage(response.data.resultCode);
      }

      return {
        paymentId: orderId,
        orderId: orderId,
        status,
        amount: response.data.amount || 0,
        currency: 'VND',
        paidAmount: status === PaymentStatusType.COMPLETED ? response.data.amount : 0,
        transactionId: response.data.transId || '',
        gatewayTransactionId: response.data.transId || '',
        paymentMethod: PaymentMethod.E_WALLET,
        paidAt: status === PaymentStatusType.COMPLETED ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        failureReason,
        refunds: []
      };
    } catch (error) {
      console.error('MoMo query failed:', error);
      throw new Error('Không thể truy vấn trạng thái MoMo');
    }
  }

  /**
   * Process MoMo refund
   */
  async processRefund(
    orderId: string,
    transId: string,
    amount: number,
    description: string
  ): Promise<{success: boolean, refundId?: string, message: string}> {
    try {
      const refundRequestId = this.generateRequestId();
      
      const rawSignature = this.buildRefundRawSignature({
        accessKey: this.accessKey,
        amount: amount,
        description: description,
        orderId: orderId,
        partnerCode: this.partnerCode,
        requestId: refundRequestId,
        transId: transId
      });

      const signature = this.createSignature(rawSignature);

      const refundData = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: refundRequestId,
        amount: amount,
        orderId: orderId,
        transId: transId,
        description: description,
        signature: signature,
        lang: 'vi'
      };

      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/refund',
        refundData
      );

      if (response.data.resultCode === 0) {
        return {
          success: true,
          refundId: response.data.refundId,
          message: 'Hoàn tiền thành công'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Hoàn tiền thất bại'
        };
      }
    } catch (error) {
      console.error('MoMo refund failed:', error);
      return {
        success: false,
        message: 'Lỗi kết nối khi hoàn tiền'
      };
    }
  }

  /**
   * Generate MoMo QR code for payment
   */
  async generateMoMoQR(orderId: string, amount: number, description: string): Promise<string> {
    try {
      const requestId = this.generateRequestId();
      const extraData = this.encodeExtraData({ orderId });

      const rawSignature = this.buildRawSignature({
        accessKey: this.accessKey,
        amount: amount,
        extraData: extraData,
        ipnUrl: this.ipnUrl,
        orderId: orderId,
        orderInfo: description,
        partnerCode: this.partnerCode,
        redirectUrl: this.redirectUrl,
        requestId: requestId,
        requestType: 'qrcode'
      });

      const signature = this.createSignature(rawSignature);

      const qrData = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: description,
        redirectUrl: this.redirectUrl,
        ipnUrl: this.ipnUrl,
        extraData: extraData,
        requestType: 'qrcode',
        signature: signature,
        lang: 'vi'
      };

      const response = await axios.post(this.endpoint, qrData);

      if (response.data.resultCode === 0) {
        return response.data.qrCodeUrl;
      } else {
        throw new Error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('MoMo QR generation failed:', error);
      return '';
    }
  }

  /**
   * Get MoMo payment options for Vietnamese users
   */
  getPaymentOptions(): Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
    isPopular: boolean;
  }> {
    return [
      {
        code: 'momo_wallet',
        name: 'Ví MoMo',
        description: 'Thanh toán nhanh chóng với ví điện tử MoMo',
        icon: 'momo-wallet',
        isPopular: true
      },
      {
        code: 'momo_atm',
        name: 'ATM/Thẻ ngân hàng',
        description: 'Liên kết với thẻ ATM hoặc tài khoản ngân hàng',
        icon: 'bank-card',
        isPopular: true
      },
      {
        code: 'momo_credit',
        name: 'Thẻ tín dụng',
        description: 'Thanh toán bằng thẻ tín dụng qua MoMo',
        icon: 'credit-card',
        isPopular: false
      }
    ];
  }

  /**
   * Check MoMo service availability
   */
  async checkServiceStatus(): Promise<{
    isAvailable: boolean;
    message: string;
    lastChecked: Date;
  }> {
    try {
      // MoMo doesn't have a specific ping endpoint, so we'll check the create endpoint
      const response = await axios.head(this.endpoint, { timeout: 5000 });
      
      return {
        isAvailable: response.status === 200 || response.status === 405, // 405 is expected for HEAD request
        message: 'MoMo service is available',
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        isAvailable: false,
        message: 'MoMo service is unavailable',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Get Vietnamese provinces for delivery options
   */
  getVietnameseProvinces(): Array<{code: string, name: string}> {
    return [
      { code: 'HCM', name: 'Thành phố Hồ Chí Minh' },
      { code: 'HN', name: 'Hà Nội' },
      { code: 'DN', name: 'Đà Nẵng' },
      { code: 'CT', name: 'Cần Thơ' },
      { code: 'HP', name: 'Hải Phòng' },
      { code: 'AG', name: 'An Giang' },
      { code: 'BT', name: 'Bà Rịa - Vũng Tàu' },
      { code: 'BG', name: 'Bắc Giang' },
      { code: 'BK', name: 'Bắc Kạn' },
      { code: 'BL', name: 'Bạc Liêu' },
      // Add more provinces as needed
    ];
  }

  // Private helper methods
  private generateOrderId(): string {
    return `MOMO_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }

  private generateRequestId(): string {
    return `REQ_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }

  private buildRawSignature(data: any): string {
    return [
      'accessKey=' + data.accessKey,
      'amount=' + data.amount,
      'extraData=' + data.extraData,
      'ipnUrl=' + data.ipnUrl,
      'orderId=' + data.orderId,
      'orderInfo=' + data.orderInfo,
      'partnerCode=' + data.partnerCode,
      'redirectUrl=' + data.redirectUrl,
      'requestId=' + data.requestId,
      'requestType=' + data.requestType
    ].join('&');
  }

  private buildQueryRawSignature(data: any): string {
    return [
      'accessKey=' + data.accessKey,
      'orderId=' + data.orderId,
      'partnerCode=' + data.partnerCode,
      'requestId=' + data.requestId
    ].join('&');
  }

  private buildRefundRawSignature(data: any): string {
    return [
      'accessKey=' + data.accessKey,
      'amount=' + data.amount,
      'description=' + data.description,
      'orderId=' + data.orderId,
      'partnerCode=' + data.partnerCode,
      'requestId=' + data.requestId,
      'transId=' + data.transId
    ].join('&');
  }

  private createSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  private verifyIPNSignature(ipnData: any): boolean {
    const rawSignature = this.buildRawSignature({
      accessKey: this.accessKey,
      amount: ipnData.amount,
      extraData: ipnData.extraData || '',
      ipnUrl: this.ipnUrl,
      orderId: ipnData.orderId,
      orderInfo: ipnData.orderInfo,
      partnerCode: this.partnerCode,
      redirectUrl: this.redirectUrl,
      requestId: ipnData.requestId,
      requestType: ipnData.requestType || 'payWithATM'
    });

    const computedSignature = this.createSignature(rawSignature);
    return computedSignature === ipnData.signature;
  }

  private encodeExtraData(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeExtraData(encodedData: string): any {
    try {
      if (!encodedData) return {};
      return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
    } catch {
      return {};
    }
  }

  private getMoMoErrorMessage(resultCode: number): string {
    const errorMessages: Record<number, string> = {
      10: 'Giao dịch không thành công do lỗi hệ thống',
      11: 'Giao dịch không thành công do đã hết hạn thực hiện',
      12: 'Giao dịch không thành công do tài khoản người dùng bị khóa',
      13: 'Giao dịch không thành công do sai OTP',
      20: 'Giao dịch không thành công do không đủ số dư',
      21: 'Giao dịch không thành công do vượt quá hạn mức giao dịch',
      99: 'Giao dịch không thành công do lỗi không xác định',
      1000: 'Giao dịch đang chờ xử lý',
      1001: 'Giao dịch đã được thực hiện thành công',
      1004: 'Giao dịch bị từ chối do vượt quá số tiền cho phép',
      1005: 'Giao dịch bị từ chối do url hoặc QR code đã hết hạn',
      1006: 'Giao dịch bị từ chối do người dùng hủy thanh toán'
    };

    return errorMessages[resultCode] || `Lỗi không xác định (${resultCode})`;
  }
}