# 🗄️ Alternative Free APIs Guide

Hướng dẫn chi tiết về các AI API providers miễn phí thay thế cho OpenAI.

## 🎯 Tại sao chọn Free APIs?

### Lợi ích của Free Tier APIs:
- ✅ **Zero Cost**: Hoàn toàn miễn phí cho development và testing
- ✅ **No Credit Card**: Không cần thẻ tín dụng để bắt đầu
- ✅ **Learn & Experiment**: Tự do thử nghiệm mà không lo chi phí
- ✅ **Production Ready**: Nhiều free tiers đủ mạnh cho production
- ✅ **Diverse Models**: Access nhiều models khác nhau

### So sánh với OpenAI:
| Feature | OpenAI | Free Alternatives |
|---------|--------|-------------------|
| Cost | $0.002/1K tokens | Miễn phí |
| Setup | Credit card required | Chỉ cần email |
| Rate Limits | 3 RPM (free) | 60-6000 RPM |
| Models | GPT-3.5, GPT-4 | 200k+ models |
| Customization | Limited | Full access |

## 🤖 Primary Recommendations

### 1. 🏆 Hugging Face (Primary Choice)

**Tại sao chọn làm primary:**
- ✅ **Unlimited usage** - Không giới hạn requests
- ✅ **200k+ models** - Lựa chọn model đa dạng nhất
- ✅ **Stable infrastructure** - Uptime cao, hiệu năng ổn định
- ✅ **Active community** - Support tốt, documentation đầy đủ
- ✅ **Commercial friendly** - Cho phép sử dụng thương mại

**Setup Process:**
```bash
# 1. Sign up
open https://huggingface.co/join

# 2. Create access token
open https://huggingface.co/settings/tokens

# 3. Add to environment
echo "HUGGINGFACE_API_KEY=hf_your_token_here" >> .env.local
```

**Best Models to Use:**
```javascript
// Text Generation
const textModels = {
  general: "microsoft/DialoGPT-large",         // Good for conversations
  coding: "codellama/CodeLlama-7b-Instruct-hf", // Code generation
  small: "gpt2",                                // Fast, lightweight
  multilingual: "facebook/mbart-large-50"       // Supports Vietnamese
};

// Specialized Tasks
const taskModels = {
  summarization: "facebook/bart-large-cnn",
  translation: "Helsinki-NLP/opus-mt-en-vi",
  sentiment: "cardiffnlp/twitter-roberta-base-sentiment-latest",
  qa: "deepset/roberta-base-squad2"
};
```

**Usage Examples:**
```javascript
// Basic text generation
const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${HF_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    inputs: "The future of AI is",
    parameters: {
      max_length: 100,
      temperature: 0.7,
      do_sample: true
    }
  })
});

// Code generation
const codeResponse = await fetch("https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${HF_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    inputs: "def fibonacci(n):",
    parameters: {
      max_length: 200,
      temperature: 0.3
    }
  })
});
```

### 2. 🚀 Groq (Speed Champion)

**Tại sao chọn làm fallback:**
- ✅ **Extremely fast** - Sub-second response times
- ✅ **High quality** - Llama và Mixtral models
- ✅ **Generous limits** - 6,000 tokens/minute free
- ✅ **OpenAI compatible** - Easy integration

**Setup:**
```bash
# 1. Sign up
open https://console.groq.com

# 2. Create API key
# Go to API Keys section

# 3. Add to environment
echo "GROQ_API_KEY=gsk_your_key_here" >> .env.local
```

**Available Models:**
```javascript
const groqModels = {
  fastest: "llama3-8b-8192",      // Fastest response
  balanced: "llama3-70b-8192",    // Best quality/speed ratio
  powerful: "mixtral-8x7b-32768", // Most capable
};
```

**Usage Example:**
```javascript
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const completion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Explain quantum computing in simple terms"
    }
  ],
  model: "llama3-8b-8192",
  temperature: 0.7,
  max_tokens: 1024
});

console.log(completion.choices[0].message.content);
```

### 3. 🧠 Google AI Studio (Gemini)

