import { VietnamInvoice, TaxDetails } from '../../../shared/types';
import { logger } from '../../../shared/utils/logger';
import { config } from '../../../shared/config';

export class VATCalculator {
  private readonly vatRate: number;

  constructor() {
    this.vatRate = config.vietnam.invoice.vatRate;
  }

  /**
   * Calculate VAT for invoice items
   */
  calculateVAT(items: any[]): TaxDetails {
    let totalVAT = 0;
    let totalBeforeVAT = 0;

    for (const item of items) {
      const itemAmount = item.quantity * item.unitPrice;
      const itemVAT = itemAmount * (item.vatRate || this.vatRate);
      
      item.amount = itemAmount;
      item.vatAmount = itemVAT;
      
      totalBeforeVAT += itemAmount;
      totalVAT += itemVAT;
    }

    const taxDetails: TaxDetails = {
      vatAmount: totalVAT,
      corporateTax: 0, // Will be calculated based on business rules
      personalIncomeTax: 0,
      otherTaxes: 0,
      totalTax: totalVAT,
    };

    logger.info(`💰 VAT calculated: ${totalVAT.toLocaleString('vi-VN')} VNĐ`);
    return taxDetails;
  }

  /**
   * Calculate corporate income tax (20% rate in Vietnam)
   */
  calculateCorporateIncomeTax(revenue: number, expenses: number): number {
    const taxableIncome = Math.max(0, revenue - expenses);
    const corporateTaxRate = 0.2; // 20% standard rate in Vietnam
    const corporateTax = taxableIncome * corporateTaxRate;
    
    logger.info(`🏢 Corporate Income Tax: ${corporateTax.toLocaleString('vi-VN')} VNĐ`);
    return corporateTax;
  }

  /**
   * Calculate personal income tax based on Vietnamese tax brackets
   */
  calculatePersonalIncomeTax(monthlyIncome: number): number {
    // Vietnamese personal income tax brackets (2024)
    const taxBrackets = [
      { min: 0, max: 5000000, rate: 0.05 },
      { min: 5000000, max: 10000000, rate: 0.10 },
      { min: 10000000, max: 18000000, rate: 0.15 },
      { min: 18000000, max: 32000000, rate: 0.20 },
      { min: 32000000, max: 52000000, rate: 0.25 },
      { min: 52000000, max: 80000000, rate: 0.30 },
      { min: 80000000, max: Infinity, rate: 0.35 },
    ];

    let totalTax = 0;
    let remainingIncome = monthlyIncome;

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      const taxForBracket = taxableInThisBracket * bracket.rate;
      
      totalTax += taxForBracket;
      remainingIncome -= taxableInThisBracket;
    }

    logger.info(`👤 Personal Income Tax: ${totalTax.toLocaleString('vi-VN')} VNĐ`);
    return totalTax;
  }

  /**
   * Validate VAT rate according to Vietnamese regulations
   */
  validateVATRate(vatRate: number): boolean {
    const validRates = [0, 0.05, 0.08, 0.10]; // 0%, 5%, 8%, 10%
    return validRates.includes(vatRate);
  }

  /**
   * Get VAT exemption categories
   */
  getVATExemptions(): string[] {
    return [
      'Education services',
      'Healthcare services',
      'Financial services (some)',
      'Insurance services (some)',
      'Essential medicines',
      'Agricultural products (raw)',
      'Books and educational materials',
      'Cultural and sports services (some)',
    ];
  }

  /**
   * Calculate total invoice amount including all taxes
   */
  calculateTotalAmount(items: any[], additionalFees: number = 0): number {
    const taxDetails = this.calculateVAT(items);
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = subtotal + taxDetails.totalTax + additionalFees;
    
    logger.info(`💸 Total invoice amount: ${totalAmount.toLocaleString('vi-VN')} VNĐ`);
    return totalAmount;
  }
}