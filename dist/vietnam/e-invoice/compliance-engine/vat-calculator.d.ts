import { TaxDetails } from '../../../shared/types';
export declare class VATCalculator {
    private readonly vatRate;
    constructor();
    /**
     * Calculate VAT for invoice items
     */
    calculateVAT(items: any[]): TaxDetails;
    /**
     * Calculate corporate income tax (20% rate in Vietnam)
     */
    calculateCorporateIncomeTax(revenue: number, expenses: number): number;
    /**
     * Calculate personal income tax based on Vietnamese tax brackets
     */
    calculatePersonalIncomeTax(monthlyIncome: number): number;
    /**
     * Validate VAT rate according to Vietnamese regulations
     */
    validateVATRate(vatRate: number): boolean;
    /**
     * Get VAT exemption categories
     */
    getVATExemptions(): string[];
    /**
     * Calculate total invoice amount including all taxes
     */
    calculateTotalAmount(items: any[], additionalFees?: number): number;
}
//# sourceMappingURL=vat-calculator.d.ts.map