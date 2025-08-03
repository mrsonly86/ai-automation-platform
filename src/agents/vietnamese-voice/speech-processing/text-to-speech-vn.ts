import { logger } from '../../../shared/utils/logger';

export class TextToSpeechVN {
  private synthesis: any = null;
  private currentVoice: any = null;
  private speed: number = 1.0;

  constructor() {
    this.initializeTTS();
  }

  private initializeTTS(): void {
    if (typeof globalThis !== 'undefined' && (globalThis as any).window && 'speechSynthesis' in (globalThis as any).window) {
      this.synthesis = (globalThis as any).window.speechSynthesis;
      this.loadVietnameseVoices();
    } else {
      logger.info('Speech Synthesis API not available, using alternative TTS');
    }
  }

  private loadVietnameseVoices(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    const vietnameseVoices = voices.filter((voice: any) => 
      voice.lang.startsWith('vi') || voice.lang.includes('VN')
    );

    if (vietnameseVoices.length > 0) {
      this.currentVoice = vietnameseVoices[0];
      logger.info(`🗣️ Vietnamese voice loaded: ${this.currentVoice.name}`);
    } else {
      logger.warn('No Vietnamese voices available, using default voice');
    }
  }

  /**
   * Convert Vietnamese text to speech
   */
  async speak(text: string, options?: {
    speed?: number;
    pitch?: number;
    volume?: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        logger.warn('Speech synthesis not available');
        resolve();
        return;
      }

      const utterance = new (globalThis as any).window.SpeechSynthesisUtterance(text);
      
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      utterance.rate = options?.speed || this.speed;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      utterance.lang = 'vi-VN';

      utterance.onend = () => {
        logger.info(`🗣️ Finished speaking: "${text.substring(0, 50)}..."`);
        resolve();
      };

      utterance.onerror = (error: any) => {
        logger.error('TTS error:', error);
        reject(error);
      };

      this.synthesis.speak(utterance);
      logger.info(`🗣️ Speaking: "${text.substring(0, 50)}..."`);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      logger.info('🔇 Speech stopped');
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
      logger.info('⏸️ Speech paused');
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
      logger.info('▶️ Speech resumed');
    }
  }

  /**
   * Set speech speed
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(0.1, Math.min(2.0, speed));
    logger.info(`🔊 Speech speed set to: ${this.speed}`);
  }

  /**
   * Get available Vietnamese voices
   */
  getVietnameseVoices(): any[] {
    if (!this.synthesis) return [];

    const voices = this.synthesis.getVoices();
    return voices.filter((voice: any) => 
      voice.lang.startsWith('vi') || voice.lang.includes('VN')
    );
  }

  /**
   * Set voice by name
   */
  setVoice(voiceName: string): boolean {
    if (!this.synthesis) return false;

    const voices = this.synthesis.getVoices();
    const voice = voices.find((v: any) => v.name === voiceName);

    if (voice) {
      this.currentVoice = voice;
      logger.info(`🗣️ Voice changed to: ${voiceName}`);
      return true;
    }

    logger.warn(`Voice not found: ${voiceName}`);
    return false;
  }

  /**
   * Generate speech with Vietnamese business pronunciation
   */
  async speakBusinessTerms(text: string): Promise<void> {
    // Preprocess business terms for better pronunciation
    const processedText = this.preprocessBusinessTerms(text);
    await this.speak(processedText, { speed: 0.9 }); // Slightly slower for business terms
  }

  /**
   * Convert financial numbers to Vietnamese pronunciation
   */
  private preprocessBusinessTerms(text: string): string {
    let processed = text;

    // Convert numbers to Vietnamese pronunciation
    processed = processed.replace(/(\d+),?(\d+)/g, (match, p1, p2) => {
      const number = parseInt(p1 + p2);
      return this.numberToVietnamese(number);
    });

    // Improve pronunciation of business terms
    const businessTerms = new Map([
      ['VAT', 'vét'],
      ['CEO', 'xi-i-ô'],
      ['CFO', 'xi-ép-ô'],
      ['CTO', 'xi-ti-ô'],
      ['API', 'ây-pi-ai'],
      ['XML', 'ích-em-en'],
      ['JSON', 'jay-sơn'],
      ['USD', 'đô-la Mỹ'],
      ['VND', 'đồng Việt Nam'],
    ]);

    businessTerms.forEach((pronunciation, term) => {
      const regex = new RegExp(term, 'gi');
      processed = processed.replace(regex, pronunciation);
    });

    return processed;
  }

  /**
   * Convert numbers to Vietnamese words
   */
  private numberToVietnamese(num: number): string {
    if (num === 0) return 'không';

    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    
    if (num < 10) return ones[num];
    if (num < 20) return 'mười' + (num > 10 ? ' ' + ones[num - 10] : '');
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
    }
    
    // For larger numbers, use simplified conversion
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' tỷ';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + ' triệu';
    if (num >= 1000) return (num / 1000).toFixed(1) + ' nghìn';
    
    return num.toString();
  }

  /**
   * Check if TTS is available and ready
   */
  isReady(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Get current TTS status
   */
  getStatus(): {
    available: boolean;
    speaking: boolean;
    paused: boolean;
    voicesCount: number;
    currentVoice?: string;
  } {
    if (!this.synthesis) {
      return {
        available: false,
        speaking: false,
        paused: false,
        voicesCount: 0,
      };
    }

    return {
      available: true,
      speaking: this.synthesis.speaking,
      paused: this.synthesis.paused,
      voicesCount: this.synthesis.getVoices().length,
      currentVoice: this.currentVoice?.name,
    };
  }
}