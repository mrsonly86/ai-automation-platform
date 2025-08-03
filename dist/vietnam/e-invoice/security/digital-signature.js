"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalSignature = void 0;
const forge = __importStar(require("node-forge"));
const config_1 = require("../../../shared/config");
const logger_1 = require("../../../shared/utils/logger");
const fs_1 = __importDefault(require("fs"));
class DigitalSignature {
    privateKey = null;
    certificate = null;
    constructor() {
        this.loadCertificate();
    }
    loadCertificate() {
        try {
            const certPath = config_1.config.vietnam.invoice.digitalSignature.certPath;
            const certPassword = config_1.config.vietnam.invoice.digitalSignature.certPassword;
            if (!certPath || !fs_1.default.existsSync(certPath)) {
                logger_1.logger.warn('Digital certificate not found, creating self-signed certificate for development');
                this.createSelfSignedCertificate();
                return;
            }
            // Load PKCS#12 certificate
            const p12Data = fs_1.default.readFileSync(certPath, 'binary');
            const p12Asn1 = forge.asn1.fromDer(p12Data);
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);
            // Extract private key and certificate
            const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
            this.privateKey = bags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            this.certificate = certBags[forge.pki.oids.certBag]?.[0]?.cert;
            logger_1.logger.info('✅ Digital certificate loaded successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to load digital certificate:', error);
            this.createSelfSignedCertificate();
        }
    }
    createSelfSignedCertificate() {
        try {
            logger_1.logger.info('Creating self-signed certificate for development...');
            // Generate key pair
            const keys = forge.pki.rsa.generateKeyPair(2048);
            this.privateKey = keys.privateKey;
            // Create certificate
            const cert = forge.pki.createCertificate();
            cert.publicKey = keys.publicKey;
            cert.serialNumber = '01';
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
            const attrs = [
                { name: 'countryName', value: 'VN' },
                { name: 'organizationName', value: 'AI Automation Platform' },
                { name: 'commonName', value: 'Vietnam E-Invoice' }
            ];
            cert.setSubject(attrs);
            cert.setIssuer(attrs);
            cert.sign(this.privateKey);
            this.certificate = cert;
            logger_1.logger.info('✅ Self-signed certificate created for development');
        }
        catch (error) {
            logger_1.logger.error('Failed to create self-signed certificate:', error);
        }
    }
    /**
     * Sign invoice data using PKI digital signature
     */
    async signInvoice(invoice) {
        if (!this.privateKey) {
            throw new Error('Private key not available for signing');
        }
        try {
            // Create hash of invoice data
            const invoiceData = this.serializeInvoiceForSigning(invoice);
            const md = forge.md.sha256.create();
            md.update(invoiceData, 'utf8');
            // Sign the hash
            const signature = this.privateKey.sign(md);
            const base64Signature = forge.util.encode64(signature);
            logger_1.logger.info(`✅ Invoice ${invoice.invoiceNumber} digitally signed`);
            return base64Signature;
        }
        catch (error) {
            logger_1.logger.error('Failed to sign invoice:', error);
            throw new Error('Digital signature failed');
        }
    }
    /**
     * Verify digital signature
     */
    async verifySignature(invoice, signature) {
        if (!this.certificate) {
            logger_1.logger.warn('Certificate not available for verification');
            return false;
        }
        try {
            const invoiceData = this.serializeInvoiceForSigning(invoice);
            const md = forge.md.sha256.create();
            md.update(invoiceData, 'utf8');
            const decodedSignature = forge.util.decode64(signature);
            const verified = this.certificate.publicKey.verify(md.digest().bytes(), decodedSignature);
            logger_1.logger.info(`Signature verification result for invoice ${invoice.invoiceNumber}: ${verified}`);
            return verified;
        }
        catch (error) {
            logger_1.logger.error('Failed to verify signature:', error);
            return false;
        }
    }
    /**
     * Get certificate information
     */
    getCertificateInfo() {
        if (!this.certificate) {
            return null;
        }
        return {
            subject: this.certificate.subject.attributes.map(attr => ({
                name: attr.name,
                value: attr.value
            })),
            issuer: this.certificate.issuer.attributes.map(attr => ({
                name: attr.name,
                value: attr.value
            })),
            serialNumber: this.certificate.serialNumber,
            validity: {
                notBefore: this.certificate.validity.notBefore,
                notAfter: this.certificate.validity.notAfter
            }
        };
    }
    serializeInvoiceForSigning(invoice) {
        // Create canonical representation for signing
        const signingData = {
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate,
            taxCode: invoice.taxCode,
            customerInfo: invoice.customerInfo,
            items: invoice.items,
            totalAmount: invoice.totalAmount,
            taxDetails: invoice.taxDetails
        };
        return JSON.stringify(signingData, Object.keys(signingData).sort());
    }
    /**
     * Encrypt sensitive data using AES-256
     */
    encryptData(data) {
        const key = forge.random.getBytesSync(32); // 256-bit key
        const iv = forge.random.getBytesSync(16); // 128-bit IV
        const cipher = forge.cipher.createCipher('AES-GCM', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(data, 'utf8'));
        cipher.finish();
        return {
            encrypted: forge.util.encode64(cipher.output.data),
            iv: forge.util.encode64(iv)
        };
    }
    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData, iv, key) {
        const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.decode64(key));
        decipher.start({ iv: forge.util.decode64(iv) });
        decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData)));
        decipher.finish();
        return decipher.output.toString();
    }
}
exports.DigitalSignature = DigitalSignature;
//# sourceMappingURL=digital-signature.js.map