import { VoiceEntity } from '../../../shared/types';
export declare class VietnameseTokenizer {
    private businessTerms;
    private stopWords;
    constructor();
    private initializeBusinessTerms;
    private initializeStopWords;
    /**
     * Tokenize Vietnamese text into meaningful tokens
     */
    tokenize(text: string): string[];
    /**
     * Extract business entities from tokenized text
     */
    extractEntities(tokens: string[]): VoiceEntity[];
    /**
     * Recognize intent from Vietnamese command
     */
    recognizeIntent(tokens: string[]): {
        intent: string;
        confidence: number;
    };
    private normalizeText;
    private segmentWords;
    private processTokens;
    private isNumber;
    private isDate;
    private isAmount;
    /**
     * Add custom business terms
     */
    addBusinessTerm(vietnamese: string, category: string): void;
    /**
     * Get all business terms
     */
    getBusinessTerms(): Map<string, string>;
    /**
     * Analyze text complexity for Vietnamese
     */
    analyzeComplexity(text: string): {
        wordCount: number;
        uniqueWords: number;
        businessTerms: number;
        complexity: 'simple' | 'moderate' | 'complex';
    };
}
//# sourceMappingURL=vietnamese-tokenizer.d.ts.map