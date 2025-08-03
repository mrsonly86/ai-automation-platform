const VoiceCommandService = require('../voice/VoiceCommandService');
const { logger } = require('../utils/logger');

/**
 * Test script for Vietnamese Voice Commands accuracy
 */
async function testVoiceCommandAccuracy() {
    console.log('🎤 Testing Vietnamese Voice Commands Accuracy...\n');
    
    try {
        const voiceService = new VoiceCommandService();
        await voiceService.initialize();
        
        // Test commands with expected results
        const testCases = [
            {
                input: 'tạo hóa đơn cho công ty ABC',
                expected: { agent: 'e-invoice', action: 'create' }
            },
            {
                input: 'tính bảo hiểm xã hội cho anh Nam',
                expected: { agent: 'bhxh', action: 'calculate' }
            },
            {
                input: 'kiểm tra tuân thủ quy định mới',
                expected: { agent: 'compliance', action: 'check' }
            },
            {
                input: 'xuất báo cáo doanh thu tháng này',
                expected: { agent: 'reporting', action: 'generate' }
            },
            {
                input: 'tạo chiến dịch marketing cho sản phẩm mới',
                expected: { agent: 'marketing', action: 'create-campaign' }
            },
            {
                input: 'tính giá bán sản phẩm',
                expected: { agent: 'pricing', action: 'calculate' }
            },
            {
                input: 'quản lý khách hàng mới',
                expected: { agent: 'crm', action: 'manage-customers' }
            },
            {
                input: 'phân tích dữ liệu bán hàng',
                expected: { agent: 'analytics', action: 'analyze' }
            }
        ];
        
        let totalAccuracy = 0;
        let correctPredictions = 0;
        
        console.log('📊 Test Results:\n');
        console.log('Command'.padEnd(40) + 'Expected'.padEnd(20) + 'Actual'.padEnd(20) + 'Accuracy');
        console.log('-'.repeat(100));
        
        for (const testCase of testCases) {
            const result = await voiceService.parseVietnameseCommand(testCase.input);
            const isCorrect = result.agent === testCase.expected.agent && 
                             result.action === testCase.expected.action;
            
            if (isCorrect) correctPredictions++;
            totalAccuracy += result.confidence;
            
            const status = isCorrect ? '✅' : '❌';
            const actualResult = `${result.agent}/${result.action}`;
            const expectedResult = `${testCase.expected.agent}/${testCase.expected.action}`;
            
            console.log(
                testCase.input.substring(0, 37).padEnd(40) +
                expectedResult.padEnd(20) +
                actualResult.padEnd(20) +
                `${(result.confidence * 100).toFixed(1)}% ${status}`
            );
        }
        
        const overallAccuracy = (totalAccuracy / testCases.length * 100).toFixed(2);
        const predictionAccuracy = (correctPredictions / testCases.length * 100).toFixed(2);
        
        console.log('\n' + '='.repeat(100));
        console.log(`📈 Overall Results:`);
        console.log(`   Average Confidence: ${overallAccuracy}%`);
        console.log(`   Prediction Accuracy: ${predictionAccuracy}%`);
        console.log(`   Target Achievement: ${overallAccuracy >= 95 ? '✅ PASSED' : '❌ FAILED'} (Target: 95%+)`);
        
        // Test entity extraction
        console.log('\n🔍 Testing Entity Extraction:\n');
        
        const entityTests = [
            'tạo hóa đơn cho công ty ABC với số tiền 10 triệu đồng ngày mai',
            'tính BHXH cho anh Nguyễn Văn Nam với mức lương 15 triệu đồng',
            'kiểm tra mã số thuế 0123456789 tuân thủ quy định'
        ];
        
        for (const text of entityTests) {
            const entities = await voiceService.extractBusinessEntities(text);
            console.log(`Input: ${text}`);
            console.log(`Entities: ${JSON.stringify(entities, null, 2)}\n`);
        }
        
        return {
            overallAccuracy: parseFloat(overallAccuracy),
            predictionAccuracy: parseFloat(predictionAccuracy),
            passed: overallAccuracy >= 95
        };
        
    } catch (error) {
        logger.error('Voice command test failed', error);
        console.error('❌ Test failed:', error.message);
        return { passed: false, error: error.message };
    }
}

// Run test if called directly
if (require.main === module) {
    testVoiceCommandAccuracy().then(result => {
        console.log('\n🎯 Final Result:', result.passed ? 'PASSED' : 'FAILED');
        process.exit(result.passed ? 0 : 1);
    });
}

module.exports = testVoiceCommandAccuracy;