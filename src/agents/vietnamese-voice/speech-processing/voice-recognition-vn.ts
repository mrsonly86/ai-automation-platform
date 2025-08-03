import { logger } from '../../../shared/utils/logger';
import { config } from '../../../shared/config';
import { SpeechRecognitionResult } from '../../../shared/types';

export class VoiceRecognitionVN {
  private recognition: any = null;
  private isListening = false;
  private currentDialect = 'vi-VN';

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if (typeof globalThis !== 'undefined' && (globalThis as any).window && 'webkitSpeechRecognition' in (globalThis as any).window) {
      // Browser environment with Web Speech API
      this.recognition = new ((globalThis as any).window).webkitSpeechRecognition();
      this.setupWebSpeechAPI();
    } else {
      // Node.js environment - use alternative speech recognition
      logger.info('Web Speech API not available, using alternative recognition');
      this.setupAlternativeRecognition();
    }
  }

  private setupWebSpeechAPI(): void {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentDialect;

    this.recognition.onstart = () => {
      this.isListening = true;
      logger.info('🎤 Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      logger.info('🎤 Voice recognition ended');
    };

    this.recognition.onerror = (event: any) => {
      logger.error('Voice recognition error:', event.error);
      this.isListening = false;
    };
  }

  private setupAlternativeRecognition(): void {
    // Mock recognition for server-side or when Web Speech API is not available
    logger.info('Setting up mock voice recognition for development');
  }

  /**
   * Start listening for Vietnamese voice commands
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      logger.warn('Voice recognition is already listening');
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.start();
      } else {
        logger.warn('Voice recognition not available');
      }
    } catch (error) {
      logger.error('Failed to start voice recognition:', error);
      throw new Error('Failed to start voice recognition');
    }
  }

  /**
   * Stop listening for voice commands
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.stop();
      }
      this.isListening = false;
    } catch (error) {
      logger.error('Failed to stop voice recognition:', error);
    }
  }

  /**
   * Process Vietnamese speech and return recognized text
   */
  async recognizeSpeech(audioData: ArrayBuffer): Promise<SpeechRecognitionResult> {
    try {
      // In a real implementation, this would send audio to a Vietnamese speech recognition service
      // For now, we'll simulate the recognition process
      
      const mockTranscripts = [
        'Tạo hóa đơn cho khách hàng Công ty ABC',
        'Hiển thị báo cáo doanh thu tháng này',
        'Gửi email đến nhà cung cấp',
        'Phê duyệt đơn xin nghỉ phép',
        'Kiểm tra tình trạng thanh toán',
        'Xuất báo cáo thuế VAT',
        'Tìm kiếm hợp đồng số 12345',
        'Lên lịch họp với khách hàng',
      ];

      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

      const result: SpeechRecognitionResult = {
        transcript: randomTranscript,
        confidence,
        alternatives: [
          randomTranscript,
          this.generateAlternative(randomTranscript),
        ],
        dialect: this.detectDialect(randomTranscript),
      };

      logger.info(`🎤 Speech recognized: "${result.transcript}" (${(result.confidence * 100).toFixed(1)}%)`);
      return result;
    } catch (error) {
      logger.error('Failed to recognize speech:', error);
      throw new Error('Speech recognition failed');
    }
  }

  /**
   * Set Vietnamese dialect (North, Central, South)
   */
  setDialect(dialect: 'north' | 'central' | 'south'): void {
    const dialectMap = {
      north: 'vi-VN',
      central: 'vi-VN-Central', 
      south: 'vi-VN-South',
    };

    this.currentDialect = dialectMap[dialect];
    
    if (this.recognition) {
      this.recognition.lang = this.currentDialect;
    }

    logger.info(`🗣️ Dialect set to: ${dialect} (${this.currentDialect})`);
  }

  /**
   * Process audio with noise cancellation
   */
  async processAudioWithNoiseReduction(audioData: ArrayBuffer): Promise<ArrayBuffer> {
    try {
      // Simulate noise reduction processing
      // In a real implementation, this would use audio processing libraries
      logger.info('🔊 Processing audio with noise reduction');
      
      // Return the same audio data for now (in real implementation, would apply noise reduction)
      return audioData;
    } catch (error) {
      logger.error('Failed to process audio:', error);
      throw new Error('Audio processing failed');
    }
  }

  /**
   * Detect Vietnamese dialect from text patterns
   */
  private detectDialect(text: string): string {
    // Simple dialect detection based on common words/patterns
    // This is a simplified approach - real implementation would use ML models
    
    const northernWords = ['tôi', 'ông', 'bà', 'anh ấy', 'cô ấy'];
    const centralWords = ['tui', 'ông', 'bà', 'ảnh', 'cô'];
    const southernWords = ['em', 'chú', 'cô', 'anh ta', 'chị ta'];

    const northernCount = northernWords.filter(word => text.includes(word)).length;
    const centralCount = centralWords.filter(word => text.includes(word)).length;
    const southernCount = southernWords.filter(word => text.includes(word)).length;

    if (southernCount > northernCount && southernCount > centralCount) {
      return 'south';
    } else if (centralCount > northernCount && centralCount > southernCount) {
      return 'central';
    } else {
      return 'north';
    }
  }

  private generateAlternative(transcript: string): string {
    // Generate alternative interpretation
    const alternatives = [
      transcript.replace('hóa đơn', 'hoá đơn'),
      transcript.replace('khách hàng', 'người mua'),
      transcript.replace('báo cáo', 'report'),
      transcript.replace('phê duyệt', 'approval'),
    ];

    return alternatives.find(alt => alt !== transcript) || transcript;
  }

  /**
   * Get listening status
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get current dialect setting
   */
  getCurrentDialect(): string {
    return this.currentDialect;
  }

  /**
   * Configure recognition settings
   */
  configure(options: {
    continuous?: boolean;
    interimResults?: boolean;
    maxAlternatives?: number;
  }): void {
    if (this.recognition) {
      if (options.continuous !== undefined) {
        this.recognition.continuous = options.continuous;
      }
      if (options.interimResults !== undefined) {
        this.recognition.interimResults = options.interimResults;
      }
      if (options.maxAlternatives !== undefined) {
        this.recognition.maxAlternatives = options.maxAlternatives;
      }
    }

    logger.info('🔧 Voice recognition configured with options:', options);
  }
}