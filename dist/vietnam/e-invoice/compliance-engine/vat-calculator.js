"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VATCalculator = void 0;
const logger_1 = require("../../../shared/utils/logger");
const config_1 = require("../../../shared/config");
class VATCalculator {
    vatRate;
    constructor() {
        this.vatRate = config_1.config.vietnam.invoice.vatRate;
    }
    /**
     * Calculate VAT for invoice items
     */
    calculateVAT(items) {
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
        const taxDetails = {
            vatAmount: totalVAT,
            corporateTax: 0, // Will be calculated based on business rules
            personalIncomeTax: 0,
            otherTaxes: 0,
            totalTax: totalVAT,
        };
        logger_1.logger.info(`💰 VAT calculated: ${totalVAT.toLocaleString('vi-VN')} VNĐ`);
        return taxDetails;
    }
    /**
     * Calculate corporate income tax (20% rate in Vietnam)
     */
    calculateCorporateIncomeTax(revenue, expenses) {
        const taxableIncome = Math.max(0, revenue - expenses);
        const corporateTaxRate = 0.2; // 20% standard rate in Vietnam
        const corporateTax = taxableIncome * corporateTaxRate;
        logger_1.logger.info(`🏢 Corporate Income Tax: ${corporateTax.toLocaleString('vi-VN')} VNĐ`);
        return corporateTax;
    }
    /**
     * Calculate personal income tax based on Vietnamese tax brackets
     */
    calculatePersonalIncomeTax(monthlyIncome) {
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
            if (remainingIncome <= 0)
                break;
            const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
            const taxForBracket = taxableInThisBracket * bracket.rate;
            totalTax += taxForBracket;
            remainingIncome -= taxableInThisBracket;
        }
        logger_1.logger.info(`👤 Personal Income Tax: ${totalTax.toLocaleString('vi-VN')} VNĐ`);
        return totalTax;
    }
    /**
     * Validate VAT rate according to Vietnamese regulations
     */
    validateVATRate(vatRate) {
        const validRates = [0, 0.05, 0.08, 0.10]; // 0%, 5%, 8%, 10%
        return validRates.includes(vatRate);
    }
    /**
     * Get VAT exemption categories
     */
    getVATExemptions() {
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
    calculateTotalAmount(items, additionalFees = 0) {
        const taxDetails = this.calculateVAT(items);
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const totalAmount = subtotal + taxDetails.totalTax + additionalFees;
        logger_1.logger.info(`💸 Total invoice amount: ${totalAmount.toLocaleString('vi-VN')} VNĐ`);
        return totalAmount;
    }
}
exports.VATCalculator = VATCalculator;
//# sourceMappingURL=vat-calculator.js.map