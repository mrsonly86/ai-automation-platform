import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-automation-platform',
  },
  
  // Vietnam E-Invoice Configuration
  vietnam: {
    taxAuthority: {
      baseUrl: process.env.VN_TAX_AUTHORITY_URL || 'https://api.gdt.gov.vn',
      apiKey: process.env.VN_TAX_API_KEY || '',
      taxCode: process.env.VN_COMPANY_TAX_CODE || '',
    },
    invoice: {
      template: process.env.VN_INVOICE_TEMPLATE || 'default',
      vatRate: parseFloat(process.env.VN_VAT_RATE || '0.1'), // 10%
      digitalSignature: {
        certPath: process.env.VN_CERT_PATH || '',
        certPassword: process.env.VN_CERT_PASSWORD || '',
      },
    },
  },
  
  // Vietnamese Voice Assistant Configuration
  voice: {
    speechRecognition: {
      provider: process.env.VOICE_SR_PROVIDER || 'web-speech-api',
      language: 'vi-VN',
      dialects: ['vi-VN-North', 'vi-VN-Central', 'vi-VN-South'],
    },
    textToSpeech: {
      provider: process.env.VOICE_TTS_PROVIDER || 'web-speech-api',
      voice: 'vi-VN',
      speed: parseFloat(process.env.VOICE_TTS_SPEED || '1.0'),
    },
    nlp: {
      model: process.env.VOICE_NLP_MODEL || 'phobert',
      threshold: parseFloat(process.env.VOICE_NLP_THRESHOLD || '0.8'),
    },
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
    },
  },
};