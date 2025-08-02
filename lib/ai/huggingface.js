/**
 * Hugging Face AI Provider
 * Free tier with unlimited inference
 */

const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

export const huggingFaceModels = {
  // Text Generation
  textGeneration: "microsoft/DialoGPT-large",
  textGenerationSmall: "gpt2",
  
  // Code Generation  
  codeGeneration: "codellama/CodeLlama-7b-Instruct-hf",
  codeCompletion: "Salesforce/codegen-350M-mono",
  
  // Text Classification
  textClassification: "facebook/bart-large-mnli",
  sentimentAnalysis: "cardiffnlp/twitter-roberta-base-sentiment-latest",
  
  // Summarization
  summarization: "facebook/bart-large-cnn",
  summarizationShort: "sshleifer/distilbart-cnn-6-6",
  
  // Translation
  translationEnVi: "Helsinki-NLP/opus-mt-en-vi",
  translationViEn: "Helsinki-NLP/opus-mt-vi-en",
  
  // Question Answering
  questionAnswering: "deepset/roberta-base-squad2",
  
  // Feature Extraction
  featureExtraction: "sentence-transformers/all-MiniLM-L6-v2",
  
  // Text to Image
  textToImage: "runwayml/stable-diffusion-v1-5",
  
  // Image Classification
  imageClassification: "google/vit-base-patch16-224",
};

/**
 * Generate text using Hugging Face models
 */
export async function generateText(prompt, options = {}) {
  const {
    model = huggingFaceModels.textGeneration,
    maxLength = 100,
    temperature = 0.7,
    topP = 0.9,
    repetitionPenalty = 1.2,
    returnFullText = false
  } = options;

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: maxLength,
          temperature,
          top_p: topP,
          repetition_penalty: repetitionPenalty,
          return_full_text: returnFullText,
          do_sample: temperature > 0
        },
        options: {
          wait_for_model: true,
          use_cache: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    if (Array.isArray(result) && result.length > 0) {
      return result[0].generated_text || result[0].text || result[0];
    }
    
    return result.generated_text || result.text || result;
  } catch (error) {
    console.error('Hugging Face generation error:', error);
    throw error;
  }
}

/**
 * Classify text using Hugging Face models
 */
export async function classifyText(text, options = {}) {
  const {
    model = huggingFaceModels.textClassification,
    candidateLabels = ["positive", "negative", "neutral"]
  } = options;

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          candidate_labels: candidateLabels
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face classification error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Hugging Face classification error:', error);
    throw error;
  }
}

/**
 * Summarize text using Hugging Face models
 */
export async function summarizeText(text, options = {}) {
  const {
    model = huggingFaceModels.summarization,
    maxLength = 150,
    minLength = 30
  } = options;

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: maxLength,
          min_length: minLength,
          do_sample: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face summarization error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.summary_text || result.summary_text || result;
  } catch (error) {
    console.error('Hugging Face summarization error:', error);
    throw error;
  }
}

/**
 * Translate text using Hugging Face models
 */
export async function translateText(text, options = {}) {
  const {
    model = huggingFaceModels.translationEnVi,
    maxLength = 512
  } = options;

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: maxLength
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face translation error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.translation_text || result.translation_text || result;
  } catch (error) {
    console.error('Hugging Face translation error:', error);
    throw error;
  }
}

/**
 * Answer questions using Hugging Face models
 */
export async function answerQuestion(question, context, options = {}) {
  const { model = huggingFaceModels.questionAnswering } = options;

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: {
          question,
          context
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face QA error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Hugging Face QA error:', error);
    throw error;
  }
}

/**
 * Generate code using Hugging Face models
 */
export async function generateCode(prompt, options = {}) {
  const {
    model = huggingFaceModels.codeGeneration,
    maxLength = 200,
    temperature = 0.3
  } = options;

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: maxLength,
          temperature,
          do_sample: temperature > 0,
          top_p: 0.95,
          repetition_penalty: 1.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face code generation error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.generated_text || result.generated_text || result;
  } catch (error) {
    console.error('Hugging Face code generation error:', error);
    throw error;
  }
}

/**
 * Check if Hugging Face service is available
 */
export async function checkHuggingFaceHealth() {
  try {
    const response = await fetch(`${HF_API_URL}gpt2`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "Hello",
        parameters: { max_length: 10 }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Hugging Face health check failed:', error);
    return false;
  }
}

/**
 * Get model info from Hugging Face
 */
export async function getModelInfo(modelName) {
  try {
    const response = await fetch(`https://huggingface.co/api/models/${modelName}`, {
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Model info error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Model info error:', error);
    throw error;
  }
}

export default {
  generateText,
  classifyText,
  summarizeText,
  translateText,
  answerQuestion,
  generateCode,
  checkHuggingFaceHealth,
  getModelInfo,
  models: huggingFaceModels
};