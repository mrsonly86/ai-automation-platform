# Hướng Dẫn Tích Hợp Hệ Thống

## 🎯 Tổng Quan Tích Hợp

AI Automation Platform được thiết kế để tích hợp liền mạch với các dịch vụ và công cụ phổ biến nhất trong thị trường Việt Nam và quốc tế, giúp bạn xây dựng ecosystem hoàn chỉnh cho dự án.

### 🔗 Các Tích Hợp Chính
```
┌─────────────────────────────────────────────────────────┐
│                AI AUTOMATION PLATFORM                   │
├─────────────────────────────────────────────────────────┤
│  🚀 DEPLOYMENT      │  💳 PAYMENTS       │  📊 ANALYTICS │
│  • Vercel           │  • Stripe          │  • Google     │
│  • Netlify          │  • PayPal          │  • Facebook   │
│  • Railway          │  • VNPAY           │  • Mixpanel   │
│  • DigitalOcean     │  • MoMo            │  • Amplitude  │
├─────────────────────────────────────────────────────────┤
│  ☁️ CLOUD SERVICES  │  🔐 AUTH & SECURITY │  📧 MESSAGING │
│  • Google Cloud     │  • Auth0           │  • SendGrid   │
│  • AWS              │  • Firebase Auth   │  • Mailgun    │
│  • Azure            │  • Supabase        │  • Twilio     │
│  • Firebase         │  • Clerk           │  • Zalo       │
├─────────────────────────────────────────────────────────┤
│  🛠️ DEVELOPMENT     │  📱 MOBILE         │  🤖 AI SERVICES │
│  • GitHub           │  • React Native   │  • OpenAI     │
│  • GitLab           │  • Flutter        │  • Anthropic  │
│  • Bitbucket        │  • Expo           │  • Google AI  │
│  • Docker           │  • App Store      │  • Gemini     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Platforms

### 1. Vercel Integration

#### 🎯 **Phù Hợp Cho**
- Next.js applications
- Static websites
- Serverless functions
- Global CDN distribution

#### ⚙️ **Setup Guide**

```bash
# Bước 1: Cài đặt Vercel CLI
npm i -g vercel

# Bước 2: Login và kết nối GitHub
vercel login
vercel --version

# Bước 3: Deploy dự án
vercel
```

#### 📝 **Configuration File**
```json
// vercel.json
{
  "version": 2,
  "name": "edutech-platform",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "OPENAI_API_KEY": "@openai-key"
  },
  "regions": ["sin1", "hkg1"],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

#### 🔧 **Environment Variables**
```bash
# Production Environment
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add OPENAI_API_KEY production

# Preview Environment
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add DATABASE_URL preview
```

### 2. Netlify Integration

#### 🎯 **Phù Hợp Cho**
- Static site generation
- JAMstack applications
- Form handling
- Edge functions

#### ⚙️ **Setup Guide**

```bash
# Bước 1: Cài đặt Netlify CLI
npm install -g netlify-cli

# Bước 2: Login và init
netlify login
netlify init

# Bước 3: Deploy
netlify deploy --prod
```

#### 📝 **Configuration File**
```toml
# netlify.toml
[build]
  publish = "out"
  command = "npm run build && npm run export"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[edge_functions]]
  function = "auth"
  path = "/admin/*"

[dev]
  framework = "next"
  port = 3000
```

### 3. Railway Integration

#### 🎯 **Phù Hợp Cho**
- Full-stack applications
- Database hosting
- Microservices
- Long-running processes

#### ⚙️ **Setup Guide**

```bash
# Bước 1: Cài đặt Railway CLI
npm install -g @railway/cli

# Bước 2: Login
railway login

# Bước 3: Initialize project
railway init
railway link [project-id]

# Bước 4: Deploy
railway up
```

