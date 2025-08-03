import { VietnamInvoice, GovernmentResponse } from '../../../shared/types';
export declare class TaxAuthorityConnector {
    private client;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly taxCode;
    constructor();
    private setupInterceptors;
    /**
     * Submit e-invoice to Vietnamese Tax Authority
     */
    submitInvoice(invoice: VietnamInvoice): Promise<GovernmentResponse>;
    /**
     * Check invoice status with Tax Authority
     */
    checkInvoiceStatus(transactionId: string): Promise<GovernmentResponse>;
    /**
     * Submit tax declaration
     */
    submitTaxDeclaration(period: string, taxData: any): Promise<GovernmentResponse>;
    /**
     * Authenticate with government systems
     */
    authenticate(): Promise<boolean>;
    private formatInvoiceForSubmission;
}
//# sourceMappingURL=tax-authority-connector.d.ts.map