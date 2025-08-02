export interface DataSubject {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  nationalId?: string;
  dataProcessingConsent: DataProcessingConsent;
  vietnamDataProtectionConsent: VietnamDataProtectionConsent;
}

export interface DataProcessingConsent {
  essential: boolean; // Required for service functionality
  analytics: boolean; // Data analytics and insights
  marketing: boolean; // Marketing communications
  thirdPartySharing: boolean; // Sharing with partners
  aiProcessing: boolean; // AI/ML processing
  consentDate: Date;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
}

export interface VietnamDataProtectionConsent {
  personalDataProcessing: boolean; // Xử lý dữ liệu cá nhân
  sensitiveDataProcessing: boolean; // Xử lý dữ liệu nhạy cảm
  crossBorderTransfer: boolean; // Chuyển dữ liệu ra nước ngoài
  dataRetention: boolean; // Lưu trữ dữ liệu
  automatedDecisionMaking: boolean; // Ra quyết định tự động
  consentDate: Date;
  legalBasis: VietnamLegalBasis;
  dataTypes: VietnamDataType[];
}

export enum VietnamLegalBasis {
  CONSENT = 'consent', // Đồng ý của chủ thể dữ liệu
  CONTRACT = 'contract', // Thực hiện hợp đồng
  LEGAL_OBLIGATION = 'legal_obligation', // Nghĩa vụ pháp lý
  VITAL_INTERESTS = 'vital_interests', // Lợi ích quan trọng
  PUBLIC_TASK = 'public_task', // Nhiệm vụ công cộng
  LEGITIMATE_INTERESTS = 'legitimate_interests' // Lợi ích chính đáng
}

export enum VietnamDataType {
  BASIC_PERSONAL = 'basic_personal', // Dữ liệu cá nhân cơ bản
  SENSITIVE_PERSONAL = 'sensitive_personal', // Dữ liệu cá nhân nhạy cảm
  BIOMETRIC = 'biometric', // Dữ liệu sinh trắc học
  FINANCIAL = 'financial', // Dữ liệu tài chính
  HEALTH = 'health', // Dữ liệu sức khỏe
  LOCATION = 'location', // Dữ liệu vị trí
  BEHAVIORAL = 'behavioral', // Dữ liệu hành vi
  COMMUNICATION = 'communication' // Dữ liệu giao tiếp
}

export interface DataProcessingRecord {
  id: string;
  dataSubjectId: string;
  processingPurpose: string;
  dataTypes: VietnamDataType[];
  legalBasis: VietnamLegalBasis;
  processingDate: Date;
  retentionPeriod: number; // days
  thirdParties: string[];
  securityMeasures: string[];
  crossBorderTransfer: boolean;
  transferCountries: string[];
}

export interface DataSubjectRequest {
  id: string;
  dataSubjectId: string;
  requestType: DataSubjectRequestType;
  requestDate: Date;
  status: RequestStatus;
  description: string;
  responseDate?: Date;
  responseData?: any;
  verificationMethod: string;
}

export enum DataSubjectRequestType {
  ACCESS = 'access', // Quyền truy cập dữ liệu
  RECTIFICATION = 'rectification', // Quyền chỉnh sửa
  ERASURE = 'erasure', // Quyền xóa dữ liệu
  RESTRICTION = 'restriction', // Quyền hạn chế xử lý
  PORTABILITY = 'portability', // Quyền di chuyển dữ liệu
  OBJECTION = 'objection', // Quyền phản đối
  WITHDRAW_CONSENT = 'withdraw_consent' // Quyền rút lại đồng ý
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  REQUIRES_VERIFICATION = 'requires_verification'
}

/**
 * GDPR Compliance Service
 * Implements GDPR requirements for data protection
 */
export class GDPRComplianceService {
  
  /**
   * Record consent for data processing
   */
  async recordConsent(
    dataSubjectId: string,
    consent: DataProcessingConsent,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const consentRecord = {
      dataSubjectId,
      consent: {
        ...consent,
        consentDate: new Date(),
        consentVersion: '1.0',
        ipAddress,
        userAgent
      },
      timestamp: new Date()
    };

    // Store consent record
    console.log('GDPR Consent recorded:', consentRecord);
    // TODO: Save to database
  }

  /**
   * Process data subject access request (DSAR)
   */
  async processAccessRequest(dataSubjectId: string): Promise<any> {
    // Collect all data for the subject
    const personalData = await this.collectPersonalData(dataSubjectId);
    const processingRecords = await this.getProcessingRecords(dataSubjectId);
    const consentHistory = await this.getConsentHistory(dataSubjectId);

    return {
      personalData,
      processingRecords,
      consentHistory,
      dataCategories: this.categorizeData(personalData),
      retention: this.getRetentionInfo(dataSubjectId),
      thirdParties: this.getThirdPartySharing(dataSubjectId),
      automatedDecisions: this.getAutomatedDecisions(dataSubjectId)
    };
  }

  /**
   * Process data erasure request (right to be forgotten)
   */
  async processErasureRequest(
    dataSubjectId: string,
    requestId: string
  ): Promise<{ success: boolean; retainedData?: string[] }> {
    const retainedData: string[] = [];

    try {
      // Check legal obligations to retain data
      const legalRetentions = await this.checkLegalRetentionRequirements(dataSubjectId);
      
      // Anonymize or delete data where possible
      await this.anonymizeUserData(dataSubjectId);
      await this.deleteNonEssentialData(dataSubjectId);
      
      // Update processing records
      await this.updateProcessingRecords(dataSubjectId, 'erased');
      
      // Log the erasure
      await this.logDataErasure(dataSubjectId, requestId);

      if (legalRetentions.length > 0) {
        retainedData.push(...legalRetentions);
      }

      return { success: true, retainedData };
    } catch (error) {
      console.error('Data erasure failed:', error);
      return { success: false };
    }
  }

