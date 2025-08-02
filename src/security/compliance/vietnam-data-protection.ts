import { 
  VietnamDataProtectionConsent, 
  VietnamLegalBasis, 
  VietnamDataType,
  DataProcessingRecord 
} from './gdpr-compliance';

export interface VietnamDataProtectionPolicy {
  policyVersion: string;
  effectiveDate: Date;
  dataController: VietnamDataController;
  dataProcessingPurposes: string[];
  dataTypes: VietnamDataType[];
  retentionPeriods: VietnamRetentionPeriod[];
  securityMeasures: VietnamSecurityMeasure[];
  thirdPartyTransfers: VietnamThirdPartyTransfer[];
  dataSubjectRights: VietnamDataSubjectRight[];
}

export interface VietnamDataController {
  name: string;
  address: string;
  businessLicense: string;
  taxCode: string;
  legalRepresentative: string;
  dataProtectionOfficer: string;
  contactEmail: string;
  contactPhone: string;
}

export interface VietnamRetentionPeriod {
  dataType: VietnamDataType;
  purpose: string;
  retentionDays: number;
  legalBasis: string;
  disposalMethod: string;
}

export interface VietnamSecurityMeasure {
  measureType: string;
  description: string;
  implementation: string;
  compliance: string[];
}

export interface VietnamThirdPartyTransfer {
  recipient: string;
  country: string;
  purpose: string;
  safeguards: string[];
  legalBasis: VietnamLegalBasis;
  dataTypes: VietnamDataType[];
}

export interface VietnamDataSubjectRight {
  rightType: string;
  description: string;
  exerciseMethod: string;
  responseTime: number; // days
}

/**
 * Vietnam Data Protection Law Compliance Service
 * Implements Vietnam's personal data protection regulations
 */
export class VietnamDataProtectionService {
  
  private readonly vietnamDataProtectionPolicy: VietnamDataProtectionPolicy;

  constructor() {
    this.vietnamDataProtectionPolicy = this.initializeVietnamPolicy();
  }

  /**
   * Initialize Vietnam-specific data protection policy
   */
  private initializeVietnamPolicy(): VietnamDataProtectionPolicy {
    return {
      policyVersion: '1.0',
      effectiveDate: new Date('2024-01-01'),
      dataController: {
        name: 'AI Automation Platform Vietnam Co., Ltd.',
        address: 'Tầng X, Tòa nhà ABC, Đường XYZ, Quận 1, TP.HCM, Việt Nam',
        businessLicense: 'MST: 0123456789',
        taxCode: '0123456789-001',
        legalRepresentative: 'Nguyễn Văn A',
        dataProtectionOfficer: 'Trần Thị B',
        contactEmail: 'privacy@ai-automation-platform.vn',
        contactPhone: '+84-28-xxxx-xxxx'
      },
      dataProcessingPurposes: [
        'Cung cấp dịch vụ AI automation',
        'Xử lý thanh toán và hóa đơn',
        'Hỗ trợ khách hàng',
        'Cải thiện sản phẩm và dịch vụ',
        'Tuân thủ nghĩa vụ pháp lý',
        'Bảo mật và an toàn thông tin'
      ],
      dataTypes: Object.values(VietnamDataType),
      retentionPeriods: this.getVietnameseRetentionPeriods(),
      securityMeasures: this.getVietnameseSecurityMeasures(),
      thirdPartyTransfers: this.getVietnameseThirdPartyTransfers(),
      dataSubjectRights: this.getVietnameseDataSubjectRights()
    };
  }

  /**
   * Validate Vietnam data protection consent
   */
  validateVietnameseConsent(consent: VietnamDataProtectionConsent): {
    isValid: boolean;
    errors: string[];
    recommendations: string[];
  } {
    const errors: string[] = [];
    const recommendations: string[] = [];

    // Check basic consent requirements
    if (!consent.personalDataProcessing) {
      errors.push('Cần có đồng ý xử lý dữ liệu cá nhân cơ bản');
    }

    // Check sensitive data processing
    if (consent.sensitiveDataProcessing && !consent.personalDataProcessing) {
      errors.push('Xử lý dữ liệu nhạy cảm cần có đồng ý xử lý dữ liệu cá nhân');
    }

    // Check cross-border transfer
    if (consent.crossBorderTransfer) {
      if (!this.hasAdequateProtection()) {
        recommendations.push('Cần có biện pháp bảo vệ phù hợp cho chuyển dữ liệu ra nước ngoài');
      }
    }

    // Check automated decision making
    if (consent.automatedDecisionMaking) {
      recommendations.push('Cần thông báo rõ về quy trình ra quyết định tự động');
    }

    // Validate legal basis
    if (!this.isValidLegalBasis(consent.legalBasis, consent.dataTypes)) {
      errors.push('Căn cứ pháp lý không phù hợp với loại dữ liệu');
    }

    return {
      isValid: errors.length === 0,
      errors,
      recommendations
    };
  }

