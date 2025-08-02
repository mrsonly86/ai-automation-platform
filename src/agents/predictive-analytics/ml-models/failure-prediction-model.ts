import * as tf from '@tensorflow/tfjs-node';
import { SensorReading, EquipmentData, FailurePrediction } from '../../types';
import { logger } from '../../utils/logger';

export class FailurePredictionModel {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private readonly sequenceLength = 100; // 100 time steps for prediction
  private readonly features = ['temperature', 'vibration', 'pressure', 'humidity', 'current'];

  async initialize(): Promise<void> {
    try {
      await this.buildModel();
      this.isInitialized = true;
      logger.info('🔧 Failure Prediction Model initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Failure Prediction Model:', error);
      throw error;
    }
  }

  private async buildModel(): Promise<void> {
    // Create LSTM model for time series prediction
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 64,
          returnSequences: true,
          inputShape: [this.sequenceLength, this.features.length],
          dropout: 0.2,
          recurrentDropout: 0.2,
        }),
        tf.layers.lstm({
          units: 32,
          returnSequences: false,
          dropout: 0.2,
          recurrentDropout: 0.2,
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid', // Probability of failure
        }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    logger.info('🧠 LSTM model for failure prediction created');
  }

  async predictFailure(equipmentData: EquipmentData): Promise<FailurePrediction> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    const processedData = this.preprocessData(equipmentData.sensors);
    const prediction = await this.model.predict(processedData) as tf.Tensor;
    const failureProbability = await prediction.data();

    // Clean up tensors
    processedData.dispose();
    prediction.dispose();

    const probability = failureProbability[0];
    const timeToFailure = this.calculateTimeToFailure(probability);
    const severity = this.determineSeverity(probability);
    const recommendedActions = this.generateRecommendations(probability, equipmentData);

    return {
      equipmentId: equipmentData.equipmentId,
      predictionDate: new Date(),
      failureProbability: probability,
      timeToFailure,
      recommendedActions,
      severity,
    };
  }

  private preprocessData(sensors: SensorReading[]): tf.Tensor {
    // Sort sensors by timestamp
    const sortedSensors = sensors.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Create feature matrix
    const sequences: number[][] = [];
    const latestReadings = sortedSensors.slice(-this.sequenceLength);
    
    for (const reading of latestReadings) {
      const features = this.features.map(feature => {
        const sensorValue = sortedSensors.find(s => s.type === feature);
        return sensorValue ? this.normalizeValue(sensorValue.value, feature) : 0;
      });
      sequences.push(features);
    }

    // Pad sequences if needed
    while (sequences.length < this.sequenceLength) {
      sequences.unshift(new Array(this.features.length).fill(0));
    }

    return tf.tensor3d([sequences], [1, this.sequenceLength, this.features.length]);
  }

  private normalizeValue(value: number, feature: string): number {
    // Simple min-max normalization - in production, use proper scaling
    const ranges: Record<string, { min: number; max: number }> = {
      temperature: { min: -50, max: 150 },
      vibration: { min: 0, max: 100 },
      pressure: { min: 0, max: 1000 },
      humidity: { min: 0, max: 100 },
      current: { min: 0, max: 500 },
    };

    const range = ranges[feature] || { min: 0, max: 100 };
    return (value - range.min) / (range.max - range.min);
  }

  private calculateTimeToFailure(probability: number): number {
    // Simple heuristic: higher probability = shorter time to failure
    if (probability > 0.8) return 1; // 1 day
    if (probability > 0.6) return 7; // 1 week
    if (probability > 0.4) return 30; // 1 month
    if (probability > 0.2) return 90; // 3 months
    return 365; // 1 year
  }

  private determineSeverity(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability > 0.8) return 'critical';
    if (probability > 0.6) return 'high';
    if (probability > 0.3) return 'medium';
    return 'low';
  }

  private generateRecommendations(probability: number, equipment: EquipmentData): string[] {
    const recommendations: string[] = [];

    if (probability > 0.8) {
      recommendations.push('Dừng vận hành ngay lập tức');
      recommendations.push('Kiểm tra toàn bộ hệ thống');
      recommendations.push('Liên hệ kỹ thuật viên chuyên môn');
    } else if (probability > 0.6) {
      recommendations.push('Lên lịch bảo trì khẩn cấp trong 24h');
      recommendations.push('Tăng tần suất kiểm tra');
      recommendations.push('Chuẩn bị phụ tông thay thế');
    } else if (probability > 0.3) {
      recommendations.push('Lên lịch bảo trì phòng ngừa');
      recommendations.push('Kiểm tra thông số vận hành');
      recommendations.push('Cập nhật lịch bảo trì định kỳ');
    } else {
      recommendations.push('Tiếp tục giám sát thường xuyên');
      recommendations.push('Duy trì lịch bảo trì hiện tại');
    }

    return recommendations;
  }

  async trainModel(trainingData: EquipmentData[]): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    logger.info('🎯 Starting model training with failure prediction data...');
    
    const { xs, ys } = this.prepareTrainingData(trainingData);
    
    const history = await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            logger.info(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        },
      },
    });

    // Clean up
    xs.dispose();
    ys.dispose();

    logger.info('✅ Model training completed');
    logger.info(`Final accuracy: ${history.history.acc?.[history.history.acc.length - 1]?.toFixed(4)}`);
  }

  private prepareTrainingData(data: EquipmentData[]): { xs: tf.Tensor; ys: tf.Tensor } {
    const sequences: number[][][] = [];
    const labels: number[] = [];

    for (const equipment of data) {
      const processedSequence = this.preprocessData(equipment.sensors);
      const sequenceData = Array.from(processedSequence.dataSync());
      
      // Reshape for training
      const reshapedSequence: number[][] = [];
      for (let i = 0; i < this.sequenceLength; i++) {
        const start = i * this.features.length;
        reshapedSequence.push(sequenceData.slice(start, start + this.features.length));
      }
      
      sequences.push(reshapedSequence);
      
      // Label: 1 if equipment failed, 0 otherwise
      labels.push(equipment.status === 'failed' ? 1 : 0);
      
      processedSequence.dispose();
    }

    const xs = tf.tensor3d(sequences);
    const ys = tf.tensor1d(labels);

    return { xs, ys };
  }

  getModelSummary(): string {
    if (!this.model) {
      return 'Model not initialized';
    }
    
    return `Failure Prediction Model:
- Architecture: LSTM + Dense layers
- Input: ${this.sequenceLength} time steps, ${this.features.length} features
- Features: ${this.features.join(', ')}
- Output: Failure probability (0-1)
- Status: ${this.isInitialized ? 'Ready' : 'Not initialized'}`;
  }
}