import express from 'express';
import { TaxAuthorityConnector } from './government-apis/tax-authority-connector';
import { DigitalSignature } from './security/digital-signature';
import { XMLFormatter } from './invoice-processing/xml-formatter';
import { VietnamInvoice, ApiResponse } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

const router = express.Router();
const taxAuthority = new TaxAuthorityConnector();
const digitalSignature = new DigitalSignature();
const xmlFormatter = new XMLFormatter();

/**
 * Create and submit e-invoice
 */
router.post('/invoices', async (req, res) => {
  try {
    const invoiceData: VietnamInvoice = req.body;
    
    // Validate invoice data
    if (!invoiceData.customerInfo?.name || !invoiceData.items?.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invoice data',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    // Generate invoice ID if not provided
    if (!invoiceData.id) {
      invoiceData.id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Sign the invoice
    const signature = await digitalSignature.signInvoice(invoiceData);
    invoiceData.digitalSignature = signature;

    // Format to XML
    const xmlData = xmlFormatter.formatInvoiceToXML(invoiceData);
    
    // Validate XML
    const validation = xmlFormatter.validateXML(xmlData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `XML validation failed: ${validation.errors.join(', ')}`,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    // Submit to Tax Authority
    const submissionResult = await taxAuthority.submitInvoice(invoiceData);
    invoiceData.governmentResponse = submissionResult;
    invoiceData.submissionStatus = submissionResult.status === 'success' ? 'submitted' : 'draft';

    logger.info(`✅ E-invoice ${invoiceData.invoiceNumber} processed successfully`);

    res.json({
      success: true,
      data: {
        invoice: invoiceData,
        xmlData,
        submissionResult,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);

  } catch (error: any) {
    logger.error('Failed to process e-invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * Check invoice status
 */
router.get('/invoices/:transactionId/status', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const status = await taxAuthority.checkInvoiceStatus(transactionId);

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);

  } catch (error: any) {
    logger.error('Failed to check invoice status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * Validate XML invoice
 */
router.post('/invoices/validate-xml', async (req, res) => {
  try {
    const { xmlData } = req.body;
    
    if (!xmlData) {
      return res.status(400).json({
        success: false,
        error: 'XML data is required',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    const validation = xmlFormatter.validateXML(xmlData);

    res.json({
      success: true,
      data: validation,
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);

  } catch (error: any) {
    logger.error('Failed to validate XML:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * Submit tax declaration
 */
router.post('/tax-declaration', async (req, res) => {
  try {
    const { period, taxData } = req.body;
    
    if (!period || !taxData) {
      return res.status(400).json({
        success: false,
        error: 'Period and tax data are required',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    // Create tax declaration XML
    const xmlData = xmlFormatter.createTaxDeclarationXML(period, taxData);
    
    // Submit to Tax Authority
    const submissionResult = await taxAuthority.submitTaxDeclaration(period, taxData);

    res.json({
      success: true,
      data: {
        xmlData,
        submissionResult,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);

  } catch (error: any) {
    logger.error('Failed to submit tax declaration:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * Get certificate information
 */
router.get('/certificate-info', async (req, res) => {
  try {
    const certInfo = digitalSignature.getCertificateInfo();

    res.json({
      success: true,
      data: certInfo,
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);

  } catch (error: any) {
    logger.error('Failed to get certificate info:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * Test Tax Authority connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const isConnected = await taxAuthority.authenticate();

    res.json({
      success: true,
      data: {
        connected: isConnected,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);

  } catch (error: any) {
    logger.error('Failed to test Tax Authority connection:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

export { router as vietnamEInvoiceRouter };