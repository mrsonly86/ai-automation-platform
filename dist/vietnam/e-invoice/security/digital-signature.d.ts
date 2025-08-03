import { VietnamInvoice } from '../../../shared/types';
export declare class DigitalSignature {
    private privateKey;
    private certificate;
    constructor();
    private loadCertificate;
    private createSelfSignedCertificate;
    /**
     * Sign invoice data using PKI digital signature
     */
    signInvoice(invoice: VietnamInvoice): Promise<string>;
    /**
     * Verify digital signature
     */
    verifySignature(invoice: VietnamInvoice, signature: string): Promise<boolean>;
    /**
     * Get certificate information
     */
    getCertificateInfo(): any;
    private serializeInvoiceForSigning;
    /**
     * Encrypt sensitive data using AES-256
     */
    encryptData(data: string): {
        encrypted: string;
        iv: string;
    };
    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData: string, iv: string, key: string): string;
}
//# sourceMappingURL=digital-signature.d.ts.map