# 🤖 Free AI APIs Setup Guide

Hướng dẫn cấu hình các AI API providers miễn phí cho AI Automation Platform.

## 🎯 Tổng quan AI Providers

| Provider | Free Quota | Tốc độ | Models | Best For |
|----------|------------|--------|--------|----------|
| Hugging Face | Unlimited | Trung bình | 200k+ models | General purpose |
| Google AI Studio | 60 requests/min | Nhanh | Gemini Pro | Text generation |
| Groq | 6,000 tokens/min | Rất nhanh | Llama, Mixtral | Fast inference |
| Together AI | $25 credit | Nhanh | 50+ models | Production |

## 🔧 Setup từng Provider

### 1. Hugging Face (Primary - Khuyến nghị)

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí, không giới hạn
- ✅ Hàng nghìn models có sẵn
- ✅ Hỗ trợ đầy đủ các task AI
- ✅ API đơn giản, dễ sử dụng

**Setup:**
1. Đăng ký tại: https://huggingface.co
2. Tạo Access Token:
   - Vào Settings → Access Tokens
   - Click "New token"
   - Chọn quyền "Read"
   - Copy token

**Configuration:**
```javascript
// lib/ai/huggingface.js
const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

export const huggingFaceModels = {
  // Text Generation
  textGeneration: "microsoft/DialoGPT-large",
  // Code Generation  
  codeGeneration: "codellama/CodeLlama-7b-Instruct-hf",
  // Text Classification
  textClassification: "facebook/bart-large-mnli",
  // Summarization
  summarization: "facebook/bart-large-cnn",
  // Translation
  translation: "Helsinki-NLP/opus-mt-en-vi",
  // Question Answering
  questionAnswering: "deepset/roberta-base-squad2"
};
```

**Usage Example:**
```javascript
async function generateText(prompt, model = "microsoft/DialoGPT-large") {
  const response = await fetch(`${HF_API_URL}${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_length: 100,
        temperature: 0.7
      }
    })
  });
  
  return await response.json();
}
```

### 2. Google AI Studio (Gemini)

**Ưu điểm:**
- ✅ API mạnh mẽ với Gemini Pro
- ✅ 60 requests/minute miễn phí
- ✅ Hỗ trợ multimodal (text + image)
- ✅ Tốc độ response nhanh

**Setup:**
1. Truy cập: https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy API key

**Configuration:**
```javascript
// lib/ai/google.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export const googleModels = {
  geminiPro: "gemini-pro",
  geminiProVision: "gemini-pro-vision"
};

export async function generateWithGemini(prompt, model = "gemini-pro") {
  const modelInstance = genAI.getGenerativeModel({ model });
  const result = await modelInstance.generateContent(prompt);
  return result.response.text();
}
```

### 3. Groq (Fast Inference)

**Ưu điểm:**
- ✅ Tốc độ cực nhanh (sub-second)
- ✅ 6,000 tokens/minute miễn phí
- ✅ Hỗ trợ Llama và Mixtral models
- ✅ API tương thích OpenAI

**Setup:**
1. Đăng ký tại: https://console.groq.com
2. Tạo API key tại API Keys section
3. Copy API key

**Configuration:**
```javascript
// lib/ai/groq.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const groqModels = {
  llama3_8b: "llama3-8b-8192",
  llama3_70b: "llama3-70b-8192",
  mixtral: "mixtral-8x7b-32768"
};

export async function generateWithGroq(prompt, model = "llama3-8b-8192") {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: model,
    temperature: 0.7,
    max_tokens: 1024
  });
  
  return completion.choices[0]?.message?.content;
}
```

### 4. Together AI

**Ưu điểm:**
- ✅ $25 free credits khi đăng ký
- ✅ 50+ open source models
- ✅ API tương thích OpenAI
- ✅ Hỗ trợ fine-tuning

**Setup:**
1. Đăng ký tại: https://api.together.xyz
2. Vào Settings → API Keys
3. Tạo và copy API key

**Configuration:**
```javascript
// lib/ai/together.js
import Together from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY
});

export const togetherModels = {
  llama2_7b: "togethercomputer/llama-2-7b-chat",
  llama2_13b: "togethercomputer/llama-2-13b-chat",
  codellama: "togethercomputer/CodeLlama-7b-Instruct"
};

