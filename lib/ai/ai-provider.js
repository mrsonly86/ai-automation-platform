/**
 * Multi-provider AI system with automatic fallback
 * Supports Hugging Face, Google AI, Groq, and Together AI
 */

import { generateText as generateHF, checkHuggingFaceHealth } from './huggingface.js';

// Dynamic imports to handle optional providers
let GoogleGenerativeAI, Groq, Together;

// Initialize providers if available
async function initializeProviders() {
  try {
    if (process.env.GOOGLE_AI_API_KEY) {
      const { GoogleGenerativeAI: GoogleAI } = await import('@google/generative-ai');
      GoogleGenerativeAI = GoogleAI;
    }
  } catch (error) {
    console.warn('Google AI not available:', error.message);
  }

  try {
    if (process.env.GROQ_API_KEY) {
      const GroqSDK = await import('groq-sdk');
      Groq = GroqSDK.default;
    }
  } catch (error) {
    console.warn('Groq not available:', error.message);
  }

  try {
    if (process.env.TOGETHER_API_KEY) {
      const TogetherSDK = await import('together-ai');
      Together = TogetherSDK.default;
    }
  } catch (error) {
    console.warn('Together AI not available:', error.message);
  }
}

// Provider configurations
export const providers = {
  huggingface: {
    name: 'Hugging Face',
    priority: 1,
    free: true,
    unlimited: true,
    models: {
      chat: 'microsoft/DialoGPT-large',
      code: 'codellama/CodeLlama-7b-Instruct-hf',
      summarization: 'facebook/bart-large-cnn'
    }
  },
  groq: {
    name: 'Groq',
    priority: 2,
    free: true,
    rateLimit: '6000 tokens/minute',
    models: {
      chat: 'llama3-8b-8192',
      fast: 'llama3-70b-8192',
      mixtral: 'mixtral-8x7b-32768'
    }
  },
  google: {
    name: 'Google AI Studio',
    priority: 3,
    free: true,
    rateLimit: '60 requests/minute',
    models: {
      chat: 'gemini-pro',
      vision: 'gemini-pro-vision'
    }
  },
  together: {
    name: 'Together AI',
    priority: 4,
    freeCredits: '$25',
    models: {
      chat: 'togethercomputer/llama-2-7b-chat',
      code: 'togethercomputer/CodeLlama-7b-Instruct'
    }
  }
};

/**
 * Usage tracker to monitor API calls and stay within free limits
 */
class UsageTracker {
  constructor() {
    this.usage = new Map();
    this.limits = {
      groq: { tokens: 6000, window: 60000 }, // 6000 tokens per minute
      google: { requests: 60, window: 60000 }, // 60 requests per minute
      huggingface: { unlimited: true },
      together: { generous: true }
    };
  }

  trackRequest(provider, tokens = 1) {
    const now = Date.now();
    const key = `${provider}-${Math.floor(now / this.limits[provider]?.window || 60000)}`;
    
    const current = this.usage.get(key) || 0;
    this.usage.set(key, current + tokens);
  }

  canMakeRequest(provider, tokens = 1) {
    if (this.limits[provider]?.unlimited) return true;
    
    const now = Date.now();
    const key = `${provider}-${Math.floor(now / this.limits[provider]?.window || 60000)}`;
    const current = this.usage.get(key) || 0;
    
    const limit = this.limits[provider]?.tokens || this.limits[provider]?.requests || 1000;
    return current + tokens <= limit;
  }

  getUsage(provider) {
    const now = Date.now();
    const key = `${provider}-${Math.floor(now / this.limits[provider]?.window || 60000)}`;
    return this.usage.get(key) || 0;
  }
}

const usageTracker = new UsageTracker();

/**
 * Generate text with Hugging Face
 */
async function generateWithHuggingFace(prompt, options = {}) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    const result = await generateHF(prompt, options);
    usageTracker.trackRequest('huggingface', prompt.length);
    return result;
  } catch (error) {
    console.error('Hugging Face error:', error);
    throw error;
  }
}

/**
 * Generate text with Google AI (Gemini)
 */
async function generateWithGoogle(prompt, options = {}) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  if (!usageTracker.canMakeRequest('google')) {
    throw new Error('Google AI rate limit exceeded');
  }

  try {
    if (!GoogleGenerativeAI) {
      await initializeProviders();
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: options.model || 'gemini-pro' 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    usageTracker.trackRequest('google');
    return text;
  } catch (error) {
    console.error('Google AI error:', error);
    throw error;
  }
}

/**
 * Generate text with Groq
 */
async function generateWithGroq(prompt, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const estimatedTokens = Math.ceil(prompt.length / 4); // Rough token estimation
  if (!usageTracker.canMakeRequest('groq', estimatedTokens)) {
    throw new Error('Groq rate limit exceeded');
  }

  try {
    if (!Groq) {
      await initializeProviders();
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: options.model || 'llama3-8b-8192',
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1024,
    });

    const result = completion.choices[0]?.message?.content;
    usageTracker.trackRequest('groq', estimatedTokens);
    return result;
  } catch (error) {
    console.error('Groq error:', error);
    throw error;
  }
}

/**
 * Generate text with Together AI
 */
