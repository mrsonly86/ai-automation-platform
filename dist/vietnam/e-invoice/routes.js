"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vietnamEInvoiceRouter = void 0;
const express_1 = __importDefault(require("express"));
const tax_authority_connector_1 = require("./government-apis/tax-authority-connector");
const digital_signature_1 = require("./security/digital-signature");
const xml_formatter_1 = require("./invoice-processing/xml-formatter");
const logger_1 = require("../../shared/utils/logger");
const router = express_1.default.Router();
exports.vietnamEInvoiceRouter = router;
const taxAuthority = new tax_authority_connector_1.TaxAuthorityConnector();
const digitalSignature = new digital_signature_1.DigitalSignature();
const xmlFormatter = new xml_formatter_1.XMLFormatter();
/**
 * Create and submit e-invoice
 */
router.post('/invoices', async (req, res) => {
    try {
        const invoiceData = req.body;
        // Validate invoice data
        if (!invoiceData.customerInfo?.name || !invoiceData.items?.length) {
            return res.status(400).json({
                success: false,
                error: 'Invalid invoice data',
                timestamp: new Date().toISOString(),
            });
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
            });
        }
        // Submit to Tax Authority
        const submissionResult = await taxAuthority.submitInvoice(invoiceData);
        invoiceData.governmentResponse = submissionResult;
        invoiceData.submissionStatus = submissionResult.status === 'success' ? 'submitted' : 'draft';
        logger_1.logger.info(`✅ E-invoice ${invoiceData.invoiceNumber} processed successfully`);
        res.json({
            success: true,
            data: {
                invoice: invoiceData,
                xmlData,
                submissionResult,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to process e-invoice:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
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
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to check invoice status:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
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
            });
        }
        const validation = xmlFormatter.validateXML(xmlData);
        res.json({
            success: true,
            data: validation,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to validate XML:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
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
            });
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
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to submit tax declaration:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
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
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get certificate info:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
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
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to test Tax Authority connection:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
//# sourceMappingURL=routes.js.map