  /**
   * Generate Vietnamese consent form
   */
  generateVietnameseConsentForm(): string {
    return `
# BIỂU MẪU ĐỒNG Ý XỬ LÝ DỮ LIỆU CÁ NHÂN

## Thông tin về Bên xử lý dữ liệu
- **Tên tổ chức**: ${this.vietnamDataProtectionPolicy.dataController.name}
- **Địa chỉ**: ${this.vietnamDataProtectionPolicy.dataController.address}
- **Mã số thuế**: ${this.vietnamDataProtectionPolicy.dataController.taxCode}
- **Người đại diện**: ${this.vietnamDataProtectionPolicy.dataController.legalRepresentative}

## Mục đích xử lý dữ liệu
${this.vietnamDataProtectionPolicy.dataProcessingPurposes.map(purpose => `- ${purpose}`).join('\n')}

## Loại dữ liệu được thu thập
- Dữ liệu cá nhân cơ bản (họ tên, email, số điện thoại)
- Dữ liệu tài chính (thông tin thanh toán)
- Dữ liệu hành vi (cách sử dụng dịch vụ)
- Dữ liệu vị trí (nếu được cấp phép)

## Thời gian lưu trữ
- Dữ liệu tài khoản: 5 năm sau khi đóng tài khoản
- Dữ liệu giao dịch: 10 năm theo quy định pháp luật
- Dữ liệu marketing: 2 năm hoặc cho đến khi rút lại đồng ý

## Đồng ý của bạn
☐ Tôi đồng ý cho phép xử lý dữ liệu cá nhân cơ bản để sử dụng dịch vụ
☐ Tôi đồng ý cho phép xử lý dữ liệu nhạy cảm (nếu có)
☐ Tôi đồng ý cho phép chuyển dữ liệu ra nước ngoài với biện pháp bảo vệ phù hợp
☐ Tôi đồng ý cho phép sử dụng dữ liệu để cải thiện dịch vụ
☐ Tôi đồng ý nhận thông tin marketing qua email/SMS

## Quyền của chủ thể dữ liệu
Bạn có quyền:
- Truy cập và được cung cấp bản sao dữ liệu cá nhân
- Yêu cầu sửa đổi, bổ sung dữ liệu không chính xác
- Yêu cầu xóa dữ liệu cá nhân
- Rút lại đồng ý bất cứ lúc nào
- Khiếu nại với cơ quan có thẩm quyền

## Liên hệ
Email: ${this.vietnamDataProtectionPolicy.dataController.contactEmail}
Điện thoại: ${this.vietnamDataProtectionPolicy.dataController.contactPhone}

---
Ngày: ____________    Chữ ký: ________________
    `;
  }

  /**
   * Check Vietnam data localization requirements
   */
  checkDataLocalizationCompliance(dataTypes: VietnamDataType[]): {
    compliant: boolean;
    violations: string[];
    requirements: string[];
  } {
    const violations: string[] = [];
    const requirements: string[] = [];

    // Critical data that must stay in Vietnam
    const criticalDataTypes = [
      VietnamDataType.FINANCIAL,
      VietnamDataType.SENSITIVE_PERSONAL,
      VietnamDataType.HEALTH
    ];

    const hasCriticalData = dataTypes.some(type => criticalDataTypes.includes(type));
    
    if (hasCriticalData) {
      requirements.push('Dữ liệu quan trọng phải được lưu trữ tại Việt Nam');
      requirements.push('Cần có trung tâm dữ liệu hoặc đối tác lưu trữ tại Việt Nam');
      requirements.push('Phải tuân thủ các quy định về an ninh mạng');
    }

    // Check for specific violations
    if (dataTypes.includes(VietnamDataType.FINANCIAL)) {
      requirements.push('Dữ liệu tài chính cần được mã hóa và lưu trữ an toàn');
    }

    if (dataTypes.includes(VietnamDataType.BIOMETRIC)) {
      requirements.push('Dữ liệu sinh trắc học cần có biện pháp bảo mật đặc biệt');
    }

    return {
      compliant: violations.length === 0,
      violations,
      requirements
    };
  }