#### 📝 **Configuration File**
```json
// railway.json
{
  "name": "edutech-platform",
  "deploy": {
    "startCommand": "npm start",
    "buildCommand": "npm run build"
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "PORT": "$PORT"
      }
    }
  },
  "services": [
    {
      "name": "web",
      "source": {
        "repo": "github.com/user/edutech-platform"
      }
    },
    {
      "name": "postgres",
      "source": {
        "image": "postgres:14"
      }
    }
  ]
}
```

---

## 💳 Payment Integration

### 1. Stripe Integration (International)

#### 🎯 **Tính Năng**
- Credit/Debit cards
- Subscription billing
- Invoice management
- Multi-currency support

#### ⚙️ **Setup Guide**

```bash
# Cài đặt Stripe SDK
npm install stripe @stripe/stripe-js

# Server-side setup
npm install @stripe/stripe-js
```

#### 💻 **Implementation**

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// API route: /api/create-payment-intent
export async function createPaymentIntent(amount: number, currency = 'vnd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: currency,
      metadata: {
        integration_check: 'accept_a_payment',
      },
    });

    return { client_secret: paymentIntent.client_secret };
  } catch (error) {
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
}
```

```tsx
// components/PaymentForm.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setLoading(true);

    const card = elements.getElement(CardElement);
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: card!,
    });

    if (error) {
      console.error('Payment error:', error);
    } else {
      console.log('Payment method:', paymentMethod);
      // Handle successful payment
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán'}
      </button>
    </form>
  );
}

export function PaymentContainer() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
```

### 2. VNPAY Integration (Vietnam)

#### 🎯 **Tính Năng**
- Thẻ ATM nội địa
- Internet Banking
- QR Code payment
- Mobile banking

#### ⚙️ **Setup Guide**

```bash
# Cài đặt VNPAY SDK
npm install vnpay
```

#### 💻 **Implementation**

```typescript
// lib/vnpay.ts
import crypto from 'crypto';

interface VNPayConfig {
  vnpTmnCode: string;
  vnpHashSecret: string;
  vnpUrl: string;
  vnpReturnUrl: string;
}

export class VNPayService {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
  }

  createPaymentUrl(order: {
    orderId: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
  }): string {
    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.vnpTmnCode,
      vnp_Amount: (order.amount * 100).toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.orderId,
      vnp_OrderInfo: order.orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.config.vnpReturnUrl,
      vnp_IpAddr: order.ipAddr,
      vnp_CreateDate: this.formatDate(new Date()),
    };

    // Sort parameters
    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = vnpParams[key];
        return result;
      }, {});

    // Create query string
    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // Create secure hash
    const hmac = crypto.createHmac('sha512', this.config.vnpHashSecret);
    const secureHash = hmac.update(queryString).digest('hex');

    return `${this.config.vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, '');
  }
}

// Usage in API route
export async function createVNPayUrl(req: Request) {
  const vnpay = new VNPayService({
    vnpTmnCode: process.env.VNP_TMN_CODE!,
    vnpHashSecret: process.env.VNP_HASH_SECRET!,
    vnpUrl: process.env.VNP_URL!,
    vnpReturnUrl: process.env.VNP_RETURN_URL!,
  });

  const paymentUrl = vnpay.createPaymentUrl({
    orderId: `ORDER_${Date.now()}`,
    amount: 100000, // 100,000 VND
    orderInfo: 'Thanh toan khoa hoc',
    ipAddr: req.headers['x-forwarded-for'] as string || '127.0.0.1',
  });

  return { paymentUrl };
}
```

### 3. MoMo Integration (Vietnam)

#### 🎯 **Tính Năng**
- MoMo wallet payment
- QR Code scanning
- Deep link integration
- Instant payment confirmation

#### 💻 **Implementation**

