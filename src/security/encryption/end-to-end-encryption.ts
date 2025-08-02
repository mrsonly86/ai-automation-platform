import crypto from 'crypto';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
}

export interface DecryptionParams {
  encryptedData: string;
  iv: string;
  tag: string;
}

/**
 * End-to-End Encryption Service
 * Provides secure encryption/decryption for sensitive data
 */
export class EndToEndEncryption {
  private readonly algorithm: string;
  private readonly keyLength: number;
  private readonly ivLength: number;
  private readonly tagLength: number;
  private readonly encryptionKey: Buffer;

  constructor() {
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString || keyString.length !== this.keyLength) {
      throw new Error('Invalid encryption key. Must be 32 characters long.');
    }
    
    this.encryptionKey = Buffer.from(keyString, 'utf8');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  encrypt(data: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('ai-automation-platform', 'utf8'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(params: DecryptionParams): string {
    try {
      const { encryptedData, iv, tag } = params;
      
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('ai-automation-platform', 'utf8'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt object data
   */
  encryptObject(obj: any): EncryptionResult {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypt object data
   */
  decryptObject<T>(params: DecryptionParams): T {
    const decryptedString = this.decrypt(params);
    return JSON.parse(decryptedString);
  }

  /**
   * Generate secure random key
   */
  generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   */
  createHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Encrypt sensitive form data
   */
  encryptFormData(formData: Record<string, any>): Record<string, EncryptionResult> {
    const encrypted: Record<string, EncryptionResult> = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (this.isSensitiveField(key)) {
        encrypted[key] = this.encrypt(String(value));
      } else {
        encrypted[key] = { encryptedData: String(value), iv: '', tag: '' };
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypt form data
   */
  decryptFormData(encryptedFormData: Record<string, EncryptionResult>): Record<string, any> {
    const decrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(encryptedFormData)) {
      if (value.iv && value.tag) {
        decrypted[key] = this.decrypt(value);
      } else {
        decrypted[key] = value.encryptedData;
      }
    }
    
    return decrypted;
  }

  /**
   * Check if field contains sensitive data
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password',
      'ssn',
      'nationalId',
      'creditCard',
      'bankAccount',
      'apiKey',
      'secret',
      'token',
      'phone',
      'address'
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  /**
   * Encrypt database field
   */
  encryptDatabaseField(value: string | null): string | null {
    if (!value) return null;
    
    const encrypted = this.encrypt(value);
    return `${encrypted.encryptedData}:${encrypted.iv}:${encrypted.tag}`;
  }

  /**
   * Decrypt database field
   */
  decryptDatabaseField(encryptedValue: string | null): string | null {
    if (!encryptedValue) return null;
    
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) return encryptedValue; // Not encrypted
    
    return this.decrypt({
      encryptedData: parts[0],
      iv: parts[1],
      tag: parts[2]
    });
  }

  /**
   * Generate encryption key for user-specific data
   */
  generateUserKey(userId: string, masterKey: string): string {
    return crypto.pbkdf2Sync(userId, masterKey, 100000, 32, 'sha256').toString('hex');
  }

  /**
   * Encrypt payment data with additional security
   */
  encryptPaymentData(paymentData: any): EncryptionResult {
    const timestamp = Date.now().toString();
    const dataWithTimestamp = {
      ...paymentData,
      encryptedAt: timestamp
    };
    
    return this.encryptObject(dataWithTimestamp);
  }

  /**
   * Validate encryption integrity
   */
  validateEncryptionIntegrity(params: DecryptionParams): boolean {
    try {
      this.decrypt(params);
      return true;
    } catch {
      return false;
    }
  }
}