**Tại sao chọn:**
- ✅ **Gemini Pro** - Google's latest model
- ✅ **Multimodal** - Text + Image processing
- ✅ **60 RPM free** - Decent limits for development
- ✅ **Quality reasoning** - Excellent for analysis tasks

**Setup:**
```bash
# 1. Get API key
open https://makersuite.google.com/app/apikey

# 2. Add to environment
echo "GOOGLE_AI_API_KEY=AIza_your_key_here" >> .env.local
```

**Usage Example:**
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Text generation
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const result = await model.generateContent("Explain machine learning");
console.log(result.response.text());

// Multimodal (text + image)
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
const imageResult = await visionModel.generateContent([
  "What's in this image?",
  {
    inlineData: {
      data: base64Image,
      mimeType: "image/jpeg"
    }
  }
]);
```

### 4. 🤝 Together AI (Model Variety)

**Tại sao chọn:**
- ✅ **$25 free credits** - Generous starting credit
- ✅ **50+ models** - Wide variety of open source models
- ✅ **Fine-tuning** - Custom model training
- ✅ **Research friendly** - Great for experimentation

**Setup:**
```bash
# 1. Sign up
open https://api.together.xyz

# 2. Get API key
# Go to Settings > API Keys

# 3. Add to environment
echo "TOGETHER_API_KEY=your_key_here" >> .env.local
```

**Popular Models:**
```javascript
const togetherModels = {
  chat: "togethercomputer/llama-2-7b-chat",
  code: "togethercomputer/CodeLlama-7b-Instruct",
  reasoning: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
  creative: "mistralai/Mixtral-8x7B-Instruct-v0.1"
};
```

## 🔄 Smart Fallback Strategy

### Implementation Priority:
1. **Primary:** Hugging Face (unlimited, reliable)
2. **Fast:** Groq (speed for real-time responses)
3. **Quality:** Google AI (advanced reasoning)
4. **Backup:** Together AI (when others fail)

### Fallback Logic:
```javascript
// lib/ai/smart-fallback.js
export async function smartGenerate(prompt, options = {}) {
  const strategies = [
    {
      provider: 'huggingface',
      condition: () => true, // Always try first
      model: options.model || 'microsoft/DialoGPT-large'
    },
    {
      provider: 'groq',
      condition: () => prompt.length < 1000, // Good for short prompts
      model: 'llama3-8b-8192'
    },
    {
      provider: 'google',
      condition: () => options.reasoning || options.analysis,
      model: 'gemini-pro'
    },
    {
      provider: 'together',
      condition: () => options.creative || options.experimental,
      model: 'togethercomputer/llama-2-7b-chat'
    }
  ];

  for (const strategy of strategies) {
    if (!strategy.condition()) continue;
    
    try {
      const result = await callProvider(strategy.provider, prompt, {
        model: strategy.model,
        ...options
      });
      
      if (result && result.trim()) {
        return {
          result: result.trim(),
          provider: strategy.provider,
          model: strategy.model
        };
      }
    } catch (error) {
      console.warn(`${strategy.provider} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All AI providers failed');
}
```

## 🎯 Use Case Specific Recommendations

### 📝 Text Generation & Chat
**Best Providers:**
1. **Hugging Face** - `microsoft/DialoGPT-large`
2. **Groq** - `llama3-8b-8192` (for speed)
3. **Google AI** - `gemini-pro` (for quality)

```javascript
const chatConfig = {
  primary: {
    provider: 'huggingface',
    model: 'microsoft/DialoGPT-large',
    params: { temperature: 0.7, max_length: 150 }
  },
  fallback: {
    provider: 'groq',
    model: 'llama3-8b-8192',
    params: { temperature: 0.7, max_tokens: 150 }
  }
};
```

### 💻 Code Generation
**Best Providers:**
1. **Hugging Face** - `codellama/CodeLlama-7b-Instruct-hf`
2. **Together AI** - `togethercomputer/CodeLlama-7b-Instruct`
3. **Groq** - `llama3-8b-8192` (for speed)

```javascript
const codeConfig = {
  provider: 'huggingface',
  model: 'codellama/CodeLlama-7b-Instruct-hf',
  params: { 
    temperature: 0.3, // Lower for more deterministic code
    max_length: 500
  }
};
```

### 📊 Analysis & Reasoning
**Best Providers:**
1. **Google AI** - `gemini-pro`
2. **Groq** - `mixtral-8x7b-32768`
3. **Together AI** - `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO`

```javascript
const analysisConfig = {
  provider: 'google',
  model: 'gemini-pro',
  params: { 
    temperature: 0.4,
    candidate_count: 1
  }
};
```

### 🌐 Translation
**Best Providers:**
1. **Hugging Face** - `Helsinki-NLP/opus-mt-en-vi`
2. **Google AI** - `gemini-pro` (with instructions)

```javascript
const translationConfig = {
  provider: 'huggingface',
  model: 'Helsinki-NLP/opus-mt-en-vi',
  params: { max_length: 512 }
};
```

### 📄 Summarization
**Best Providers:**
1. **Hugging Face** - `facebook/bart-large-cnn`
2. **Google AI** - `gemini-pro`

```javascript
const summaryConfig = {
  provider: 'huggingface',
  model: 'facebook/bart-large-cnn',
  params: { 
    max_length: 150,
    min_length: 30,
    do_sample: false
  }
};
```

## 🔒 Rate Limiting & Quotas

### Free Tier Limits:

| Provider | Rate Limit | Monthly Quota | Reset Period |
|----------|------------|---------------|--------------|
| Hugging Face | Unlimited | Unlimited | N/A |
| Groq | 6,000 tokens/min | ~2M tokens/month | Per minute |
| Google AI | 60 requests/min | 32,000 requests/month | Per minute |
| Together AI | ~$25 credits | Usage-based | Monthly |

### Quota Management:
```javascript
// lib/ai/quota-manager.js
export class QuotaManager {
  constructor() {
    this.usage = new Map();
    this.limits = {
      groq: { tokens: 6000, window: 60000 },
      google: { requests: 60, window: 60000 },
      together: { credits: 25, window: 30 * 24 * 60 * 60 * 1000 }
    };
  }
  
  canMakeRequest(provider, tokens = 1) {
    const limit = this.limits[provider];
    if (!limit) return true; // Unlimited (like Hugging Face)
    
    const now = Date.now();
    const windowStart = now - limit.window;
    
    // Clean old entries
    const key = `${provider}-${Math.floor(now / limit.window)}`;
    const current = this.usage.get(key) || 0;
    
    return current + tokens <= limit.tokens || limit.requests;
  }
  
  trackUsage(provider, tokens = 1) {
    const now = Date.now();
    const key = `${provider}-${Math.floor(now / this.limits[provider]?.window || 60000)}`;
    
    const current = this.usage.get(key) || 0;
    this.usage.set(key, current + tokens);
  }
}
```

## 🛡️ Error Handling & Resilience

### Common Error Patterns:
```javascript
// lib/ai/error-handler.js
export class AIProviderError extends Error {
  constructor(message, provider, code, retryable = false) {
    super(message);
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
  }
}

export function handleProviderError(error, provider) {
  // Rate limit errors
  if (error.status === 429) {
    return new AIProviderError(
      `Rate limit exceeded for ${provider}`,
      provider,
      'RATE_LIMIT',
      true
    );
  }
  
  // Authentication errors
  if (error.status === 401) {
    return new AIProviderError(
      `Invalid API key for ${provider}`,
      provider,
      'AUTH_ERROR',
      false
    );
  }
  
  // Service unavailable
  if (error.status >= 500) {
    return new AIProviderError(
      `${provider} service unavailable`,
      provider,
      'SERVICE_ERROR',
      true
    );
  }
  
  return new AIProviderError(
    error.message,
    provider,
    'UNKNOWN_ERROR',
    false
  );
}
```

### Retry Logic:
```javascript
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1 || !error.retryable) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
}
```

## 🔧 Advanced Configuration

### Provider-Specific Optimizations:

#### Hugging Face Optimization:
```javascript
const hfConfig = {
  // Use model-specific endpoints for better performance
  endpoints: {
    'gpt2': 'https://api-inference.huggingface.co/models/gpt2',
    'codellama': 'https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf'
  },
  
  // Optimize parameters per model
  modelParams: {
    'gpt2': { temperature: 0.7, max_length: 100 },
    'codellama': { temperature: 0.3, max_length: 500 }
  },
  
  // Enable caching for repeated requests
  cache: true,
  cacheTimeout: 3600000 // 1 hour
};
```

#### Multi-Model Ensemble:
```javascript
export async function ensembleGenerate(prompt, options = {}) {
  const providers = ['huggingface', 'groq', 'google'];
  
  // Generate from multiple providers
  const promises = providers.map(provider => 
    generateWithProvider(provider, prompt, options).catch(error => ({
      error: error.message,
      provider
    }))
  );
  
  const results = await Promise.allSettled(promises);
  
  // Filter successful results
  const successful = results
    .filter(result => result.status === 'fulfilled' && !result.value.error)
    .map(result => result.value);
  
  if (successful.length === 0) {
    throw new Error('All providers failed');
  }
  
  // Simple majority voting or quality scoring
  return selectBestResult(successful);
}
```

## 📊 Monitoring & Analytics

### Usage Tracking:
```javascript
// lib/ai/analytics.js
export class AIAnalytics {
  constructor() {
    this.metrics = {
      requests: new Map(),
      latency: new Map(),
      errors: new Map(),
      success: new Map()
    };
  }
  
  trackRequest(provider, model, latency, success, error = null) {
    const key = `${provider}-${model}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Track requests
    const requestKey = `${key}-${today}`;
    this.metrics.requests.set(requestKey, 
      (this.metrics.requests.get(requestKey) || 0) + 1
    );
    
    // Track latency
    if (latency) {
      this.metrics.latency.set(requestKey, 
        (this.metrics.latency.get(requestKey) || []).concat(latency)
      );
    }
    
    // Track success/errors
    if (success) {
      this.metrics.success.set(requestKey,
        (this.metrics.success.get(requestKey) || 0) + 1
      );
    } else {
      this.metrics.errors.set(requestKey,
        (this.metrics.errors.get(requestKey) || 0) + 1
      );
    }
  }
  
  generateReport() {
    const report = {
      totalRequests: 0,
      successRate: 0,
      averageLatency: 0,
      providerStats: {}
    };
    
    // Calculate metrics
    for (const [key, count] of this.metrics.requests) {
      const [provider, model, date] = key.split('-');
      const successCount = this.metrics.success.get(key) || 0;
      const latencies = this.metrics.latency.get(key) || [];
      
      if (!report.providerStats[provider]) {
        report.providerStats[provider] = {
          requests: 0,
          successes: 0,
          averageLatency: 0
        };
      }
      
      report.providerStats[provider].requests += count;
      report.providerStats[provider].successes += successCount;
      
      if (latencies.length > 0) {
        report.providerStats[provider].averageLatency = 
          latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      }
    }
    
    return report;
  }
}
```

---

## 💡 Pro Tips

### 1. Model Selection Strategy
- **Development:** Use fast, lightweight models (gpt2, llama3-8b)
- **Production:** Use more capable models (DialoGPT-large, mixtral)
- **Specialized Tasks:** Use task-specific models (BART for summarization)

### 2. Cost Optimization
- Cache responses for repeated queries
- Use smaller models for simple tasks
- Implement request deduplication
- Monitor usage patterns

### 3. Performance Optimization
- Use Groq for real-time applications
- Implement smart caching strategies
- Parallelize non-dependent requests
- Optimize prompt engineering

### 4. Reliability
- Always implement fallback providers
- Monitor provider health
- Set appropriate timeouts
- Handle rate limits gracefully

---

**🎯 Result:** With this multi-provider setup, bạn có thể build một AI platform robust, cost-effective và production-ready hoàn toàn miễn phí!