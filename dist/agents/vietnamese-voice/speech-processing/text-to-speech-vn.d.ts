export declare class TextToSpeechVN {
    private synthesis;
    private currentVoice;
    private speed;
    constructor();
    private initializeTTS;
    private loadVietnameseVoices;
    /**
     * Convert Vietnamese text to speech
     */
    speak(text: string, options?: {
        speed?: number;
        pitch?: number;
        volume?: number;
    }): Promise<void>;
    /**
     * Stop current speech
     */
    stop(): void;
    /**
     * Pause current speech
     */
    pause(): void;
    /**
     * Resume paused speech
     */
    resume(): void;
    /**
     * Set speech speed
     */
    setSpeed(speed: number): void;
    /**
     * Get available Vietnamese voices
     */
    getVietnameseVoices(): any[];
    /**
     * Set voice by name
     */
    setVoice(voiceName: string): boolean;
    /**
     * Generate speech with Vietnamese business pronunciation
     */
    speakBusinessTerms(text: string): Promise<void>;
    /**
     * Convert financial numbers to Vietnamese pronunciation
     */
    private preprocessBusinessTerms;
    /**
     * Convert numbers to Vietnamese words
     */
    private numberToVietnamese;
    /**
     * Check if TTS is available and ready
     */
    isReady(): boolean;
    /**
     * Get current TTS status
     */
    getStatus(): {
        available: boolean;
        speaking: boolean;
        paused: boolean;
        voicesCount: number;
        currentVoice?: string;
    };
}
//# sourceMappingURL=text-to-speech-vn.d.ts.map