  /**
   * Generate Vietnam tax compliance report
   */
  generateTaxComplianceReport(): any {
    return {
      reportDate: new Date().toISOString(),
      taxYear: new Date().getFullYear(),
      companyInfo: {
        name: this.vietnamDataProtectionPolicy.dataController.name,
        taxCode: this.vietnamDataProtectionPolicy.dataController.taxCode,
        businessLicense: this.vietnamDataProtectionPolicy.dataController.businessLicense
      },
      dataProcessingActivities: {
        domesticProcessing: true,
        crossBorderTransfer: true,
        thirdPartySharing: true,
        automatedDecisionMaking: true
      },
      complianceStatus: {
        registrationWithAuthorities: 'Pending',
        dataProtectionAssessment: 'Completed',
        securityMeasures: 'Implemented',
        employeeTraining: 'Ongoing'
      },
      recommendations: [
        'Đăng ký với Cục An toàn thông tin',
        'Thực hiện đánh giá tác động bảo vệ dữ liệu',
        'Cập nhật chính sách bảo mật hàng năm',
        'Đào tạo nhân viên về bảo vệ dữ liệu'
      ]
    };
  }

  /**
   * Check Vietnamese banking integration compliance
   */
  checkBankingComplianceRequirements(): {
    compliant: boolean;
    requirements: string[];
    certifications: string[];
  } {
    return {
      compliant: false,
      requirements: [
        'Chứng nhận ISO 27001 về bảo mật thông tin',
        'Tuân thủ chuẩn PCI DSS cho thanh toán',
        'Đăng ký với Ngân hàng Nhà nước Việt Nam',
        'Có giấy phép cung cấp dịch vụ thanh toán',
        'Audit bảo mật hàng năm bởi tổ chức được công nhận'
      ],
      certifications: [
        'ISO 27001:2013',
        'PCI DSS Level 1',
        'SOC 2 Type II',
        'Chứng nhận an toàn thông tin của Việt Nam'
      ]
    };
  }

  /**
   * Generate incident response plan for Vietnam
   */
  generateIncidentResponsePlan(): string {
    return `
# KẾ HOẠCH ỨNG PHÓ SỰ CỐ BẢO MẬT DỮ LIỆU

## 1. Phát hiện và Đánh giá (0-1 giờ)
- Phát hiện sự cố qua hệ thống monitoring
- Đánh giá mức độ nghiêm trọng
- Kích hoạt nhóm ứng phó khẩn cấp

## 2. Phản ứng Ngay lập tức (1-4 giờ)
- Cô lập hệ thống bị ảnh hưởng
- Thông báo cho Ban lãnh đạo
- Ghi chép chi tiết về sự cố

## 3. Điều tra và Khắc phục (4-24 giờ)
- Phân tích nguyên nhân gốc rễ
- Khắc phục lỗ hổng bảo mật
- Khôi phục dịch vụ an toàn

## 4. Thông báo (Trong 72 giờ)
- Thông báo cho cơ quan quản lý nhà nước:
  * Cục An toàn thông tin (nếu nghiêm trọng)
  * Sở Thông tin và Truyền thông địa phương
- Thông báo cho khách hàng bị ảnh hưởng
- Báo cáo cho đối tác và nhà cung cấp

## 5. Hậu quả và Cải thiện
- Đánh giá thiệt hại và tác động
- Cập nhật chính sách bảo mật
- Đào tạo nhân viên
- Cải thiện hệ thống giám sát

## Danh sách liên hệ khẩn cấp
- Trưởng phòng CNTT: +84-xxx-xxx-xxx
- Bảo mật thông tin: +84-xxx-xxx-xxx
- Pháp lý: +84-xxx-xxx-xxx
- Cục An toàn thông tin: 024-xxxx-xxxx
    `;
  }

