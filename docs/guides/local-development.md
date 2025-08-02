# 💻 Local Development Guide

Hướng dẫn phát triển local cho AI Automation Platform với các dịch vụ miễn phí.

## 🚀 Quick Start (5 phút)

### 1. Clone và Setup
```bash
# Clone repository
git clone https://github.com/mrsonly86/ai-automation-platform
cd ai-automation-platform

# Run automated setup
chmod +x scripts/setup-free-services.sh
./scripts/setup-free-services.sh

# Generate secure keys
npm run setup:keys

# Check configuration
npm run setup:check
```

### 2. Configure API Keys
Edit `.env.local` với API keys của bạn:
```env
# Primary AI Provider (Free)
HUGGINGFACE_API_KEY=hf_your_token_here

# Database (Free)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Auto-generated secrets
NEXTAUTH_SECRET=your_generated_secret
```

### 3. Start Development
```bash
# Start local database (optional)
npm run docker:up

# Start Next.js development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🗄️ Database Development Options

### Option A: Supabase Cloud (Khuyến nghị)
✅ **Pros:** Real-time, Auth built-in, Free 500MB
❌ **Cons:** Requires internet connection

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Option B: Local PostgreSQL với Docker
✅ **Pros:** Offline development, Full control
❌ **Cons:** Requires Docker, No built-in Auth

```bash
# Start local database
npm run docker:up

# Connect to database
psql postgresql://ai_platform:ai_platform_password@localhost:5432/ai_platform_dev

# Stop when done
npm run docker:down
```

### Option C: Hybrid Approach
- Development: Local Docker database
- Testing: Supabase cloud
- Production: Supabase cloud

```env
# .env.local (development)
DATABASE_URL=postgresql://ai_platform:ai_platform_password@localhost:5432/ai_platform_dev

# .env.test (testing)
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
```

## 🤖 AI Development Workflow

### 1. Provider Testing
```bash
# Test all configured providers
node scripts/test-ai-providers.js

# Test specific provider
node -e "
const { generateWithFallback } = require('./lib/ai/ai-provider.js');
generateWithFallback('Hello, how are you?', { preferredProvider: 'huggingface' })
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
"
```

### 2. Local AI Development
```javascript
// lib/ai/local-dev.js
export const mockResponses = {
  'Hello': 'Hi there! How can I help you today?',
  'Generate code': 'function hello() { return "Hello, World!"; }',
  'Summarize': 'This is a summary of the provided text.'
};

export function useMockAI() {
  return process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AI === 'true';
}
```

Enable mock mode:
```env
# .env.local
USE_MOCK_AI=true  # For offline development
```

### 3. Provider Fallback Testing
```javascript
// Test fallback system
const testFallback = async () => {
  // Disable primary provider temporarily
  const original = process.env.HUGGINGFACE_API_KEY;
  delete process.env.HUGGINGFACE_API_KEY;
  
  try {
    const result = await generateWithFallback('Test prompt');
    console.log('Fallback working:', result.provider);
  } finally {
    process.env.HUGGINGFACE_API_KEY = original;
  }
};
```

## 🛠️ Development Tools

### 1. Database Management

#### Supabase Dashboard
- **URL:** https://supabase.com/dashboard
- **Features:** Table editor, SQL editor, Auth management
- **Usage:** Primary database management

#### pgAdmin (Local Docker)
```bash
# Start with tools
docker-compose -f docker-compose.free.yml --profile tools up -d

# Access pgAdmin
open http://localhost:5050
# Email: admin@ai-platform.local
# Password: admin123
```

#### Prisma Studio (Alternative)
```bash
# If using Prisma ORM
npm install prisma @prisma/client
npx prisma init
npx prisma studio
```

### 2. API Testing

#### Built-in Test Pages
```bash
# Create test pages
mkdir -p pages/test
```

```javascript
// pages/test/ai.js
import { useState } from 'react';
import { generateWithFallback } from '../lib/ai/ai-provider';

export default function AITest() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  
  const testAI = async () => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Provider Test</h1>
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="w-full p-3 border rounded"
          rows={3}
        />
        <button
          onClick={testAI}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test AI
        </button>
        {result && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
```

#### API Testing với curl
```bash
# Test AI generation
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'

# Test health check
curl http://localhost:3000/api/health

# Test with authentication
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"prompt": "Generate a Python function"}'
```

### 3. Real-time Development

#### Hot Reload Configuration
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Enable fast refresh
  reactStrictMode: true,
  // Optimize for development
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};
```

#### Live Database Updates
```javascript
// hooks/useRealtime.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/database/supabase';

export function useRealtimeConversation(conversationId) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [conversationId]);
  
  return messages;
}
```

## 🧪 Testing Strategy

### 1. Unit Tests
```javascript
// tests/ai-provider.test.js
import { generateWithFallback } from '../lib/ai/ai-provider';

// Mock API responses
jest.mock('../lib/ai/huggingface', () => ({
  generateText: jest.fn(() => Promise.resolve('Mocked response'))
}));

describe('AI Provider', () => {
  test('should generate text with fallback', async () => {
    const result = await generateWithFallback('Test prompt');
    expect(result.result).toBe('Mocked response');
    expect(result.provider).toBe('huggingface');
  });
  
  test('should handle fallback when primary fails', async () => {
    // Test fallback mechanism
  });
});
```

### 2. Integration Tests
```javascript
// tests/api.test.js
import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/ai/generate';

describe('/api/ai/generate', () => {
  test('should generate AI response', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { prompt: 'Hello' },
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.result).toBeDefined();
  });
});
```

