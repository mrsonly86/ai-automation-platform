# 🚀 Free Deployment Guide

Hướng dẫn deploy AI Automation Platform lên các platform hosting miễn phí.

## 🎯 Deployment Options Comparison

| Platform | Free Quota | Features | Best For |
|----------|------------|----------|----------|
| **Vercel** | Unlimited static + 100GB bandwidth | Edge Functions, Analytics | Next.js apps |
| **Railway** | $5 credits/month | Full-stack, databases | Development |
| **Render** | 750 hours/month | Static sites + web services | Production |
| **Netlify** | 100GB bandwidth | Edge Functions, Forms | Static sites |

## 🏆 Recommended: Vercel Deployment

### Tại sao chọn Vercel?
- ✅ Tối ưu cho Next.js
- ✅ Unlimited static deployments
- ✅ Edge Functions miễn phí
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Git integration
- ✅ Preview deployments

### 🚀 Quick Deploy (3 phút)

#### Method 1: Deploy Button
1. Click deploy button:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrsonly86/ai-automation-platform)

2. Connect GitHub account
3. Configure environment variables
4. Deploy!

#### Method 2: Manual Setup

**Step 1: Prepare Repository**
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Connect to Vercel**
1. Truy cập: https://vercel.com
2. Sign up với GitHub
3. Click "New Project"
4. Import `ai-automation-platform` repository
5. Framework Preset: Next.js (auto-detected)

**Step 3: Environment Variables**
Add these environment variables in Vercel dashboard:

```env
# AI Providers
HUGGINGFACE_API_KEY=hf_your_token
GOOGLE_AI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_SECRET=your_secret_32_chars_minimum
NEXTAUTH_URL=https://your-app.vercel.app

# Optional
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Step 4: Deploy**
1. Click "Deploy"
2. Wait for build completion (~2-3 minutes)
3. Get deployment URL

### ⚙️ Vercel Configuration

Your `vercel.json` file (already created):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "HUGGINGFACE_API_KEY": "@huggingface_api_key",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

### 🔧 Advanced Vercel Setup

#### Edge Functions cho AI APIs
```javascript
// pages/api/ai/edge-chat.js
import { NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { prompt } = await req.json()
  
  // Call AI provider
  const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  })

  const result = await response.json()
  
  return NextResponse.json(result)
}
```

#### Middleware cho Rate Limiting
```javascript
// middleware.js
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/api/ai')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/ai/:path*',
}
```

## 🛠️ Alternative Deployment Options

### Option 2: Railway

**Ưu điểm:**
- ✅ $5 free credits/month
- ✅ Support databases
- ✅ Docker deployments
- ✅ Easy scaling

**Setup:**
1. Connect GitHub: https://railway.app
2. Deploy from repo
3. Add environment variables
4. Custom domain (optional)

```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "on-failure"

[[services]]
name = "ai-automation-platform"
```

### Option 3: Render

**Ưu điểm:**
- ✅ 750 hours/month free
- ✅ Static sites + web services
- ✅ PostgreSQL databases
- ✅ SSL certificates

**Setup:**
1. Connect repo tại: https://render.com
2. Choose "Web Service"
3. Build command: `npm run build`
4. Start command: `npm start`

```yaml
# render.yaml
services:
  - type: web
    name: ai-automation-platform
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Option 4: Netlify

**Ưu điểm:**
- ✅ 100GB bandwidth/month
- ✅ Form submissions
- ✅ Edge Functions
- ✅ Split testing

**Setup:**
1. Connect repo tại: https://netlify.com
2. Build command: `npm run build`
3. Publish directory: `.next`

```toml
# netlify.toml
[build]
  command = "npm run build && npm run export"
  publish = "out"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "s-maxage=0"
```

## 🔄 CI/CD Pipeline

### GitHub Actions cho Auto Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
        env:
          CI: true
      
      - name: Build project
        run: npm run build
        env:
          HUGGINGFACE_API_KEY: ${{ secrets.HUGGINGFACE_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 Performance Optimization

### 1. Static Site Generation
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['supabase.co', 'avatars.githubusercontent.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/setup/free-setup',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
```

### 2. Bundle Optimization
```javascript
// next.config.js additions
const nextConfig = {
  // ... existing config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce bundle size
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  experimental: {
    optimizeCss: true,
    swcMinify: true,
  },
}
```

### 3. Image Optimization
```javascript
// components/OptimizedImage.jsx
import Image from 'next/image'

export default function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      quality={75}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      {...props}
    />
  )
}
```

## 🔐 Security & Environment

### 1. Environment Variable Security
```javascript
// lib/config/env-validation.js
import Joi from 'joi'

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  HUGGINGFACE_API_KEY: Joi.string().required(),
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().uri().required(),
  NEXTAUTH_SECRET: Joi.string().min(32).required(),
}).unknown()

const { error, value: envVars } = envSchema.validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

export default envVars
```

### 2. CORS Configuration
```javascript
// pages/api/_middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', 'https://your-domain.vercel.app')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
```

## 📈 Monitoring & Analytics

### 1. Vercel Analytics
```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### 2. Performance Monitoring
```javascript
// lib/monitoring/performance.js
export function trackPageLoad(pageName) {
  if (typeof window !== 'undefined') {
    const perfData = performance.getEntriesByType('navigation')[0]
    
    console.log(`Page: ${pageName}`, {
      loadTime: perfData.loadEventEnd - perfData.loadEventStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
    })
  }
}
```

### 3. Error Tracking (Free Sentry)
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

## 🚨 Deployment Checklist

### Pre-deployment:
- [ ] All environment variables configured
- [ ] Database schema created
- [ ] API keys tested
- [ ] Build passes locally
- [ ] Tests passing

### Post-deployment:
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics setup
- [ ] Monitoring configured
- [ ] Performance tested

### Health Check Endpoint:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  })
}
```

## 🔄 Scaling Considerations

### Upgrade Paths:

1. **Traffic Growth**:
   - Vercel Pro: $20/month cho unlimited bandwidth
   - Add Redis caching
   - Implement CDN

2. **Database Growth**:
   - Supabase Pro: $25/month cho 8GB
   - Add read replicas
   - Implement sharding

3. **AI Usage Growth**:
   - Upgrade to paid AI tiers
   - Implement request queuing
   - Add multiple regions

## 💡 Cost Optimization Tips

1. **Static Generation**: Pre-render pages khi có thể
2. **Edge Caching**: Cache API responses
3. **Image Optimization**: Sử dụng Next.js Image
4. **Bundle Splitting**: Lazy load components
5. **Database Queries**: Optimize và cache

## 🆘 Troubleshooting Deployment

### Common Issues:

1. **Build Failures**:
   ```bash
   # Check build logs
   npm run build
   
   # Fix TypeScript errors
   npm run type-check
   ```

2. **Environment Variables**:
   ```bash
   # Verify env vars are set
   vercel env ls
   
   # Add missing variables
   vercel env add VARIABLE_NAME
   ```

3. **API Timeouts**:
   ```javascript
   // Increase timeout in vercel.json
   {
     "functions": {
       "pages/api/**/*.js": {
         "maxDuration": 60
       }
     }
   }
   ```

4. **Database Connection**:
   ```javascript
   // Test connection
   const { data, error } = await supabase
     .from('profiles')
     .select('count')
     .limit(1)
   
   if (error) console.error('Database connection failed:', error)
   ```

---

**Next Steps:** [Local Development Guide](../guides/local-development.md)