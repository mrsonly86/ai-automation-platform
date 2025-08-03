import { SensorReading, EquipmentData } from '../../types/index';
import { logger } from '../../utils/logger';

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface AnomalyThresholds {
  temperature: { min: number; max: number; rate: number };
  vibration: { min: number; max: number; rate: number };
  pressure: { min: number; max: number; rate: number };
  humidity: { min: number; max: number; rate: number };
  current: { min: number; max: number; rate: number };
}

export class AnomalyDetection {
  private thresholds: AnomalyThresholds;
  private historicalData: Map<string, SensorReading[]> = new Map();
  private isInitialized = false;

  constructor(thresholds?: Partial<AnomalyThresholds>) {
    this.thresholds = {
      temperature: { min: -50, max: 150, rate: 10 }, // rate = max change per minute
      vibration: { min: 0, max: 100, rate: 20 },
      pressure: { min: 0, max: 1000, rate: 50 },
      humidity: { min: 0, max: 100, rate: 15 },
      current: { min: 0, max: 500, rate: 100 },
      ...thresholds,
    };
  }

  async initialize(): Promise<void> {
    this.isInitialized = true;
    logger.info('🔍 Anomaly Detection engine initialized successfully');
  }

  async detectAnomaly(sensorReading: SensorReading, equipmentHistory?: EquipmentData): Promise<AnomalyResult> {
    if (!this.isInitialized) {
      throw new Error('Anomaly Detection not initialized');
    }

    // Store reading in historical data
    this.updateHistoricalData(sensorReading);

    const anomalies: { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' }[] = [];

    // 1. Range-based anomaly detection
    const rangeAnomaly = this.detectRangeAnomaly(sensorReading);
    if (rangeAnomaly.score > 0) {
      anomalies.push(rangeAnomaly);
    }

    // 2. Rate of change anomaly detection
    const rateAnomaly = this.detectRateAnomaly(sensorReading);
    if (rateAnomaly.score > 0) {
      anomalies.push(rateAnomaly);
    }

    // 3. Statistical anomaly detection
    const statisticalAnomaly = this.detectStatisticalAnomaly(sensorReading);
    if (statisticalAnomaly.score > 0) {
      anomalies.push(statisticalAnomaly);
    }

    // 4. Pattern-based anomaly detection
    const patternAnomaly = this.detectPatternAnomaly(sensorReading);
    if (patternAnomaly.score > 0) {
      anomalies.push(patternAnomaly);
    }

    // 5. Correlation-based anomaly detection (if equipment history available)
    if (equipmentHistory) {
      const correlationAnomaly = this.detectCorrelationAnomaly(sensorReading, equipmentHistory);
      if (correlationAnomaly.score > 0) {
        anomalies.push(correlationAnomaly);
      }
    }

    // Aggregate results
    const isAnomaly = anomalies.length > 0;
    const maxScore = anomalies.length > 0 ? Math.max(...anomalies.map(a => a.score)) : 0;
    const worstSeverity = this.getWorstSeverity(anomalies.map(a => a.severity));
    const reasons = anomalies.map(a => a.reason).join(', ');
    const confidence = this.calculateConfidence(anomalies, sensorReading);
    const recommendations = this.generateRecommendations(anomalies, sensorReading);

    return {
      isAnomaly,
      score: maxScore,
      confidence,
      reason: reasons || 'Hoạt động bình thường',
      severity: worstSeverity || 'low',
      recommendations,
    };
  }

  private updateHistoricalData(sensorReading: SensorReading): void {
    const key = `${sensorReading.sensorId}_${sensorReading.type}`;
    
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, []);
    }
    
    const history = this.historicalData.get(key)!;
    history.push(sensorReading);
    
