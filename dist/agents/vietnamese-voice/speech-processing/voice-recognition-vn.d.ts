import { SpeechRecognitionResult } from '../../../shared/types';
export declare class VoiceRecognitionVN {
    private recognition;
    private isListening;
    private currentDialect;
    constructor();
    private initializeSpeechRecognition;
    private setupWebSpeechAPI;
    private setupAlternativeRecognition;
    /**
     * Start listening for Vietnamese voice commands
     */
    startListening(): Promise<void>;
    /**
     * Stop listening for voice commands
     */
    stopListening(): Promise<void>;
    /**
     * Process Vietnamese speech and return recognized text
     */
    recognizeSpeech(audioData: ArrayBuffer): Promise<SpeechRecognitionResult>;
    /**
     * Set Vietnamese dialect (North, Central, South)
     */
    setDialect(dialect: 'north' | 'central' | 'south'): void;
    /**
     * Process audio with noise cancellation
     */
    processAudioWithNoiseReduction(audioData: ArrayBuffer): Promise<ArrayBuffer>;
    /**
     * Detect Vietnamese dialect from text patterns
     */
    private detectDialect;
    private generateAlternative;
    /**
     * Get listening status
     */
    isCurrentlyListening(): boolean;
    /**
     * Get current dialect setting
     */
    getCurrentDialect(): string;
    /**
     * Configure recognition settings
     */
    configure(options: {
        continuous?: boolean;
        interimResults?: boolean;
        maxAlternatives?: number;
    }): void;
}
//# sourceMappingURL=voice-recognition-vn.d.ts.map