### 3. E2E Tests (Playwright)
```javascript
// tests/e2e/ai-chat.spec.js
import { test, expect } from '@playwright/test';

test('AI chat functionality', async ({ page }) => {
  await page.goto('http://localhost:3000/chat');
  
  // Type message
  await page.fill('[data-testid="chat-input"]', 'Hello AI');
  await page.click('[data-testid="send-button"]');
  
  // Wait for response
  await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
});
```

## 🔧 Development Scripts

### Custom Scripts
```json
// package.json
{
  "scripts": {
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "dev:test": "NODE_ENV=test next dev",
    "test:ai": "node scripts/test-ai-providers.js",
    "test:db": "node scripts/test-database.js",
    "clean": "rm -rf .next && rm -rf node_modules/.cache",
    "setup:fresh": "npm run clean && npm install && npm run setup:keys"
  }
}
```

### Git Hooks
```bash
# .git/hooks/pre-commit
#!/bin/sh
echo "Running pre-commit checks..."

# Check environment
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Run tests
npm run test

# Run linting
npm run lint

echo "✅ Pre-commit checks passed"
```

## 📊 Development Monitoring

### 1. Performance Monitoring
```javascript
// lib/monitoring/dev-monitor.js
export function trackAPICall(provider, duration, success) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${provider}] ${duration}ms - ${success ? '✅' : '❌'}`);
  }
}

export function trackPageLoad(page, loadTime) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Page] ${page} loaded in ${loadTime}ms`);
  }
}
```

### 2. Debug Logging
```javascript
// lib/utils/logger.js
const DEBUG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = DEBUG_LEVELS[process.env.LOG_LEVEL] || DEBUG_LEVELS.INFO;

export const logger = {
  error: (msg, ...args) => {
    if (currentLevel >= DEBUG_LEVELS.ERROR) {
      console.error(`🔴 [ERROR] ${msg}`, ...args);
    }
  },
  warn: (msg, ...args) => {
    if (currentLevel >= DEBUG_LEVELS.WARN) {
      console.warn(`🟡 [WARN] ${msg}`, ...args);
    }
  },
  info: (msg, ...args) => {
    if (currentLevel >= DEBUG_LEVELS.INFO) {
      console.info(`🔵 [INFO] ${msg}`, ...args);
    }
  },
  debug: (msg, ...args) => {
    if (currentLevel >= DEBUG_LEVELS.DEBUG) {
      console.log(`🔍 [DEBUG] ${msg}`, ...args);
    }
  }
};
```

### 3. Environment Status Dashboard
```javascript
// pages/dev/status.js (Development only)
import { useEffect, useState } from 'react';

export default function DevStatus() {
  const [status, setStatus] = useState({});
  
  useEffect(() => {
    fetch('/api/dev/status')
      .then(res => res.json())
      .then(setStatus);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return <div>Not available in production</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Development Status</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Environment</h2>
          <ul>
            <li>Node.js: {status.nodeVersion}</li>
            <li>Next.js: {status.nextVersion}</li>
            <li>Database: {status.dbStatus}</li>
          </ul>
        </div>
        <div className="border p-4 rounded">
          <h2 className="font-semibold">AI Providers</h2>
          <ul>
            {Object.entries(status.aiProviders || {}).map(([provider, status]) => (
              <li key={provider}>
                {provider}: {status ? '✅' : '❌'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Hide in production builds
export async function getStaticProps() {
  if (process.env.NODE_ENV === 'production') {
    return { notFound: true };
  }
  return { props: {} };
}
```

## 🚀 Production-Ready Development

### 1. Environment Validation
```javascript
// lib/config/validate-env.js
import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  HUGGINGFACE_API_KEY: Joi.string().required(),
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().uri().required(),
  NEXTAUTH_SECRET: Joi.string().min(32).required(),
}).unknown();

export function validateEnvironment() {
  const { error, value } = schema.validate(process.env);
  
  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }
  
  return value;
}
```

### 2. Feature Flags
```javascript
// lib/config/features.js
export const features = {
  mockAI: process.env.USE_MOCK_AI === 'true',
  debugLogging: process.env.DEBUG_LOGGING === 'true',
  realtime: process.env.ENABLE_REALTIME !== 'false',
  caching: process.env.ENABLE_CACHING !== 'false',
};

export function isFeatureEnabled(feature) {
  return features[feature] ?? false;
}
```

### 3. Build Optimization
```javascript
// next.config.js (development optimizations)
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Fast builds in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.splitChunks = false;
    }
    return config;
  },
  
  // Skip minification in development
  swcMinify: !isDev,
  
  // Source maps in development
  productionBrowserSourceMaps: isDev,
};
```

---

## 💡 Best Practices

### 1. Code Organization
```
src/
├── components/        # Reusable UI components
├── pages/            # Next.js pages
├── lib/              # Business logic
│   ├── ai/           # AI provider integrations
│   ├── database/     # Database operations
│   └── utils/        # Utility functions
├── hooks/            # Custom React hooks
├── tests/            # Test files
└── types/            # TypeScript type definitions
```

### 2. Environment Management
- **Development:** `.env.local` with local/test services
- **Testing:** `.env.test` with test database
- **Production:** Environment variables in deployment platform

### 3. Git Workflow
```bash
# Feature development
git checkout -b feature/ai-chat-improvement
# Make changes
git add .
git commit -m "feat: improve AI chat response quality"
git push origin feature/ai-chat-improvement
# Create pull request
```

### 4. Performance Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Cache API responses
- Optimize images and assets
- Monitor bundle size

---

**🎯 Goal:** Develop efficiently with fast feedback loops while maintaining production-ready code quality.