  /**
   * Data portability - export user data in structured format
   */
  async exportUserData(dataSubjectId: string): Promise<any> {
    const userData = await this.collectPersonalData(dataSubjectId);
    
    return {
      exportDate: new Date().toISOString(),
      dataSubjectId,
      format: 'JSON',
      data: {
        profile: userData.profile,
        preferences: userData.preferences,
        history: userData.history,
        agents: userData.agents,
        payments: userData.payments
      },
      metadata: {
        version: '1.0',
        compliance: 'GDPR Article 20'
      }
    };
  }

  /**
   * Validate consent requirements
   */
  validateConsent(consent: DataProcessingConsent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!consent.essential) {
      errors.push('Essential processing consent is required');
    }

    if (consent.aiProcessing && !consent.analytics) {
      errors.push('AI processing requires analytics consent');
    }

    if (consent.thirdPartySharing && !consent.marketing) {
      errors.push('Third party sharing typically requires marketing consent');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check data retention compliance
   */
  async checkRetentionCompliance(dataSubjectId: string): Promise<{
    compliant: boolean;
    overdueData: string[];
    retentionPolicies: any[];
  }> {
    const processingRecords = await this.getProcessingRecords(dataSubjectId);
    const overdueData: string[] = [];
    const retentionPolicies: any[] = [];

    for (const record of processingRecords) {
      const retentionExpiry = new Date(record.processingDate);
      retentionExpiry.setDate(retentionExpiry.getDate() + record.retentionPeriod);

      if (new Date() > retentionExpiry) {
        overdueData.push(record.id);
      }

      retentionPolicies.push({
        dataType: record.dataTypes,
        purpose: record.processingPurpose,
        retentionPeriod: record.retentionPeriod,
        expiryDate: retentionExpiry
      });
    }

    return {
      compliant: overdueData.length === 0,
      overdueData,
      retentionPolicies
    };
  }

  /**
   * Generate privacy notice in Vietnamese
   */
  generatePrivacyNotice(): string {
    return `
# THÔNG BÁO VỀ QUYỀN RIÊNG TƯ

## Thu thập và Sử dụng Dữ liệu Cá nhân

Chúng tôi thu thập và xử lý dữ liệu cá nhân của bạn để:
- Cung cấp dịch vụ AI automation
- Cải thiện trải nghiệm người dùng
- Đảm bảo bảo mật và an toàn
- Tuân thủ các yêu cầu pháp lý

## Quyền của Bạn

Theo GDPR và luật bảo vệ dữ liệu Việt Nam, bạn có quyền:
1. **Quyền truy cập**: Biết dữ liệu nào đang được xử lý
2. **Quyền chỉnh sửa**: Yêu cầu sửa đổi dữ liệu không chính xác
3. **Quyền xóa**: Yêu cầu xóa dữ liệu cá nhân
4. **Quyền hạn chế**: Giới hạn việc xử lý dữ liệu
5. **Quyền di chuyển**: Nhận bản sao dữ liệu
6. **Quyền phản đối**: Phản đối việc xử lý dữ liệu
7. **Quyền rút lại đồng ý**: Rút lại đồng ý bất cứ lúc nào

## Liên hệ

Email: privacy@ai-automation-platform.vn
Điện thoại: 1900-xxxx
Địa chỉ: [Địa chỉ văn phòng tại Việt Nam]
    `;
  }

  // Private helper methods
  private async collectPersonalData(dataSubjectId: string): Promise<any> {
    // TODO: Implement data collection from all sources
    return {};
  }

  private async getProcessingRecords(dataSubjectId: string): Promise<DataProcessingRecord[]> {
    // TODO: Implement processing records retrieval
    return [];
  }

  private async getConsentHistory(dataSubjectId: string): Promise<any[]> {
    // TODO: Implement consent history retrieval
    return [];
  }

  private categorizeData(data: any): string[] {
    // TODO: Implement data categorization
    return [];
  }

  private getRetentionInfo(dataSubjectId: string): any {
    // TODO: Implement retention info retrieval
    return {};
  }

  private getThirdPartySharing(dataSubjectId: string): string[] {
    // TODO: Implement third party sharing info
    return [];
  }

  private getAutomatedDecisions(dataSubjectId: string): any[] {
    // TODO: Implement automated decisions retrieval
    return [];
  }

  private async checkLegalRetentionRequirements(dataSubjectId: string): Promise<string[]> {
    // TODO: Check legal requirements for data retention
    return [];
  }

  private async anonymizeUserData(dataSubjectId: string): Promise<void> {
    // TODO: Implement data anonymization
  }

  private async deleteNonEssentialData(dataSubjectId: string): Promise<void> {
    // TODO: Implement non-essential data deletion
  }

  private async updateProcessingRecords(dataSubjectId: string, status: string): Promise<void> {
    // TODO: Update processing records
  }

  private async logDataErasure(dataSubjectId: string, requestId: string): Promise<void> {
    // TODO: Log data erasure for audit trail
  }
}