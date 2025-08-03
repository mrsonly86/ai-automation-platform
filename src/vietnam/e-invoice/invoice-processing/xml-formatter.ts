import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { VietnamInvoice } from '../../../shared/types';
import { logger } from '../../../shared/utils/logger';

export class XMLFormatter {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      format: true,
      suppressEmptyNode: true,
    });
  }

  /**
   * Format invoice to Vietnam standard XML format
   */
  formatInvoiceToXML(invoice: VietnamInvoice): string {
    try {
      const xmlObject = this.createVietnamInvoiceXML(invoice);
      const xmlString = this.builder.build(xmlObject);
      
      logger.info(`✅ Invoice ${invoice.invoiceNumber} formatted to XML`);
      return xmlString;
    } catch (error) {
      logger.error('Failed to format invoice to XML:', error);
      throw new Error('XML formatting failed');
    }
  }

  /**
   * Parse XML invoice back to object
   */
  parseXMLToInvoice(xmlString: string): VietnamInvoice {
    try {
      const parsed = this.parser.parse(xmlString);
      const invoice = this.extractInvoiceFromXML(parsed);
      
      logger.info(`✅ XML parsed to invoice object`);
      return invoice;
    } catch (error) {
      logger.error('Failed to parse XML to invoice:', error);
      throw new Error('XML parsing failed');
    }
  }

  /**
   * Validate XML against Vietnam e-invoice schema
   */
  validateXML(xmlString: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Parse XML to check well-formedness
      const parsed = this.parser.parse(xmlString);
      
      // Check required elements according to Vietnam standards
      if (!parsed.Invoice) {
        errors.push('Missing root Invoice element');
      }

      if (!parsed.Invoice?.['@_version']) {
        errors.push('Missing invoice version attribute');
      }

      if (!parsed.Invoice?.Header) {
        errors.push('Missing Invoice Header');
      }

      if (!parsed.Invoice?.Details) {
        errors.push('Missing Invoice Details');
      }

      if (!parsed.Invoice?.Summary) {
        errors.push('Missing Invoice Summary');
      }

      // Validate tax code format (Vietnamese tax code is 10-13 digits)
      const taxCode = parsed.Invoice?.Header?.TaxCode;
      if (taxCode && !/^\d{10,13}$/.test(taxCode)) {
        errors.push('Invalid tax code format');
      }

      // Validate VAT rate (must be 0%, 5%, 8%, 10%, or exempt)
      const items = parsed.Invoice?.Details?.Item || [];
      const itemsArray = Array.isArray(items) ? items : [items];
      
      for (const item of itemsArray) {
        const vatRate = parseFloat(item.VATRate || '0');
        if (![0, 0.05, 0.08, 0.1].includes(vatRate) && item.VATRate !== 'KCT') {
          errors.push(`Invalid VAT rate: ${item.VATRate}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`XML parsing error: ${(error as Error).message}`);
      return {
        valid: false,
        errors
      };
    }
  }

  private createVietnamInvoiceXML(invoice: VietnamInvoice): any {
    return {
      Invoice: {
        '@_version': '1.0',
        '@_xmlns': 'http://gdt.gov.vn/einvoice/v1.0',
        Header: {
          InvoiceNumber: invoice.invoiceNumber,
          IssueDate: invoice.issueDate,
          DueDate: invoice.dueDate || '',
          TaxCode: invoice.taxCode,
          CurrencyCode: 'VND',
          ExchangeRate: 1,
          Template: 'Default',
          Series: this.extractSeriesFromInvoiceNumber(invoice.invoiceNumber),
        },
        Customer: {
          Name: invoice.customerInfo.name,
          TaxCode: invoice.customerInfo.taxCode || '',
          Address: invoice.customerInfo.address,
          Phone: invoice.customerInfo.phone || '',
          Email: invoice.customerInfo.email || '',
        },
        Details: {
          Item: invoice.items.map((item: any, index: number) => ({
            '@_id': index + 1,
            Description: item.description,
            Quantity: item.quantity,
            UnitPrice: item.unitPrice,
            Amount: item.amount,
            VATRate: item.vatRate,
            VATAmount: item.vatAmount,
          })),
        },
        Summary: {
          TotalAmount: invoice.totalAmount,
          VATAmount: invoice.taxDetails.vatAmount,
          CorporateTax: invoice.taxDetails.corporateTax || 0,
          PersonalIncomeTax: invoice.taxDetails.personalIncomeTax || 0,
          OtherTaxes: invoice.taxDetails.otherTaxes || 0,
          TotalTax: invoice.taxDetails.totalTax,
          GrandTotal: invoice.totalAmount + invoice.taxDetails.totalTax,
        },
        DigitalSignature: {
          Signature: invoice.digitalSignature || '',
          SignatureMethod: 'RSA-SHA256',
          CertificateIssuer: 'Vietnam Tax Authority',
          SignatureDate: new Date().toISOString(),
        },
      },
    };
  }

  private extractInvoiceFromXML(parsed: any): VietnamInvoice {
    const invoiceData = parsed.Invoice;
    
    return {
      id: this.generateId(),
      invoiceNumber: invoiceData.Header.InvoiceNumber,
      issueDate: invoiceData.Header.IssueDate,
      dueDate: invoiceData.Header.DueDate,
      taxCode: invoiceData.Header.TaxCode,
      customerInfo: {
        name: invoiceData.Customer.Name,
        taxCode: invoiceData.Customer.TaxCode,
        address: invoiceData.Customer.Address,
        phone: invoiceData.Customer.Phone,
        email: invoiceData.Customer.Email,
      },
      items: this.extractItemsFromXML(invoiceData.Details.Item),
      taxDetails: {
        vatAmount: parseFloat(invoiceData.Summary.VATAmount || '0'),
        corporateTax: parseFloat(invoiceData.Summary.CorporateTax || '0'),
        personalIncomeTax: parseFloat(invoiceData.Summary.PersonalIncomeTax || '0'),
        otherTaxes: parseFloat(invoiceData.Summary.OtherTaxes || '0'),
        totalTax: parseFloat(invoiceData.Summary.TotalTax || '0'),
      },
      totalAmount: parseFloat(invoiceData.Summary.TotalAmount || '0'),
      digitalSignature: invoiceData.DigitalSignature?.Signature,
      submissionStatus: 'draft',
    };
  }

  private extractItemsFromXML(itemsData: any): any[] {
    const items = Array.isArray(itemsData) ? itemsData : [itemsData];
    
    return items.map(item => ({
      description: item.Description,
      quantity: parseFloat(item.Quantity || '0'),
      unitPrice: parseFloat(item.UnitPrice || '0'),
      vatRate: parseFloat(item.VATRate || '0'),
      amount: parseFloat(item.Amount || '0'),
      vatAmount: parseFloat(item.VATAmount || '0'),
    }));
  }

  private extractSeriesFromInvoiceNumber(invoiceNumber: string): string {
    // Extract series from invoice number (e.g., "AA/23E" from "AA/23E-0001")
    const match = invoiceNumber.match(/^([A-Z]+\/\d+[A-Z]*)-/);
    return match ? match[1] : 'AA/23E';
  }

  private generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create XML for tax declaration
   */
  createTaxDeclarationXML(period: string, taxData: any): string {
    const xmlObject = {
      TaxDeclaration: {
        '@_version': '1.0',
        '@_xmlns': 'http://gdt.gov.vn/taxdeclaration/v1.0',
        Header: {
          Period: period,
          TaxCode: taxData.taxCode,
          DeclarationType: taxData.type || 'monthly',
          SubmissionDate: new Date().toISOString(),
        },
        VAT: {
          Sales: taxData.vat?.sales || 0,
          Purchases: taxData.vat?.purchases || 0,
          VATPayable: taxData.vat?.payable || 0,
        },
        CorporateIncomeTax: {
          Revenue: taxData.corporateIncomeTax?.revenue || 0,
          Expenses: taxData.corporateIncomeTax?.expenses || 0,
          TaxableIncome: taxData.corporateIncomeTax?.taxableIncome || 0,
          TaxPayable: taxData.corporateIncomeTax?.payable || 0,
        },
        PersonalIncomeTax: {
          TotalPayroll: taxData.personalIncomeTax?.totalPayroll || 0,
          TaxWithheld: taxData.personalIncomeTax?.withheld || 0,
        },
      },
    };

    return this.builder.build(xmlObject);
  }
}