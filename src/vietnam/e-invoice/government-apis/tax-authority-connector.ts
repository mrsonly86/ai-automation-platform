import axios, { AxiosInstance } from 'axios';
import { config } from '../../../shared/config';
import { logger } from '../../../shared/utils/logger';
import { VietnamInvoice, GovernmentResponse } from '../../../shared/types';

export class TaxAuthorityConnector {
  private client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly taxCode: string;

  constructor() {
    this.baseUrl = config.vietnam.taxAuthority.baseUrl;
    this.apiKey = config.vietnam.taxAuthority.apiKey;
    this.taxCode = config.vietnam.taxAuthority.taxCode;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Tax-Code': this.taxCode,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`🌐 Tax Authority API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Tax Authority API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`✅ Tax Authority API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Tax Authority API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Submit e-invoice to Vietnamese Tax Authority
   */
  async submitInvoice(invoice: VietnamInvoice): Promise<GovernmentResponse> {
    try {
      const payload = this.formatInvoiceForSubmission(invoice);
      
      const response = await this.client.post('/api/v1/invoices/submit', payload);
      
      return {
        transactionId: response.data.transactionId,
        status: response.data.success ? 'success' : 'error',
        message: response.data.message || 'Invoice submitted successfully',
        timestamp: new Date().toISOString(),
        auditCode: response.data.auditCode,
      };
    } catch (error: any) {
      logger.error('Failed to submit invoice to Tax Authority:', error);
      
      return {
        transactionId: '',
        status: 'error',
        message: error.response?.data?.message || 'Failed to submit invoice',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check invoice status with Tax Authority
   */
  async checkInvoiceStatus(transactionId: string): Promise<GovernmentResponse> {
    try {
      const response = await this.client.get(`/api/v1/invoices/status/${transactionId}`);
      
      return {
        transactionId,
        status: response.data.status === 'approved' ? 'success' : 'error',
        message: response.data.message,
        timestamp: new Date().toISOString(),
        auditCode: response.data.auditCode,
      };
    } catch (error: any) {
      logger.error('Failed to check invoice status:', error);
      
      return {
        transactionId,
        status: 'error',
        message: 'Failed to check invoice status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Submit tax declaration
   */
  async submitTaxDeclaration(period: string, taxData: any): Promise<GovernmentResponse> {
    try {
      const response = await this.client.post('/api/v1/tax-declaration', {
        period,
        taxCode: this.taxCode,
        data: taxData,
        timestamp: new Date().toISOString(),
      });
      
      return {
        transactionId: response.data.transactionId,
        status: 'success',
        message: 'Tax declaration submitted successfully',
        timestamp: new Date().toISOString(),
        auditCode: response.data.auditCode,
      };
    } catch (error: any) {
      logger.error('Failed to submit tax declaration:', error);
      
      return {
        transactionId: '',
        status: 'error',
        message: error.response?.data?.message || 'Failed to submit tax declaration',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Authenticate with government systems
   */
  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.post('/api/v1/auth/verify', {
        taxCode: this.taxCode,
        timestamp: new Date().toISOString(),
      });
      
      return response.data.success === true;
    } catch (error: any) {
      logger.error('Failed to authenticate with Tax Authority:', error);
      return false;
    }
  }

  private formatInvoiceForSubmission(invoice: VietnamInvoice): any {
    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      taxCode: this.taxCode,
      customer: {
        name: invoice.customerInfo.name,
        taxCode: invoice.customerInfo.taxCode,
        address: invoice.customerInfo.address,
        phone: invoice.customerInfo.phone,
        email: invoice.customerInfo.email,
      },
      items: invoice.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        amount: item.amount,
        vatAmount: item.vatAmount,
      })),
      totalAmount: invoice.totalAmount,
      taxDetails: invoice.taxDetails,
      digitalSignature: invoice.digitalSignature,
    };
  }
}