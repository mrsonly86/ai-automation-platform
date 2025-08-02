import crypto from 'crypto';
import axios from 'axios';
import moment from 'moment';
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus,
  PaymentStatusType,
  PaymentMethod,
  PaymentWebhook,
  WebhookEvent
} from '@/types/payment';

/**
 * ZaloPay Payment Gateway Integration
 * Implements ZaloPay payment processing for Vietnamese market
 */
export class ZaloPayIntegration {
  
  private readonly appId: string;
  private readonly key1: string;
  private readonly key2: string;
  private readonly endpoint: string;
  private readonly callbackUrl: string;

  constructor() {
    this.appId = process.env.ZALOPAY_APP_ID || '';
    this.key1 = process.env.ZALOPAY_KEY1 || '';
    this.key2 = process.env.ZALOPAY_KEY2 || '';
    this.endpoint = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create';
    this.callbackUrl = process.env.ZALOPAY_CALLBACK_URL || '';
    
    if (!this.appId || !this.key1 || !this.key2) {
      throw new Error('ZaloPay credentials not configured');
    }
  }

  /**
   * Create ZaloPay payment order
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transId = this.generateTransactionId();
      const appTime = Date.now();
      const embedData = JSON.stringify({
        merchantinfo: 'AI Automation Platform',
        promotioninfo: '',
        redirecturl: paymentRequest.returnUrl || ''
      });

      const item = JSON.stringify([{
        itemid: paymentRequest.id,
        itemname: paymentRequest.description,
        itemprice: paymentRequest.amount,
        itemquantity: 1
      }]);

      const orderData = {
        app_id: parseInt(this.appId),
        app_user: paymentRequest.customer.id,
        app_time: appTime,
        amount: paymentRequest.amount,
        app_trans_id: transId,
        embed_data: embedData,
        item: item,
        description: `AI Automation Platform - ${paymentRequest.description}`,
        bank_code: 'zalopayapp', // Use ZaloPay app
        callback_url: this.callbackUrl,
        // Vietnamese specific fields
        phone: paymentRequest.customer.phone,
        email: paymentRequest.customer.email,
        address: paymentRequest.customer.address?.street || '',
        city: paymentRequest.customer.address?.city || ''
      };

      // Create MAC signature
      const mac = this.createMacSignature(orderData);
      orderData['mac'] = mac;

      // Make API request to ZaloPay
      const response = await axios.post(this.endpoint, orderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.return_code === 1) {
        return {
          success: true,
          paymentId: paymentRequest.id,
          redirectUrl: response.data.order_url,
          message: 'Chuyển hướng đến ZaloPay để thanh toán',
          data: {
            app_trans_id: transId,
            zp_trans_token: response.data.zp_trans_token,
            order_url: response.data.order_url,
            qr_code: await this.generateZaloPayQR(response.data.order_url)
          }
        };
      } else {
        return {
          success: false,
          paymentId: paymentRequest.id,
          message: response.data.return_message || 'Không thể tạo thanh toán ZaloPay',
          errorCode: `ZALOPAY_${response.data.return_code}`
        };
      }
    } catch (error) {
      console.error('ZaloPay payment creation failed:', error);
      return {
        success: false,
        paymentId: paymentRequest.id,
        message: 'Lỗi kết nối ZaloPay',
        errorCode: 'ZALOPAY_CONNECTION_ERROR'
      };
    }
  }

  /**
   * Process ZaloPay callback
   */
  async processCallback(callbackData: any): Promise<PaymentStatus> {
    try {
      // Verify callback MAC
      const isValidMac = this.verifyCallbackMac(callbackData);
      if (!isValidMac) {
        throw new Error('Invalid MAC signature');
      }

      const appTransId = callbackData.app_trans_id;
      const amount = callbackData.amount;
      const zpTransId = callbackData.zp_trans_id;
      
      // ZaloPay callback only sent for successful payments
      return {
        paymentId: this.extractPaymentIdFromTransId(appTransId),
        orderId: this.extractPaymentIdFromTransId(appTransId),
        status: PaymentStatusType.COMPLETED,
        amount: amount,
        currency: 'VND',
        paidAmount: amount,
        transactionId: appTransId,
        gatewayTransactionId: zpTransId,
        paymentMethod: PaymentMethod.E_WALLET,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        refunds: []
      };
    } catch (error) {
      console.error('ZaloPay callback processing failed:', error);
      throw new Error('Xử lý callback ZaloPay thất bại');
    }
  }

  /**
   * Query ZaloPay transaction status
   */
  async queryTransactionStatus(appTransId: string): Promise<PaymentStatus> {
    try {
      const data = {
        app_id: parseInt(this.appId),
        app_trans_id: appTransId
      };

      const mac = this.createQueryMac(data);
      data['mac'] = mac;

      const response = await axios.post(
        'https://sb-openapi.zalopay.vn/v2/query', 
        data
      );

      const paymentId = this.extractPaymentIdFromTransId(appTransId);
      
      if (response.data.return_code === 1) {
        return {
          paymentId,
          orderId: paymentId,
          status: PaymentStatusType.COMPLETED,
          amount: response.data.amount,
          currency: 'VND',
          paidAmount: response.data.amount,
          transactionId: appTransId,
          gatewayTransactionId: response.data.zp_trans_id,
          paymentMethod: PaymentMethod.E_WALLET,
          paidAt: new Date(response.data.server_time),
          createdAt: new Date(),
          updatedAt: new Date(),
          refunds: []
        };
      } else if (response.data.return_code === 2) {
        return {
          paymentId,
          orderId: paymentId,
          status: PaymentStatusType.FAILED,
          amount: 0,
          currency: 'VND',
          paidAmount: 0,
          transactionId: appTransId,
          gatewayTransactionId: '',
          paymentMethod: PaymentMethod.E_WALLET,
          createdAt: new Date(),
          updatedAt: new Date(),
          failureReason: 'Giao dịch thất bại',
          refunds: []
        };
      } else {
        return {
          paymentId,
          orderId: paymentId,
          status: PaymentStatusType.PENDING,
          amount: 0,
          currency: 'VND',
          paidAmount: 0,
          transactionId: appTransId,
          gatewayTransactionId: '',
          paymentMethod: PaymentMethod.E_WALLET,
          createdAt: new Date(),
          updatedAt: new Date(),
          refunds: []
        };
      }
    } catch (error) {
      console.error('ZaloPay query failed:', error);
      throw new Error('Không thể truy vấn trạng thái ZaloPay');
    }
  }