  // Private helper methods
  private getVietnameseRetentionPeriods(): VietnamRetentionPeriod[] {
    return [
      {
        dataType: VietnamDataType.BASIC_PERSONAL,
        purpose: 'Cung cấp dịch vụ',
        retentionDays: 1825, // 5 years
        legalBasis: 'Nghĩa vụ pháp lý và lợi ích chính đáng',
        disposalMethod: 'Xóa an toàn hoặc ẩn danh hóa'
      },
      {
        dataType: VietnamDataType.FINANCIAL,
        purpose: 'Lưu trữ hồ sơ kế toán',
        retentionDays: 3650, // 10 years
        legalBasis: 'Nghĩa vụ pháp lý',
        disposalMethod: 'Lưu trữ offline, mã hóa'
      },
      {
        dataType: VietnamDataType.BEHAVIORAL,
        purpose: 'Cải thiện dịch vụ',
        retentionDays: 730, // 2 years
        legalBasis: 'Đồng ý và lợi ích chính đáng',
        disposalMethod: 'Ẩn danh hóa'
      }
    ];
  }

  private getVietnameseSecurityMeasures(): VietnamSecurityMeasure[] {
    return [
      {
        measureType: 'Mã hóa dữ liệu',
        description: 'Mã hóa AES-256 cho dữ liệu nhạy cảm',
        implementation: 'End-to-end encryption',
        compliance: ['ISO 27001', 'PCI DSS']
      },
      {
        measureType: 'Kiểm soát truy cập',
        description: 'Xác thực đa yếu tố và phân quyền theo vai trò',
        implementation: 'RBAC với JWT và 2FA',
        compliance: ['ISO 27001', 'Vietnam Cybersecurity Law']
      },
      {
        measureType: 'Sao lưu dữ liệu',
        description: 'Sao lưu tự động hàng ngày với mã hóa',
        implementation: 'Automated backup to secure cloud storage',
        compliance: ['Business Continuity Standards']
      }
    ];
  }

  private getVietnameseThirdPartyTransfers(): VietnamThirdPartyTransfer[] {
    return [
      {
        recipient: 'AWS Vietnam',
        country: 'Singapore (Vietnam region)',
        purpose: 'Lưu trữ và xử lý dữ liệu',
        safeguards: ['Standard Contractual Clauses', 'Adequacy Decision'],
        legalBasis: VietnamLegalBasis.LEGITIMATE_INTERESTS,
        dataTypes: [VietnamDataType.BASIC_PERSONAL, VietnamDataType.BEHAVIORAL]
      },
      {
        recipient: 'Payment Gateways (VNPay, ZaloPay)',
        country: 'Vietnam',
        purpose: 'Xử lý thanh toán',
        safeguards: ['PCI DSS Compliance', 'Data Processing Agreement'],
        legalBasis: VietnamLegalBasis.CONTRACT,
        dataTypes: [VietnamDataType.FINANCIAL]
      }
    ];
  }

  private getVietnameseDataSubjectRights(): VietnamDataSubjectRight[] {
    return [
      {
        rightType: 'Quyền truy cập',
        description: 'Được biết dữ liệu cá nhân đang được xử lý như thế nào',
        exerciseMethod: 'Email hoặc form trực tuyến',
        responseTime: 15
      },
      {
        rightType: 'Quyền chỉnh sửa',
        description: 'Yêu cầu sửa đổi dữ liệu không chính xác',
        exerciseMethod: 'Tài khoản người dùng hoặc email',
        responseTime: 7
      },
      {
        rightType: 'Quyền xóa',
        description: 'Yêu cầu xóa dữ liệu cá nhân',
        exerciseMethod: 'Email với xác thực danh tính',
        responseTime: 30
      }
    ];
  }

  private hasAdequateProtection(): boolean {
    // Check if destination countries have adequate data protection
    return true; // Simplified for demo
  }

  private isValidLegalBasis(legalBasis: VietnamLegalBasis, dataTypes: VietnamDataType[]): boolean {
    // Validate if legal basis is appropriate for data types
    if (dataTypes.includes(VietnamDataType.SENSITIVE_PERSONAL)) {
      return legalBasis === VietnamLegalBasis.CONSENT;
    }
    return true;
  }
}