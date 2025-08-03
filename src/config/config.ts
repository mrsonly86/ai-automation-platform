import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  redis: {
    host: string;
    port: number;
    password?: string | undefined;
  };
  influxdb: {
    url: string;
    token: string;
    org: string;
    bucket: string;
  };
  vietnam: {
    taxAuthority: {
      baseUrl: string;
      apiKey: string;
      certificatePath: string;
    };
    eInvoice: {
      companyTaxCode: string;
      digitalSignature: {
        keyPath: string;
        certPath: string;
      };
    };
  };
  voice: {
    azure: {
      speechKey: string;
      speechRegion: string;
    };
    vietnamese: {
      dialectSupport: string[];
      confidenceThreshold: number;
    };
  };
  ml: {
    models: {
      failurePrediction: string;
      maintenanceOptimization: string;
      businessForecasting: string;
    };
    training: {
      batchSize: number;
      epochs: number;
      learningRate: number;
    };
  };
  security: {
    jwtSecret: string;
    encryptionKey: string;
    sessionTimeout: number;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  influxdb: {
    url: process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN || '',
    org: process.env.INFLUXDB_ORG || 'ai-automation',
    bucket: process.env.INFLUXDB_BUCKET || 'predictions',
  },
  
  vietnam: {
    taxAuthority: {
      baseUrl: process.env.VN_TAX_API_URL || 'https://tracuuhoadon.gdt.gov.vn',
      apiKey: process.env.VN_TAX_API_KEY || '',
      certificatePath: process.env.VN_TAX_CERT_PATH || './certs/tax-authority.pem',
    },
    eInvoice: {
      companyTaxCode: process.env.VN_COMPANY_TAX_CODE || '',
      digitalSignature: {
        keyPath: process.env.VN_DIGITAL_KEY_PATH || './certs/company-private.key',
        certPath: process.env.VN_DIGITAL_CERT_PATH || './certs/company-cert.pem',
      },
    },
  },
  
  voice: {
    azure: {
      speechKey: process.env.AZURE_SPEECH_KEY || '',
      speechRegion: process.env.AZURE_SPEECH_REGION || 'southeastasia',
    },
    vietnamese: {
      dialectSupport: ['northern', 'central', 'southern'],
      confidenceThreshold: 0.8,
    },
  },
  
  ml: {
    models: {
      failurePrediction: './models/failure-prediction.json',
      maintenanceOptimization: './models/maintenance-optimization.json',
      businessForecasting: './models/business-forecasting.json',
    },
    training: {
      batchSize: 32,
      epochs: 100,
      learningRate: 0.001,
    },
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'ai-automation-platform-secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars',
    sessionTimeout: 3600000, // 1 hour
  },
};