  /**
   * Process ZaloPay refund
   */
  async processRefund(
    zpTransId: string, 
    amount: number, 
    reason: string
  ): Promise<{success: boolean, refundId?: string, message: string}> {
    try {
      const timestamp = Date.now();
      const mRefundId = `${timestamp}_${this.appId}_${Math.floor(Math.random() * 1000000)}`;
      
      const refundData = {
        app_id: parseInt(this.appId),
        zp_trans_id: zpTransId,
        amount: amount,
        description: reason,
        timestamp: timestamp,
        m_refund_id: mRefundId
      };

      const mac = this.createRefundMac(refundData);
      refundData['mac'] = mac;

      const response = await axios.post(
        'https://sb-openapi.zalopay.vn/v2/refund',
        refundData
      );

      if (response.data.return_code === 1) {
        return {
          success: true,
          refundId: response.data.refund_id,
          message: 'Hoàn tiền thành công'
        };
      } else {
        return {
          success: false,
          message: response.data.return_message || 'Hoàn tiền thất bại'
        };
      }
    } catch (error) {
      console.error('ZaloPay refund failed:', error);
      return {
        success: false,
        message: 'Lỗi kết nối khi hoàn tiền'
      };
    }
  }

  /**
   * Generate ZaloPay QR code for payment
   */
  async generateZaloPayQR(orderUrl: string): Promise<string> {
    try {
      // Extract payment info from order URL
      const qrData = {
        orderUrl,
        platform: 'ZaloPay',
        timestamp: Date.now()
      };

      // Generate QR code data (Base64 encoded)
      return Buffer.from(JSON.stringify(qrData)).toString('base64');
    } catch (error) {
      console.error('ZaloPay QR generation failed:', error);
      return '';
    }
  }

  /**
   * Get ZaloPay payment methods available in Vietnam
   */
  getPaymentMethods(): Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        code: 'zalopayapp',
        name: 'Ví ZaloPay',
        description: 'Thanh toán qua ứng dụng ZaloPay',
        icon: 'zalopay-wallet'
      },
      {
        code: 'ATM',
        name: 'Thẻ ATM nội địa',
        description: 'Thanh toán bằng thẻ ATM các ngân hàng Việt Nam',
        icon: 'atm-card'
      },
      {
        code: 'CC',
        name: 'Thẻ tín dụng',
        description: 'Thanh toán bằng thẻ Visa, MasterCard',
        icon: 'credit-card'
      }
    ];
  }

  /**
   * Check ZaloPay service status
   */
  async checkServiceStatus(): Promise<{
    isAvailable: boolean;
    message: string;
    lastChecked: Date;
  }> {
    try {
      const response = await axios.get(
        'https://sb-openapi.zalopay.vn/v2/ping',
        { timeout: 5000 }
      );

      return {
        isAvailable: response.status === 200,
        message: 'ZaloPay service is available',
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        isAvailable: false,
        message: 'ZaloPay service is unavailable',
        lastChecked: new Date()
      };
    }
  }

  // Private helper methods
  private generateTransactionId(): string {
    const today = moment().format('YYMMDD');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${today}_${random}`;
  }

  private createMacSignature(orderData: any): string {
    const data = [
      orderData.app_id,
      orderData.app_trans_id,
      orderData.app_user,
      orderData.amount,
      orderData.app_time,
      orderData.embed_data,
      orderData.item
    ].join('|');

    return crypto
      .createHmac('sha256', this.key1)
      .update(data)
      .digest('hex');
  }

  private verifyCallbackMac(callbackData: any): boolean {
    const data = [
      callbackData.app_id,
      callbackData.app_trans_id,
      callbackData.app_user,
      callbackData.amount,
      callbackData.app_time,
      callbackData.embed_data,
      callbackData.item
    ].join('|');

    const computedMac = crypto
      .createHmac('sha256', this.key2)
      .update(data)
      .digest('hex');

    return computedMac === callbackData.mac;
  }

  private createQueryMac(queryData: any): string {
    const data = `${queryData.app_id}|${queryData.app_trans_id}|${this.key1}`;
    
    return crypto
      .createHmac('sha256', this.key1)
      .update(data)
      .digest('hex');
  }

  private createRefundMac(refundData: any): string {
    const data = [
      refundData.app_id,
      refundData.zp_trans_id,
      refundData.amount,
      refundData.description,
      refundData.timestamp
    ].join('|');

    return crypto
      .createHmac('sha256', this.key1)
      .update(data)
      .digest('hex');
  }

  private extractPaymentIdFromTransId(appTransId: string): string {
    // Extract payment ID from app_trans_id format: YYMMDD_XXXXXX
    return appTransId.split('_')[1] || appTransId;
  }
}