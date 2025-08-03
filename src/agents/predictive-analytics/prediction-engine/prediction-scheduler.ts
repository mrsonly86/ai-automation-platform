import { FailurePredictionModel } from '../ml-models/failure-prediction-model';
import { MaintenanceOptimizationModel, OptimizationResult } from '../ml-models/maintenance-optimization';
import { BusinessForecastingModel, ForecastInput } from '../ml-models/business-forecasting-model';
import { EquipmentData, FailurePrediction, BusinessForecast } from '../../types/index';
import { logger } from '../../utils/logger';

export interface PredictionRequest {
  equipmentIds?: string[];
  predictionTypes: ('failure' | 'maintenance' | 'business')[];
  timeHorizon?: number; // days
  priority?: 'urgent' | 'high' | 'medium' | 'low';
}

export interface PredictionResult {
  requestId: string;
  timestamp: Date;
  results: {
    failures?: FailurePrediction[];
    maintenance?: OptimizationResult;
    business?: BusinessForecast[];
  };
  accuracy: {
    failure?: number;
    maintenance?: number;
    business?: number;
  };
  processingTime: number; // milliseconds
  status: 'completed' | 'partial' | 'failed';
  errors?: string[];
}

export interface PredictionSchedule {
  id: string;
  equipmentIds: string[];
  schedule: 'realtime' | 'hourly' | 'daily' | 'weekly';
  predictionTypes: ('failure' | 'maintenance' | 'business')[];
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
}

export class PredictionEngine {
  private failureModel: FailurePredictionModel;
  private maintenanceModel: MaintenanceOptimizationModel;
  private businessModel: BusinessForecastingModel;
  private scheduledJobs: Map<string, PredictionSchedule> = new Map();
  private isInitialized = false;
  private predictionHistory: Map<string, PredictionResult[]> = new Map();

