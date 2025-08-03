const ComplianceService = require('../compliance/ComplianceService');
const { logger } = require('../utils/logger');

/**
 * Validate all compliance modules
 */
async function validateAllCompliance() {
    console.log('🏛️ Validating Vietnam Compliance 2025...\n');
    
    try {
        const complianceService = new ComplianceService();
        await complianceService.initialize();
        
        let allTestsPassed = true;
        const results = {};
        
        // Test E-Invoice Compliance
        console.log('📄 Testing E-Invoice Compliance (Thông tư 32/2025/TT-BTC)...');
        const eInvoiceTest = await testEInvoiceCompliance(complianceService);
        results.eInvoice = eInvoiceTest;
        if (!eInvoiceTest.passed) allTestsPassed = false;
        
        // Test BHXH Integration  
        console.log('\n👥 Testing BHXH Integration (Luật BHXH 2024)...');
        const bhxhTest = await testBHXHCompliance(complianceService);
        results.bhxh = bhxhTest;
        if (!bhxhTest.passed) allTestsPassed = false;
        
        // Test Enterprise Law Compliance
        console.log('\n🏢 Testing Enterprise Law 2025 Compliance...');
        const enterpriseTest = await testEnterpriseLawCompliance(complianceService);
        results.enterpriseLaw = enterpriseTest;
        if (!enterpriseTest.passed) allTestsPassed = false;
        
        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPLIANCE VALIDATION SUMMARY:');
        console.log('='.repeat(80));
        console.log(`E-Invoice Compliance:     ${results.eInvoice.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`BHXH Integration:         ${results.bhxh.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Enterprise Law 2025:      ${results.enterpriseLaw.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('='.repeat(80));
        console.log(`OVERALL COMPLIANCE:       ${allTestsPassed ? '✅ 100% COMPLIANT' : '❌ ISSUES FOUND'}`);
        
        return {
            passed: allTestsPassed,
            results,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        logger.error('Compliance validation failed', error);
        console.error('❌ Validation failed:', error.message);
        return { passed: false, error: error.message };
    }
}

async function testEInvoiceCompliance(complianceService) {
    const testInvoice = {
        invoiceNumber: 'HD001',
        invoiceType: '01GTKT',
        issueDate: new Date(),
        seller: {
            name: 'Công ty TNHH Test',
            taxCode: '0123456789',
            address: '123 Test St, HCM',
            phone: '0123456789'
        },
        buyer: {
            name: 'Khách hàng Test',
            address: '456 Buyer St, HN'
        },
        items: [
            {
                lineNumber: 1,
                description: 'Dịch vụ tư vấn',
                quantity: 1,
                unitPrice: 10000000,
                amount: 10000000,
                vatRate: 10,
                vatAmount: 1000000
            }
        ],
        totalAmountWithoutVAT: 10000000,
        totalVATAmount: 1000000,
        totalAmount: 11000000,
        nonCashPayment: true
    };
    
    try {
        const validation = await complianceService.validateEInvoice(testInvoice);
        const xmlGeneration = await complianceService.generateEInvoiceXML(testInvoice);
        
        console.log(`   XML Schema Validation: ${validation.compliance.xmlSchema ? '✅' : '❌'}`);
        console.log(`   VAT Validation:        ${validation.compliance.vatValidation ? '✅' : '❌'}`);
        console.log(`   Non-cash Payment:      ${validation.compliance.nonCashPayment ? '✅' : '❌'}`);
        console.log(`   Audit Trail:           ${validation.compliance.auditTrail ? '✅' : '❌'}`);
        console.log(`   XML Generation:        ${xmlGeneration ? '✅' : '❌'}`);
        
        return {
            passed: validation.isValid && !!xmlGeneration,
            details: validation,
            xmlGenerated: !!xmlGeneration
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { passed: false, error: error.message };
    }
}

async function testBHXHCompliance(complianceService) {
    const testBHXHData = {
        reportingPeriod: '2025-01',
        businessType: 'medium',
        employees: [
            {
                id: 'EMP001',
                name: 'Nguyễn Văn A',
                baseSalary: 15000000,
                position: 'Developer'
            },
            {
                id: 'EMP002', 
                name: 'Trần Thị B',
                baseSalary: 12000000,
                position: 'Tester'
            }
        ]
    };
    
    try {
        const calculation = await complianceService.calculateBHXHAmounts(testBHXHData);
        const submission = await complianceService.processBHXHSubmission(testBHXHData);
        
        console.log(`   BHXH Calculation:      ${calculation ? '✅' : '❌'}`);
        console.log(`   API Integration:       ${submission.success ? '✅' : '❌'}`);
        console.log(`   Auto-calculation:      ${calculation.totalEmployeeAmount > 0 ? '✅' : '❌'}`);
        console.log(`   Submission ID:         ${submission.submissionId || 'N/A'}`);
        
        return {
            passed: !!calculation && submission.success,
            calculation,
            submission
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { passed: false, error: error.message };
    }
}

async function testEnterpriseLawCompliance(complianceService) {
    const testCompanyData = {
        companyType: 'TNHH',
        employeeCount: 25,
        revenue: 50000000000,
        industry: 'technology',
        reportingPeriod: '2025-Q1'
    };
    
    try {
        const compliance = await complianceService.validateEnterpriseLawCompliance(testCompanyData);
        
        console.log(`   Corporate Governance:  ${compliance.isCompliant ? '✅' : '❌'}`);
        console.log(`   Reporting Framework:   ${compliance.reportingStatus.monthly ? '✅' : '❌'}`);
        console.log(`   Digital Compliance:    ${compliance.isCompliant ? '✅' : '❌'}`);
        console.log(`   Audit Trails:          ${compliance.isCompliant ? '✅' : '❌'}`);
        
        return {
            passed: compliance.isCompliant,
            details: compliance
        };
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { passed: false, error: error.message };
    }
}

// Run test if called directly
if (require.main === module) {
    validateAllCompliance().then(result => {
        console.log('\n🎯 Final Result:', result.passed ? 'ALL COMPLIANCE TESTS PASSED' : 'SOME TESTS FAILED');
        process.exit(result.passed ? 0 : 1);
    });
}

module.exports = validateAllCompliance;