```typescript
// lib/momo.ts
import crypto from 'crypto';

interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
}

export class MoMoService {
  private config: MoMoConfig;

  constructor(config: MoMoConfig) {
    this.config = config;
  }

  async createPayment(order: {
    orderId: string;
    amount: number;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl: string;
  }) {
    const requestId = `${this.config.partnerCode}${Date.now()}`;
    const extraData = '';
    const requestType = 'captureWallet';

    // Create raw signature
    const rawSignature = [
      `accessKey=${this.config.accessKey}`,
      `amount=${order.amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${order.ipnUrl}`,
      `orderId=${order.orderId}`,
      `orderInfo=${order.orderInfo}`,
      `partnerCode=${this.config.partnerCode}`,
      `redirectUrl=${order.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`
    ].join('&');

    // Generate signature
    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId,
      amount: order.amount,
      orderId: order.orderId,
      orderInfo: order.orderInfo,
      redirectUrl: order.redirectUrl,
      ipnUrl: order.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    };

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`MoMo payment creation failed: ${error.message}`);
    }
  }
}
```

---

## ☁️ Cloud Services Integration

### 1. Google Cloud Platform

#### 🎯 **Services Used**
- **Compute Engine**: VM instances
- **Cloud Storage**: File storage
- **Cloud SQL**: Managed databases
- **Cloud Functions**: Serverless functions
- **Firebase**: Real-time features

#### ⚙️ **Setup Guide**

```bash
# Cài đặt Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Authenticate
gcloud auth login
gcloud config set project your-project-id
```

#### 📝 **Cloud Storage Integration**

```typescript
// lib/gcp-storage.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET!);

export async function uploadFile(
  file: Buffer, 
  fileName: string, 
  contentType: string
): Promise<string> {
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.on('finish', () => {
      // Make the file public
      blob.makePublic().then(() => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });
    });

    blobStream.end(file);
  });
}

export async function deleteFile(fileName: string): Promise<void> {
  await bucket.file(fileName).delete();
}
```

### 2. Firebase Integration

#### 🎯 **Services Used**
- **Authentication**: User management
- **Firestore**: NoSQL database
- **Realtime Database**: Real-time sync
- **Storage**: File uploads
- **Hosting**: Static site hosting

#### ⚙️ **Setup Guide**

```bash
# Cài đặt Firebase CLI
npm install -g firebase-tools

# Login và init
firebase login
firebase init
```

#### 📝 **Firebase Configuration**

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

#### 🔐 **Authentication Setup**

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
```

---

## 🤖 AI Services Integration

### 1. OpenAI Integration

#### 🎯 **Use Cases**
- Code generation
- Content creation
- Translation services
- Chatbot functionality

#### ⚙️ **Setup Guide**

```bash
# Cài đặt OpenAI SDK
npm install openai
```

#### 💻 **Implementation**

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCode(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert full-stack developer. Generate clean, production-ready code based on the user's requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLang}. Maintain the original tone and context.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    throw new Error(`Translation error: ${error.message}`);
  }
}
```

### 2. Google Gemini Integration

#### 🎯 **Use Cases**
- Multi-modal AI (text + images)
- Vietnamese language processing
- Cost-effective alternative to OpenAI

#### 💻 **Implementation**

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

export async function analyzeImage(imageBase64: string, prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Gemini Vision API error: ${error.message}`);
  }
}
```

---

## 📊 Analytics Integration

### 1. Google Analytics 4

#### ⚙️ **Setup Guide**

```bash
# Cài đặt Google Analytics
npm install gtag
```

#### 💻 **Implementation**

```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_location: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

```tsx
// pages/_app.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as gtag from '../lib/gtag';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

### 2. Facebook Pixel

#### 💻 **Implementation**

```typescript
// lib/facebook-pixel.ts
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  window.fbq('track', 'PageView');
};

export const event = (name: string, options = {}) => {
  window.fbq('track', name, options);
};

// Track specific events
export const trackPurchase = (value: number, currency = 'VND') => {
  window.fbq('track', 'Purchase', { value, currency });
};

export const trackLead = () => {
  window.fbq('track', 'Lead');
};

export const trackSignUp = () => {
  window.fbq('track', 'CompleteRegistration');
};
```

---

## 📧 Email & Communication

### 1. SendGrid Integration

#### ⚙️ **Setup Guide**

```bash
# Cài đặt SendGrid
npm install @sendgrid/mail
```

#### 💻 **Implementation**

```typescript
// lib/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
  templateId,
  dynamicTemplateData
}: {
  to: string;
  subject?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}) {
  try {
    const msg: any = {
      to,
      from: process.env.FROM_EMAIL!,
    };

    if (templateId) {
      msg.templateId = templateId;
      msg.dynamicTemplateData = dynamicTemplateData;
    } else {
      msg.subject = subject;
      msg.html = html;
    }

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Email sending failed');
  }
}

// Specific email functions
export const sendWelcomeEmail = (to: string, name: string) => {
  return sendEmail({
    to,
    templateId: 'd-xxxxx', // SendGrid template ID
    dynamicTemplateData: {
      name,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
    }
  });
};

export const sendPasswordResetEmail = (to: string, resetUrl: string) => {
  return sendEmail({
    to,
    templateId: 'd-yyyyy',
    dynamicTemplateData: {
      resetUrl
    }
  });
};
```

### 2. Zalo Integration (Vietnam)

#### 🎯 **Use Cases**
- OTP verification
- Order notifications
- Marketing messages
- Customer support

#### 💻 **Implementation**

```typescript
// lib/zalo.ts
interface ZaloConfig {
  appId: string;
  secretKey: string;
  oaId: string;
}

export class ZaloService {
  private config: ZaloConfig;
  private accessToken: string | null = null;

  constructor(config: ZaloConfig) {
    this.config = config;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          grant_type: 'authorization_code',
          code: 'your_authorization_code',
        }),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken!;
    } catch (error) {
      throw new Error(`Zalo authentication failed: ${error.message}`);
    }
  }

  async sendMessage(userId: string, message: string): Promise<void> {
    const accessToken = await this.getAccessToken();

    try {
      await fetch('https://openapi.zalo.me/v2.0/oa/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken,
        },
        body: JSON.stringify({
          recipient: {
            user_id: userId,
          },
          message: {
            text: message,
          },
        }),
      });
    } catch (error) {
      throw new Error(`Zalo message sending failed: ${error.message}`);
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const message = `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`;
    // Implementation depends on Zalo OTP service
    console.log(`Sending OTP ${otp} to ${phoneNumber}: ${message}`);
  }
}
```

---

## 🔧 Development Tools Integration

### 1. GitHub Integration

#### ⚙️ **Setup GitHub Actions**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
    - run: npm run lint
    - run: npm run type-check

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: npm audit
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    - uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### 2. Docker Integration

#### 📝 **Multi-stage Dockerfile**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 📝 **Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/edutech
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: edutech
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

## 🎯 Integration Best Practices

### 🔒 **Security Best Practices**

```typescript
// lib/security.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting
export const createRateLimit = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Security headers
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### 📊 **Monitoring Integration**

```typescript
// lib/monitoring.ts
import { createPrometheusMetrics } from 'prometheus-api-metrics';

// Prometheus metrics
export const metricsMiddleware = createPrometheusMetrics({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 3, 5, 10],
});

// Health check endpoint
export async function healthCheck() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_apis: await checkExternalAPIs(),
  };

  const isHealthy = Object.values(checks).every(check => check.status === 'healthy');

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  };
}

async function checkDatabase() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latency: '< 10ms' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

---

## 🚀 Bước Tiếp Theo

Sau khi hoàn thành tích hợp hệ thống, bạn có thể:

1. 💼 **Áp dụng vào dự án thực tế** - [Tình Huống Thực Tế](./05-tinh-huong-thuc-te.md)
2. ❓ **Giải quyết vấn đề** - [FAQ & Troubleshooting](./06-faq-troubleshooting.md)
3. 🎓 **Tham gia workshop** - [Workshop Materials](../workshops/)
4. 📖 **Tham khảo API** - [API Documentation](../reference/api-documentation.md)

---

*Với hệ thống tích hợp hoàn chỉnh, bạn có thể xây dựng sản phẩm có khả năng scale và đáp ứng mọi nhu cầu thị trường Việt Nam!*