async function generateWithTogether(prompt, options = {}) {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('Together AI API key not configured');
  }

  try {
    if (!Together) {
      await initializeProviders();
    }

    const together = new Together({
      apiKey: process.env.TOGETHER_API_KEY
    });

    const response = await together.completions.create({
      model: options.model || 'togethercomputer/llama-2-7b-chat',
      prompt: prompt,
      max_tokens: options.maxTokens || 512,
      temperature: options.temperature || 0.7,
    });

    const result = response.choices[0]?.text;
    usageTracker.trackRequest('together');
    return result;
  } catch (error) {
    console.error('Together AI error:', error);
    throw error;
  }
}

/**
 * Health check functions for each provider
 */
export const healthChecks = {
  async huggingface() {
    return await checkHuggingFaceHealth();
  },

  async google() {
    if (!process.env.GOOGLE_AI_API_KEY) return false;
    try {
      await generateWithGoogle('Hello', { maxTokens: 5 });
      return true;
    } catch {
      return false;
    }
  },

  async groq() {
    if (!process.env.GROQ_API_KEY) return false;
    try {
      await generateWithGroq('Hello', { maxTokens: 5 });
      return true;
    } catch {
      return false;
    }
  },

  async together() {
    if (!process.env.TOGETHER_API_KEY) return false;
    try {
      await generateWithTogether('Hello', { maxTokens: 5 });
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Get available providers based on configuration
 */
export function getAvailableProviders() {
  const available = [];
  
  if (process.env.HUGGINGFACE_API_KEY) available.push('huggingface');
  if (process.env.GOOGLE_AI_API_KEY) available.push('google');
  if (process.env.GROQ_API_KEY) available.push('groq');
  if (process.env.TOGETHER_API_KEY) available.push('together');
  
  return available.sort((a, b) => providers[a].priority - providers[b].priority);
}

/**
 * Generate text with automatic fallback between providers
 */
export async function generateWithFallback(prompt, options = {}) {
  const { 
    preferredProvider,
    maxRetries = 3,
    enableFallback = process.env.AUTO_FALLBACK_ENABLED !== 'false',
    ...generateOptions 
  } = options;

  const availableProviders = getAvailableProviders();
  
  if (availableProviders.length === 0) {
    throw new Error('No AI providers configured. Please add API keys to your environment.');
  }

  // Use preferred provider first, then fallback to others
  const providerOrder = preferredProvider && availableProviders.includes(preferredProvider)
    ? [preferredProvider, ...availableProviders.filter(p => p !== preferredProvider)]
    : availableProviders;

  const errors = [];
  
  for (const providerName of providerOrder) {
    try {
      console.log(`🤖 Trying provider: ${providers[providerName].name}`);
      
      let result;
      switch (providerName) {
        case 'huggingface':
          result = await generateWithHuggingFace(prompt, generateOptions);
          break;
        case 'google':
          result = await generateWithGoogle(prompt, generateOptions);
          break;
        case 'groq':
          result = await generateWithGroq(prompt, generateOptions);
          break;
        case 'together':
          result = await generateWithTogether(prompt, generateOptions);
          break;
        default:
          throw new Error(`Unknown provider: ${providerName}`);
      }

      if (result && result.trim()) {
        console.log(`✅ Success with ${providers[providerName].name}`);
        return {
          result: result.trim(),
          provider: providerName,
          usage: usageTracker.getUsage(providerName)
        };
      }
    } catch (error) {
      console.warn(`❌ ${providers[providerName].name} failed:`, error.message);
      errors.push({ provider: providerName, error: error.message });
      
      if (!enableFallback) {
        throw error;
      }
      
      continue;
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Errors: ${JSON.stringify(errors)}`);
}

/**
 * Batch process multiple prompts efficiently
 */
export async function batchGenerate(prompts, options = {}) {
  const { 
    batchSize = 3,
    delay = 1000,
    ...generateOptions 
  } = options;

  const results = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(prompt => generateWithFallback(prompt, generateOptions))
    );
    
    results.push(...batchResults);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Get provider status and usage information
 */
export async function getProviderStatus() {
  const availableProviders = getAvailableProviders();
  const status = {};

  for (const provider of availableProviders) {
    try {
      const isHealthy = await healthChecks[provider]();
      const usage = usageTracker.getUsage(provider);
      
      status[provider] = {
        name: providers[provider].name,
        healthy: isHealthy,
        usage,
        priority: providers[provider].priority,
        free: providers[provider].free || false,
        rateLimit: providers[provider].rateLimit || 'None'
      };
    } catch (error) {
      status[provider] = {
        name: providers[provider].name,
        healthy: false,
        error: error.message
      };
    }
  }

  return status;
}

/**
 * Smart provider selection based on request type and load
 */
export function selectOptimalProvider(requestType = 'general', options = {}) {
  const availableProviders = getAvailableProviders();
  
  // Provider preferences by request type
  const preferences = {
    general: ['huggingface', 'groq', 'google', 'together'],
    fast: ['groq', 'huggingface', 'google', 'together'],
    code: ['huggingface', 'together', 'groq', 'google'],
    creative: ['google', 'together', 'groq', 'huggingface'],
    analysis: ['google', 'huggingface', 'together', 'groq']
  };

  const preferred = preferences[requestType] || preferences.general;
  
  // Return first available provider from preference list
  for (const provider of preferred) {
    if (availableProviders.includes(provider) && usageTracker.canMakeRequest(provider)) {
      return provider;
    }
  }
  
  // Fallback to any available provider
  return availableProviders[0] || null;
}

// Initialize providers on module load
initializeProviders().catch(console.warn);

export default {
  generateWithFallback,
  batchGenerate,
  getProviderStatus,
  selectOptimalProvider,
  getAvailableProviders,
  providers,
  usageTracker
};