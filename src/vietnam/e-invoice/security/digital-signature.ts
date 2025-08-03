import * as forge from 'node-forge';
import { config } from '../../../shared/config';
import { logger } from '../../../shared/utils/logger';
import { VietnamInvoice } from '../../../shared/types';
import fs from 'fs';

export class DigitalSignature {
  private privateKey: forge.pki.PrivateKey | null = null;
  private certificate: forge.pki.Certificate | null = null;

  constructor() {
    this.loadCertificate();
  }

  private loadCertificate(): void {
    try {
      const certPath = config.vietnam.invoice.digitalSignature.certPath;
      const certPassword = config.vietnam.invoice.digitalSignature.certPassword;

      if (!certPath || !fs.existsSync(certPath)) {
        logger.warn('Digital certificate not found, creating self-signed certificate for development');
        this.createSelfSignedCertificate();
        return;
      }

      // Load PKCS#12 certificate
      const p12Data = fs.readFileSync(certPath, 'binary');
      const p12Asn1 = forge.asn1.fromDer(p12Data);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);

      // Extract private key and certificate
      const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      this.privateKey = bags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key as forge.pki.PrivateKey;

      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      this.certificate = certBags[forge.pki.oids.certBag]?.[0]?.cert as forge.pki.Certificate;

      logger.info('✅ Digital certificate loaded successfully');
    } catch (error) {
      logger.error('Failed to load digital certificate:', error);
      this.createSelfSignedCertificate();
    }
  }

  private createSelfSignedCertificate(): void {
    try {
      logger.info('Creating self-signed certificate for development...');
      
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
      logger.info('✅ Self-signed certificate created for development');
    } catch (error) {
      logger.error('Failed to create self-signed certificate:', error);
    }
  }

  /**
   * Sign invoice data using PKI digital signature
   */
  async signInvoice(invoice: VietnamInvoice): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key not available for signing');
    }

    try {
      // Create hash of invoice data
      const invoiceData = this.serializeInvoiceForSigning(invoice);
      const md = forge.md.sha256.create();
      md.update(invoiceData, 'utf8');

      // Sign the hash
      const signature = (this.privateKey as any).sign(md);
      const base64Signature = forge.util.encode64(signature);

      logger.info(`✅ Invoice ${invoice.invoiceNumber} digitally signed`);
      return base64Signature;
    } catch (error) {
      logger.error('Failed to sign invoice:', error);
      throw new Error('Digital signature failed');
    }
  }

  /**
   * Verify digital signature
   */
  async verifySignature(invoice: VietnamInvoice, signature: string): Promise<boolean> {
    if (!this.certificate) {
      logger.warn('Certificate not available for verification');
      return false;
    }

    try {
      const invoiceData = this.serializeInvoiceForSigning(invoice);
      const md = forge.md.sha256.create();
      md.update(invoiceData, 'utf8');

      const decodedSignature = forge.util.decode64(signature);
      const verified = (this.certificate.publicKey as any).verify(md.digest().bytes(), decodedSignature);

      logger.info(`Signature verification result for invoice ${invoice.invoiceNumber}: ${verified}`);
      return verified;
    } catch (error) {
      logger.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Get certificate information
   */
  getCertificateInfo(): any {
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

  private serializeInvoiceForSigning(invoice: VietnamInvoice): string {
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
  encryptData(data: string): { encrypted: string; iv: string } {
    const key = forge.random.getBytesSync(32); // 256-bit key
    const iv = forge.random.getBytesSync(16);  // 128-bit IV

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
  decryptData(encryptedData: string, iv: string, key: string): string {
    const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.decode64(key));
    decipher.start({ iv: forge.util.decode64(iv) });
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData)));
    decipher.finish();

    return decipher.output.toString();
  }
}