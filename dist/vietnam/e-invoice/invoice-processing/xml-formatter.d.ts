import { VietnamInvoice } from '../../../shared/types';
export declare class XMLFormatter {
    private parser;
    private builder;
    constructor();
    /**
     * Format invoice to Vietnam standard XML format
     */
    formatInvoiceToXML(invoice: VietnamInvoice): string;
    /**
     * Parse XML invoice back to object
     */
    parseXMLToInvoice(xmlString: string): VietnamInvoice;
    /**
     * Validate XML against Vietnam e-invoice schema
     */
    validateXML(xmlString: string): {
        valid: boolean;
        errors: string[];
    };
    private createVietnamInvoiceXML;
    private extractInvoiceFromXML;
    private extractItemsFromXML;
    private extractSeriesFromInvoiceNumber;
    private generateId;
    /**
     * Create XML for tax declaration
     */
    createTaxDeclarationXML(period: string, taxData: any): string;
}
//# sourceMappingURL=xml-formatter.d.ts.map