export async function generateWithTogether(prompt, model) {
  const response = await together.completions.create({
    model: model,
    prompt: prompt,
    max_tokens: 512,
    temperature: 0.7
  });
  
  return response.choices[0]?.text;
}
```

## 🔄 Provider Fallback System

Để đảm bảo uptime cao, implement fallback system:

```javascript
// lib/ai/ai-provider.js
import { generateWithHuggingFace } from './huggingface';
import { generateWithGemini } from './google';
import { generateWithGroq } from './groq';
import { generateWithTogether } from './together';

const providers = [
  { name: 'huggingface', fn: generateWithHuggingFace, priority: 1 },
  { name: 'groq', fn: generateWithGroq, priority: 2 },
  { name: 'google', fn: generateWithGemini, priority: 3 },
  { name: 'together', fn: generateWithTogether, priority: 4 }
];

export async function generateWithFallback(prompt, options = {}) {
  const sortedProviders = providers.sort((a, b) => a.priority - b.priority);
  
  for (const provider of sortedProviders) {
    try {
      console.log(`Trying provider: ${provider.name}`);
      const result = await provider.fn(prompt, options);
      
      if (result) {
        console.log(`Success with provider: ${provider.name}`);
        return { result, provider: provider.name };
      }
    } catch (error) {
      console.warn(`Provider ${provider.name} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All AI providers failed');
}
```

## 📊 Usage Monitoring

Track API usage để tránh vượt quota:

```javascript
// lib/ai/usage-tracker.js
export class UsageTracker {
  constructor() {
    this.usage = new Map();
  }
  
  trackRequest(provider, tokens) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${provider}-${today}`;
    
    const current = this.usage.get(key) || 0;
    this.usage.set(key, current + tokens);
  }
  
  canMakeRequest(provider, tokens) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${provider}-${today}`;
    const current = this.usage.get(key) || 0;
    
    const limits = {
      groq: 6000, // tokens per minute
      google: 60, // requests per minute
      huggingface: Infinity,
      together: 1000000 // generous limit
    };
    
    return current + tokens <= limits[provider];
  }
}
```

## 🚀 Optimization Tips

### 1. Caching Responses
```javascript
// lib/ai/cache.js
const cache = new Map();

export function getCachedResponse(prompt) {
  return cache.get(prompt);
}

export function setCachedResponse(prompt, response) {
  cache.set(prompt, response);
  // Expire after 1 hour
  setTimeout(() => cache.delete(prompt), 3600000);
}
```

### 2. Request Batching
```javascript
// lib/ai/batch-processor.js
export class BatchProcessor {
  constructor(batchSize = 5, delay = 1000) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
  }
  
  async addRequest(prompt) {
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, resolve, reject });
      this.processBatch();
    });
  }
  
  async processBatch() {
    if (this.queue.length >= this.batchSize) {
      const batch = this.queue.splice(0, this.batchSize);
      // Process batch...
    }
  }
}
```

## 🔍 Testing APIs

```bash
# Test script
node scripts/test-ai-providers.js
```

```javascript
// scripts/test-ai-providers.js
import { generateWithFallback } from '../lib/ai/ai-provider.js';

async function testProviders() {
  const testPrompt = "Hello, how are you?";
  
  try {
    const result = await generateWithFallback(testPrompt);
    console.log('✅ AI providers working correctly');
    console.log('Response:', result.result);
    console.log('Provider used:', result.provider);
  } catch (error) {
    console.error('❌ AI providers test failed:', error.message);
  }
}

testProviders();
```

## 📝 Environment Setup

Add to your `.env.local`:

```env
# Primary provider
HUGGINGFACE_API_KEY=hf_your_token

# Fallback providers  
GOOGLE_AI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
TOGETHER_API_KEY=your_together_key

# Configuration
PRIMARY_AI_PROVIDER=huggingface
AUTO_FALLBACK_ENABLED=true
```

## 🆘 Troubleshooting

### Common Issues:

1. **Rate limit exceeded**
   - Switch to fallback provider
   - Implement exponential backoff
   - Cache responses

2. **API key invalid**
   - Regenerate API key
   - Check environment variables
   - Verify key permissions

3. **Model not found**
   - Check model name spelling
   - Verify model availability
   - Use alternative model

4. **Timeout errors**
   - Increase timeout duration
   - Use faster provider (Groq)
   - Implement retry logic

---

**Next Steps:** [Database Setup Guide](database.md)