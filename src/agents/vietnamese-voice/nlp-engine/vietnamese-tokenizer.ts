import { logger } from '../../../shared/utils/logger';
import { VoiceCommand, VoiceEntity } from '../../../shared/types';

export class VietnameseTokenizer {
  private businessTerms!: Map<string, string>;
  private stopWords!: Set<string>;

  constructor() {
    this.initializeBusinessTerms();
    this.initializeStopWords();
  }

  private initializeBusinessTerms(): void {
    this.businessTerms = new Map([
      // Finance terms
      ['hóa đơn', 'INVOICE'],
      ['hoá đơn', 'INVOICE'],
      ['báo cáo', 'REPORT'],
      ['doanh thu', 'REVENUE'],
      ['chi phí', 'EXPENSE'],
      ['thuế', 'TAX'],
      ['VAT', 'VAT'],
      ['tiền', 'MONEY'],
      ['thanh toán', 'PAYMENT'],
      ['ngân hàng', 'BANK'],
      
      // HR terms
      ['nhân viên', 'EMPLOYEE'],
      ['lương', 'SALARY'],
      ['nghỉ phép', 'LEAVE'],
      ['chấm công', 'ATTENDANCE'],
      ['hợp đồng', 'CONTRACT'],
      ['phòng ban', 'DEPARTMENT'],
      
      // Operations terms
      ['khách hàng', 'CUSTOMER'],
      ['nhà cung cấp', 'SUPPLIER'],
      ['đơn hàng', 'ORDER'],
      ['sản phẩm', 'PRODUCT'],
      ['dịch vụ', 'SERVICE'],
      ['kho', 'WAREHOUSE'],
      
      // Actions
      ['tạo', 'CREATE'],
      ['hiển thị', 'SHOW'],
      ['gửi', 'SEND'],
      ['phê duyệt', 'APPROVE'],
      ['từ chối', 'REJECT'],
      ['kiểm tra', 'CHECK'],
      ['tìm kiếm', 'SEARCH'],
      ['xuất', 'EXPORT'],
      ['in', 'PRINT'],
      ['lưu', 'SAVE'],
      ['xóa', 'DELETE'],
      ['cập nhật', 'UPDATE'],
    ]);
  }

  private initializeStopWords(): void {
    this.stopWords = new Set([
      'và', 'của', 'cho', 'với', 'từ', 'đến', 'trong', 'ngoài',
      'trên', 'dưới', 'về', 'bằng', 'theo', 'như', 'tại', 'khi',
      'nếu', 'mà', 'để', 'rằng', 'này', 'đó', 'những', 'các',
      'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười',
      'là', 'có', 'được', 'sẽ', 'đã', 'sẽ', 'không', 'chưa',
    ]);
  }

  /**
   * Tokenize Vietnamese text into meaningful tokens
   */
  tokenize(text: string): string[] {
    // Vietnamese text processing with word segmentation
    const normalizedText = this.normalizeText(text);
    const words = this.segmentWords(normalizedText);
    const tokens = this.processTokens(words);
    
    logger.info(`🔤 Tokenized "${text}" into ${tokens.length} tokens`);
    return tokens;
  }

  /**
   * Extract business entities from tokenized text
   */
  extractEntities(tokens: string[]): VoiceEntity[] {
    const entities: VoiceEntity[] = [];
    let position = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const businessTerm = this.businessTerms.get(token.toLowerCase());
      
      if (businessTerm) {
        entities.push({
          type: businessTerm,
          value: token,
          start: position,
          end: position + token.length,
          confidence: 0.9,
        });
      }

      // Check for compound entities (e.g., "khách hàng ABC")
      if (i < tokens.length - 1) {
        const compound = `${token} ${tokens[i + 1]}`.toLowerCase();
        const compoundTerm = this.businessTerms.get(compound);
        
        if (compoundTerm) {
          entities.push({
            type: compoundTerm,
            value: `${token} ${tokens[i + 1]}`,
            start: position,
            end: position + token.length + tokens[i + 1].length + 1,
            confidence: 0.95,
          });
          i++; // Skip next token as it's part of compound
        }
      }

      // Detect numbers, dates, amounts
      if (this.isNumber(token)) {
        entities.push({
          type: 'NUMBER',
          value: token,
          start: position,
          end: position + token.length,
          confidence: 0.99,
        });
      }

      if (this.isDate(token)) {
        entities.push({
          type: 'DATE',
          value: token,
          start: position,
          end: position + token.length,
          confidence: 0.95,
        });
      }

      if (this.isAmount(token)) {
        entities.push({
          type: 'AMOUNT',
          value: token,
          start: position,
          end: position + token.length,
          confidence: 0.98,
        });
      }

      position += token.length + 1; // +1 for space
    }