  constructor() {
    this.failureModel = new FailurePredictionModel();
    this.maintenanceModel = new MaintenanceOptimizationModel();
    this.businessModel = new BusinessForecastingModel();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🔮 Initializing Prediction Engine...');
      
      await Promise.all([
        this.failureModel.initialize(),
        this.maintenanceModel.initialize(),
        this.businessModel.initialize(),
      ]);

      this.isInitialized = true;
      logger.info('✅ Prediction Engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Prediction Engine:', error);
      throw error;
    }
  }

  async predict(request: PredictionRequest, equipmentData: EquipmentData[]): Promise<PredictionResult> {
    if (!this.isInitialized) {
      throw new Error('Prediction Engine not initialized');
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const result: PredictionResult = {
      requestId,
      timestamp: new Date(),
      results: {},
      accuracy: {},
      processingTime: 0,
      status: 'completed',
      errors: [],
    };

    logger.info(`🔮 Processing prediction request ${requestId}`, {
      equipmentCount: equipmentData.length,
      predictionTypes: request.predictionTypes,
    });

    try {
      // Filter equipment if specific IDs requested
      const targetEquipment = request.equipmentIds 
        ? equipmentData.filter(eq => request.equipmentIds!.includes(eq.equipmentId))
        : equipmentData;

      // Process failure predictions
      if (request.predictionTypes.includes('failure')) {
        try {
          const failures = await this.processFailurePredictions(targetEquipment);
          result.results.failures = failures;
          result.accuracy.failure = this.calculateFailureAccuracy(failures);
        } catch (error) {
          result.errors?.push(`Failure prediction error: ${error}`);
          logger.error('Failure prediction failed:', error);
        }
      }

      // Process maintenance optimization
      if (request.predictionTypes.includes('maintenance')) {
        try {
          const maintenance = await this.processMaintenanceOptimization(
            targetEquipment, 
            request.timeHorizon || 90
          );
          result.results.maintenance = maintenance;
          result.accuracy.maintenance = this.calculateMaintenanceAccuracy(maintenance);
        } catch (error) {
          result.errors?.push(`Maintenance optimization error: ${error}`);
          logger.error('Maintenance optimization failed:', error);
        }
      }

      // Process business forecasting
      if (request.predictionTypes.includes('business')) {
        try {
          const business = await this.processBusinessForecasting(request.timeHorizon || 30);
          result.results.business = business;
          result.accuracy.business = this.calculateBusinessAccuracy(business);
        } catch (error) {
          result.errors?.push(`Business forecasting error: ${error}`);
          logger.error('Business forecasting failed:', error);
        }
      }

      result.status = result.errors && result.errors.length > 0 ? 'partial' : 'completed';
      
    } catch (error) {
      result.status = 'failed';
      result.errors = [`Fatal error: ${error}`];
      logger.error('Prediction request failed:', error);
    } finally {
      result.processingTime = Date.now() - startTime;
      
      // Store result in history
      this.storePredictionResult(result);
      
      logger.info(`✅ Prediction request ${requestId} completed in ${result.processingTime}ms`, {
        status: result.status,
        errorCount: result.errors?.length || 0,
      });
    }

    return result;
  }

  private async processFailurePredictions(equipmentData: EquipmentData[]): Promise<FailurePrediction[]> {
    const predictions: FailurePrediction[] = [];
    
    for (const equipment of equipmentData) {
      const prediction = await this.failureModel.predictFailure(equipment);
      predictions.push(prediction);
    }

    // Sort by severity and probability
    return predictions.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aSeverity = severityOrder[a.severity];
      const bSeverity = severityOrder[b.severity];
      
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      
      return b.failureProbability - a.failureProbability;
    });
  }

  private async processMaintenanceOptimization(
    equipmentData: EquipmentData[], 
    timeHorizon: number
  ): Promise<OptimizationResult> {
    return await this.maintenanceModel.optimizeMaintenanceSchedule(equipmentData, timeHorizon);
  }

  private async processBusinessForecasting(timeHorizon: number): Promise<BusinessForecast[]> {
    // In a real implementation, this would pull historical business data
    // For now, we'll create sample data for demonstration
    const sampleHistoricalData = this.generateSampleBusinessData();
    
    const forecasts: BusinessForecast[] = [];
    
    // Revenue forecasting
    const revenueInput: ForecastInput = {
      historical_data: sampleHistoricalData.revenue,
      timestamps: sampleHistoricalData.timestamps,
      external_factors: {
        marketing_spend: sampleHistoricalData.marketing,
        economic_index: sampleHistoricalData.economic,
      },
    };
    
    const revenueForecast = await this.businessModel.forecastRevenue(revenueInput, {
      horizon: timeHorizon,
      confidence_interval: 0.95,
      include_trend: true,
      include_seasonality: true,
    });
    
    forecasts.push(revenueForecast);
    
    // Demand forecasting
    const demandInput: ForecastInput = {
      historical_data: sampleHistoricalData.demand,
      timestamps: sampleHistoricalData.timestamps,
      seasonality_period: 7,
    };
    
    const demandForecast = await this.businessModel.forecastDemand(demandInput, {
      horizon: timeHorizon,
      confidence_interval: 0.95,
      include_trend: true,
      include_seasonality: true,
    });
    
    forecasts.push(demandForecast);
    
    // Cash flow forecasting
    const cashflowInput: ForecastInput = {
      historical_data: sampleHistoricalData.cashflow,
      timestamps: sampleHistoricalData.timestamps,
    };
    
    const cashflowForecast = await this.businessModel.forecastCashflow(cashflowInput, {
      horizon: timeHorizon,
      confidence_interval: 0.95,
      include_trend: true,
      include_seasonality: false,
    });
    
    forecasts.push(cashflowForecast);
    
    return forecasts;
  }

  private generateSampleBusinessData(): {
    revenue: number[];
    demand: number[];
    cashflow: number[];
    marketing: number[];
    economic: number[];
    timestamps: Date[];
  } {
    const days = 60;
    const data = {
      revenue: [] as number[],
      demand: [] as number[],
      cashflow: [] as number[],
      marketing: [] as number[],
      economic: [] as number[],
      timestamps: [] as Date[],
    };

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
      data.timestamps.push(date);
      
      // Simulate business data with trends and seasonality
      const trend = i * 100; // Growing trend
      const seasonality = Math.sin((i % 7) * Math.PI / 7) * 5000; // Weekly pattern
      const noise = (Math.random() - 0.5) * 2000;
      
      data.revenue.push(50000 + trend + seasonality + noise);
      data.demand.push(100 + trend / 100 + Math.sin((i % 7) * Math.PI / 7) * 20 + (Math.random() - 0.5) * 10);
      data.cashflow.push(10000 + trend / 2 + seasonality / 2 + noise);
      data.marketing.push(5000 + (Math.random() - 0.5) * 1000);
      data.economic.push(100 + Math.sin(i * Math.PI / 30) * 5 + (Math.random() - 0.5) * 2);
    }

    return data;
  }

  private calculateFailureAccuracy(predictions: FailurePrediction[]): number {
    // Simplified accuracy calculation
    // In a real system, this would compare with actual failure outcomes
    const avgConfidence = predictions.reduce((sum, p) => sum + (1 - p.failureProbability), 0) / predictions.length;
    return Math.min(0.95, Math.max(0.7, avgConfidence));
  }

  private calculateMaintenanceAccuracy(optimization: OptimizationResult): number {
    // Base accuracy for maintenance optimization
    const hasConflicts = optimization.schedule.some(s => s.conflicts.length > 0);
    return hasConflicts ? 0.85 : 0.92;
  }

  private calculateBusinessAccuracy(forecasts: BusinessForecast[]): number {
    return forecasts.reduce((sum, f) => sum + f.accuracy, 0) / forecasts.length;
  }

  async scheduleRepeatingPrediction(schedule: Omit<PredictionSchedule, 'id' | 'nextRun'>): Promise<string> {
    const id = this.generateRequestId();
    const nextRun = this.calculateNextRun(schedule.schedule);
    
    const fullSchedule: PredictionSchedule = {
      ...schedule,
      id,
      nextRun,
    };
    
    this.scheduledJobs.set(id, fullSchedule);
    
    logger.info(`📅 Scheduled repeating prediction ${id}`, {
      schedule: schedule.schedule,
      nextRun: nextRun.toISOString(),
    });
    
    return id;
  }

  async cancelScheduledPrediction(scheduleId: string): Promise<boolean> {
    const deleted = this.scheduledJobs.delete(scheduleId);
    if (deleted) {
      logger.info(`❌ Cancelled scheduled prediction ${scheduleId}`);
    }
    return deleted;
  }

  getScheduledPredictions(): PredictionSchedule[] {
    return Array.from(this.scheduledJobs.values());
  }

  async processPendingScheduledPredictions(equipmentData: EquipmentData[]): Promise<void> {
    const now = new Date();
    const pendingJobs = Array.from(this.scheduledJobs.values())
      .filter(job => job.isActive && job.nextRun <= now);

    for (const job of pendingJobs) {
      try {
        logger.info(`⏰ Processing scheduled prediction ${job.id}`);
        
        const request: PredictionRequest = {
          equipmentIds: job.equipmentIds,
          predictionTypes: job.predictionTypes,
          priority: 'medium',
        };
        
        await this.predict(request, equipmentData);
        
        // Update next run time
        job.lastRun = now;
        job.nextRun = this.calculateNextRun(job.schedule);
        
      } catch (error) {
        logger.error(`Failed to process scheduled prediction ${job.id}:`, error);
      }
    }
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    
    switch (schedule) {
      case 'realtime':
        return new Date(now.getTime() + 60 * 1000); // 1 minute
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(6, 0, 0, 0); // 6 AM next day
        return tomorrow;
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(6, 0, 0, 0); // 6 AM next week
        return nextWeek;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
  }

  private generateRequestId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storePredictionResult(result: PredictionResult): void {
    const key = result.requestId;
    
    if (!this.predictionHistory.has(key)) {
      this.predictionHistory.set(key, []);
    }
    
    const history = this.predictionHistory.get(key)!;
    history.push(result);
    
    // Keep only last 100 results per type
    if (history.length > 100) {
      history.shift();
    }
  }

  getPredictionHistory(limit: number = 50): PredictionResult[] {
    const allResults: PredictionResult[] = [];
    
    for (const results of this.predictionHistory.values()) {
      allResults.push(...results);
    }
    
    return allResults
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getEngineStatus(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      scheduledJobs: this.scheduledJobs.size,
      predictionHistory: this.predictionHistory.size,
      models: {
        failure: this.failureModel.getModelSummary(),
        maintenance: 'Maintenance Optimization Model: Ready',
        business: this.businessModel.getModelSummary(),
      },
    };
  }
}