    // Keep only last 100 readings
    if (history.length > 100) {
      history.shift();
    }
  }

  private detectRangeAnomaly(sensorReading: SensorReading): { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
    const threshold = this.thresholds[sensorReading.type as keyof AnomalyThresholds];
    if (!threshold) {
      return { score: 0, reason: '', severity: 'low' };
    }

    const { value } = sensorReading;
    const { min, max } = threshold;

    if (value < min) {
      const score = Math.abs(value - min) / Math.abs(min) * 10;
      return {
        score: Math.min(10, score),
        reason: `${sensorReading.type} thấp hơn ngưỡng tối thiểu (${value} < ${min})`,
        severity: value < min * 0.5 ? 'critical' : value < min * 0.8 ? 'high' : 'medium',
      };
    }

    if (value > max) {
      const score = (value - max) / max * 10;
      return {
        score: Math.min(10, score),
        reason: `${sensorReading.type} vượt ngưỡng tối đa (${value} > ${max})`,
        severity: value > max * 1.5 ? 'critical' : value > max * 1.2 ? 'high' : 'medium',
      };
    }

    return { score: 0, reason: '', severity: 'low' };
  }

  private detectRateAnomaly(sensorReading: SensorReading): { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
    const key = `${sensorReading.sensorId}_${sensorReading.type}`;
    const history = this.historicalData.get(key);
    
    if (!history || history.length < 2) {
      return { score: 0, reason: '', severity: 'low' };
    }

    const threshold = this.thresholds[sensorReading.type as keyof AnomalyThresholds];
    if (!threshold) {
      return { score: 0, reason: '', severity: 'low' };
    }

    const lastReading = history[history.length - 1];
    const timeDiff = (sensorReading.timestamp.getTime() - lastReading.timestamp.getTime()) / (1000 * 60); // minutes
    
    if (timeDiff === 0) return { score: 0, reason: '', severity: 'low' };

    const rateOfChange = Math.abs(sensorReading.value - lastReading.value) / timeDiff;
    const maxRate = threshold.rate;

    if (rateOfChange > maxRate) {
      const score = (rateOfChange / maxRate) * 5;
      return {
        score: Math.min(10, score),
        reason: `Tốc độ thay đổi ${sensorReading.type} quá nhanh (${rateOfChange.toFixed(2)}/phút > ${maxRate}/phút)`,
        severity: rateOfChange > maxRate * 3 ? 'critical' : rateOfChange > maxRate * 2 ? 'high' : 'medium',
      };
    }

    return { score: 0, reason: '', severity: 'low' };
  }

  private detectStatisticalAnomaly(sensorReading: SensorReading): { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
    const key = `${sensorReading.sensorId}_${sensorReading.type}`;
    const history = this.historicalData.get(key);
    
    if (!history || history.length < 10) {
      return { score: 0, reason: '', severity: 'low' };
    }

    const values = history.map(reading => reading.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return { score: 0, reason: '', severity: 'low' };

    const zScore = Math.abs((sensorReading.value - mean) / stdDev);

    if (zScore > 3) {
      return {
        score: Math.min(10, zScore - 2),
        reason: `${sensorReading.type} có độ lệch thống kê cao (Z-score: ${zScore.toFixed(2)})`,
        severity: zScore > 5 ? 'critical' : zScore > 4 ? 'high' : 'medium',
      };
    }

    return { score: 0, reason: '', severity: 'low' };
  }

  private detectPatternAnomaly(sensorReading: SensorReading): { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
    const key = `${sensorReading.sensorId}_${sensorReading.type}`;
    const history = this.historicalData.get(key);
    
    if (!history || history.length < 20) {
      return { score: 0, reason: '', severity: 'low' };
    }

    // Check for sudden spikes or drops
    const recentValues = history.slice(-10).map(r => r.value);
    const olderValues = history.slice(-20, -10).map(r => r.value);
    
    const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const olderMean = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
    
    if (olderMean === 0) return { score: 0, reason: '', severity: 'low' };
    
    const percentChange = Math.abs((recentMean - olderMean) / olderMean) * 100;
    
    if (percentChange > 50) {
      return {
        score: Math.min(10, percentChange / 10),
        reason: `Phát hiện thay đổi đột ngột trong pattern ${sensorReading.type} (${percentChange.toFixed(1)}%)`,
        severity: percentChange > 100 ? 'critical' : percentChange > 75 ? 'high' : 'medium',
      };
    }

    // Check for stuck values (same value repeated)
    const uniqueRecent = new Set(recentValues).size;
    if (uniqueRecent === 1 && recentValues.length >= 5) {
      return {
        score: 6,
        reason: `${sensorReading.type} có giá trị không đổi trong thời gian dài`,
        severity: 'high',
      };
    }

    return { score: 0, reason: '', severity: 'low' };
  }

  private detectCorrelationAnomaly(
    sensorReading: SensorReading,
    equipmentHistory: EquipmentData
  ): { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' } {
    // Check correlation with other sensors on the same equipment
    const recentSensors = equipmentHistory.sensors
      .filter((s: SensorReading) => s.timestamp.getTime() > Date.now() - 5 * 60 * 1000) // Last 5 minutes
      .filter((s: SensorReading) => s.sensorId !== sensorReading.sensorId);

    if (recentSensors.length === 0) {
      return { score: 0, reason: '', severity: 'low' };
    }

    // Simple correlation checks based on domain knowledge
    if (sensorReading.type === 'temperature') {
      const vibrationSensors = recentSensors.filter((s: SensorReading) => s.type === 'vibration');
      if (vibrationSensors.length > 0) {
        const avgVibration = vibrationSensors.reduce((sum: number, s: SensorReading) => sum + s.value, 0) / vibrationSensors.length;
        
        // High temperature with high vibration is concerning
        if (sensorReading.value > 80 && avgVibration > 70) {
          return {
            score: 8,
            reason: `Nhiệt độ cao kết hợp với rung động mạnh báo hiệu có thể hỏng hóc`,
            severity: 'critical',
          };
        }
      }
    }

    if (sensorReading.type === 'current') {
      const tempSensors = recentSensors.filter((s: SensorReading) => s.type === 'temperature');
      if (tempSensors.length > 0) {
        const avgTemp = tempSensors.reduce((sum: number, s: SensorReading) => sum + s.value, 0) / tempSensors.length;
        
        // High current with normal temperature might indicate electrical issues
        if (sensorReading.value > 400 && avgTemp < 50) {
          return {
            score: 7,
            reason: `Dòng điện cao nhưng nhiệt độ bình thường có thể do sự cố điện`,
            severity: 'high',
          };
        }
      }
    }

    return { score: 0, reason: '', severity: 'low' };
  }

  private getWorstSeverity(severities: ('low' | 'medium' | 'high' | 'critical')[]): 'low' | 'medium' | 'high' | 'critical' {
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  private calculateConfidence(
    anomalies: { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' }[],
    sensorReading: SensorReading
  ): number {
    if (anomalies.length === 0) return 0.95; // High confidence for normal readings

    // Confidence decreases with multiple anomalies and higher scores
    const avgScore = anomalies.reduce((sum, a) => sum + a.score, 0) / anomalies.length;
    const maxConfidence = 0.9;
    const minConfidence = 0.6;
    
    // More anomalies = lower confidence
    const multipleAnomaliesPenalty = Math.max(0, (anomalies.length - 1) * 0.1);
    
    return Math.max(
      minConfidence,
      maxConfidence - (avgScore / 10) * 0.3 - multipleAnomaliesPenalty
    );
  }

  private generateRecommendations(
    anomalies: { score: number; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' }[],
    sensorReading: SensorReading
  ): string[] {
    if (anomalies.length === 0) {
      return ['Tiếp tục giám sát thường xuyên'];
    }

    const recommendations: string[] = [];
    const hasCritical = anomalies.some(a => a.severity === 'critical');
    const hasHigh = anomalies.some(a => a.severity === 'high');

    if (hasCritical) {
      recommendations.push('🚨 KHẨN CẤP: Dừng vận hành ngay lập tức');
      recommendations.push('Liên hệ kỹ thuật viên chuyên môn');
      recommendations.push('Kiểm tra toàn bộ hệ thống an toàn');
    } else if (hasHigh) {
      recommendations.push('⚠️ Cần can thiệp trong 24h');
      recommendations.push('Tăng tần suất giám sát');
      recommendations.push('Chuẩn bị kế hoạch bảo trì');
    } else {
      recommendations.push('📊 Theo dõi sát sao');
      recommendations.push('Ghi nhận bất thường vào nhật ký');
    }

    // Specific recommendations based on sensor type
    switch (sensorReading.type) {
      case 'temperature':
        if (anomalies.some(a => a.reason.includes('vượt ngưỡng'))) {
          recommendations.push('Kiểm tra hệ thống làm mát');
        }
        break;
      case 'vibration':
        if (anomalies.some(a => a.reason.includes('vượt ngưỡng'))) {
          recommendations.push('Kiểm tra bearing và coupling');
        }
        break;
      case 'pressure':
        if (anomalies.some(a => a.reason.includes('thấp hơn'))) {
          recommendations.push('Kiểm tra rò rỉ hệ thống');
        }
        break;
      case 'current':
        if (anomalies.some(a => a.reason.includes('vượt ngưỡng'))) {
          recommendations.push('Kiểm tra hệ thống điện');
        }
        break;
    }

    return recommendations;
  }

  updateThresholds(newThresholds: Partial<AnomalyThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    logger.info('📊 Anomaly detection thresholds updated');
  }

  getDetectionSummary(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      thresholds: this.thresholds,
      historicalDataPoints: Array.from(this.historicalData.entries()).map(([key, data]) => ({
        sensor: key,
        dataPoints: data.length,
      })),
    };
  }
}