    logger.info(`🏷️ Extracted ${entities.length} entities`);
    return entities;
  }

  /**
   * Recognize intent from Vietnamese command
   */
  recognizeIntent(tokens: string[]): { intent: string; confidence: number } {
    const actionWords = tokens.filter(token => 
      this.businessTerms.get(token.toLowerCase())?.match(/CREATE|SHOW|SEND|APPROVE|REJECT|CHECK|SEARCH|EXPORT|PRINT|SAVE|DELETE|UPDATE/)
    );

    const entityWords = tokens.filter(token => 
      this.businessTerms.get(token.toLowerCase())?.match(/INVOICE|REPORT|CUSTOMER|EMPLOYEE|ORDER|PRODUCT/)
    );

    // Intent mapping based on action + entity combinations
    if (actionWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'CREATE')) {
      if (entityWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'INVOICE')) {
        return { intent: 'CREATE_INVOICE', confidence: 0.95 };
      }
      if (entityWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'REPORT')) {
        return { intent: 'CREATE_REPORT', confidence: 0.95 };
      }
      return { intent: 'CREATE_ENTITY', confidence: 0.8 };
    }

    if (actionWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'SHOW')) {
      if (entityWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'REPORT')) {
        return { intent: 'SHOW_REPORT', confidence: 0.95 };
      }
      return { intent: 'SHOW_INFO', confidence: 0.85 };
    }

    if (actionWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'APPROVE')) {
      return { intent: 'APPROVE_REQUEST', confidence: 0.9 };
    }

    if (actionWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'SEARCH')) {
      return { intent: 'SEARCH_DATA', confidence: 0.9 };
    }

    if (actionWords.some(w => this.businessTerms.get(w.toLowerCase()) === 'SEND')) {
      return { intent: 'SEND_COMMUNICATION', confidence: 0.88 };
    }

    // Default intent for unclear commands
    return { intent: 'GENERAL_QUERY', confidence: 0.5 };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  private segmentWords(text: string): string[] {
    // Simple word segmentation for Vietnamese
    // In a real implementation, this would use a Vietnamese word segmentation library
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    // Handle Vietnamese compound words
    const segmented: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check if current word + next word forms a compound business term
      if (i < words.length - 1) {
        const compound = `${word} ${words[i + 1]}`;
        if (this.businessTerms.has(compound)) {
          segmented.push(compound);
          i++; // Skip next word
          continue;
        }
      }
      
      segmented.push(word);
    }
    
    return segmented;
  }

  private processTokens(words: string[]): string[] {
    return words
      .filter(word => !this.stopWords.has(word.toLowerCase()))
      .filter(word => word.length > 1); // Remove single character tokens
  }

  private isNumber(token: string): boolean {
    return /^\d+$/.test(token) || /^\d+\.\d+$/.test(token);
  }

  private isDate(token: string): boolean {
    // Vietnamese date patterns: dd/mm/yyyy, dd-mm-yyyy, etc.
    return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(token) ||
           /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2}$/.test(token);
  }

  private isAmount(token: string): boolean {
    // Vietnamese currency patterns
    return /^\d+[\.,]?\d*\s*(đồng|vnd|vnđ|k|tr|tỷ)$/i.test(token) ||
           /^\d+[\.,]?\d*$/.test(token);
  }

  /**
   * Add custom business terms
   */
  addBusinessTerm(vietnamese: string, category: string): void {
    this.businessTerms.set(vietnamese.toLowerCase(), category.toUpperCase());
    logger.info(`📝 Added business term: ${vietnamese} -> ${category}`);
  }

  /**
   * Get all business terms
   */
  getBusinessTerms(): Map<string, string> {
    return new Map(this.businessTerms);
  }

  /**
   * Analyze text complexity for Vietnamese
   */
  analyzeComplexity(text: string): {
    wordCount: number;
    uniqueWords: number;
    businessTerms: number;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const tokens = this.tokenize(text);
    const uniqueWords = new Set(tokens.map(t => t.toLowerCase())).size;
    const businessTermCount = tokens.filter(token => 
      this.businessTerms.has(token.toLowerCase())
    ).length;

    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (tokens.length > 10 || businessTermCount > 3) {
      complexity = 'moderate';
    }
    if (tokens.length > 20 || businessTermCount > 5) {
      complexity = 'complex';
    }

    return {
      wordCount: tokens.length,
      uniqueWords,
      businessTerms: businessTermCount,
      complexity,
    };
  }
}