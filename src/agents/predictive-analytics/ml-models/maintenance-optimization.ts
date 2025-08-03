import * as tf from '@tensorflow/tfjs';
import { EquipmentData, MaintenanceRecord } from '../../types/index';
import { logger } from '../../utils/logger';

export interface MaintenanceRecommendation {
  equipmentId: string;
  recommendedDate: Date;
  maintenanceType: 'preventive' | 'corrective' | 'overhaul';
  estimatedDuration: number; // hours
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  spareParts: string[];
  expectedDowntime: number; // hours
}

export interface OptimizationResult {
  totalCostReduction: number;
  downtimeReduction: number;
  recommendations: MaintenanceRecommendation[];
  schedule: MaintenanceSchedule[];
}

export interface MaintenanceSchedule {
  date: Date;
  equipmentIds: string[];
  totalDuration: number;
  totalCost: number;
  conflicts: string[];
}

export class MaintenanceOptimizationModel {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private equipmentProfiles: Map<string, EquipmentProfile> = new Map();

  async initialize(): Promise<void> {
    try {
      await this.buildModel();
      this.isInitialized = true;
      logger.info('🔧 Maintenance Optimization Model initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Maintenance Optimization Model:', error);
      throw error;
    }
  }

  private async buildModel(): Promise<void> {
    // Neural network for maintenance optimization
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [15], // Equipment features: age, usage, failure history, etc.
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu',
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
        }),
        tf.layers.dense({
          units: 3, // Output: [optimal_interval, urgency_score, cost_factor]
          activation: 'linear',
        }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    logger.info('🧠 Maintenance optimization neural network created');
  }

  async optimizeMaintenanceSchedule(
    equipmentList: EquipmentData[],
    timeHorizon: number = 90 // days
  ): Promise<OptimizationResult> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    logger.info(`🔍 Optimizing maintenance schedule for ${equipmentList.length} equipment over ${timeHorizon} days`);

    const recommendations: MaintenanceRecommendation[] = [];
    
    for (const equipment of equipmentList) {
      const recommendation = await this.generateMaintenanceRecommendation(equipment);
      recommendations.push(recommendation);
    }

    // Optimize schedule considering resource constraints
    const schedule = this.optimizeScheduling(recommendations, timeHorizon);
    
    // Calculate savings
    const currentCosts = this.calculateCurrentMaintenanceCosts(equipmentList);
    const optimizedCosts = this.calculateOptimizedCosts(recommendations);
    
    const result: OptimizationResult = {
      totalCostReduction: currentCosts - optimizedCosts,
      downtimeReduction: this.calculateDowntimeReduction(equipmentList, recommendations),
      recommendations,
      schedule,
    };

    logger.info(`💰 Optimization complete: ${result.totalCostReduction.toFixed(0)}$ cost reduction, ${result.downtimeReduction.toFixed(1)}% downtime reduction`);

    return result;
  }

  private async generateMaintenanceRecommendation(equipment: EquipmentData): Promise<MaintenanceRecommendation> {
    const features = this.extractEquipmentFeatures(equipment);
    const prediction = await this.model!.predict(tf.tensor2d([features])) as tf.Tensor;
    const [optimalInterval, urgencyScore, costFactor] = Array.from(await prediction.data());

    prediction.dispose();

    const lastMaintenance = this.getLastMaintenanceDate(equipment);
    const daysSinceLastMaintenance = Math.floor(
      (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
    );

    const recommendedDate = new Date();
    recommendedDate.setDate(recommendedDate.getDate() + Math.max(1, optimalInterval - daysSinceLastMaintenance));

    const maintenanceType = this.determineMaintenanceType(urgencyScore, equipment);
    const priority = this.determinePriority(urgencyScore);
    
    return {
      equipmentId: equipment.equipmentId,
      recommendedDate,
      maintenanceType,
      estimatedDuration: this.estimateDuration(equipment, maintenanceType),
      estimatedCost: this.estimateCost(equipment, maintenanceType, costFactor),
      priority,
      description: this.generateDescription(equipment, maintenanceType),
      spareParts: this.recommendSpareParts(equipment, maintenanceType),
      expectedDowntime: this.estimateDowntime(equipment, maintenanceType),
    };
  }

  private extractEquipmentFeatures(equipment: EquipmentData): number[] {
    const now = Date.now();
    const age = (now - equipment.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365); // years
    const lastMaintenance = this.getLastMaintenanceDate(equipment);
    const daysSinceLastMaintenance = (now - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);
    
    const maintenanceHistory = equipment.maintenanceHistory;
    const avgMaintenanceInterval = this.calculateAverageMaintenanceInterval(maintenanceHistory);
    const maintenanceFrequency = maintenanceHistory.length / Math.max(age, 1);
    const avgMaintenanceCost = maintenanceHistory.reduce((sum, m) => sum + m.cost, 0) / Math.max(maintenanceHistory.length, 1);
    const totalDowntime = maintenanceHistory.reduce((sum, m) => sum + m.duration, 0);
    
    const recentSensors = equipment.sensors.slice(-10); // Last 10 readings
    const avgTemperature = recentSensors.filter(s => s.type === 'temperature').reduce((sum, s) => sum + s.value, 0) / Math.max(recentSensors.filter(s => s.type === 'temperature').length, 1);
    const avgVibration = recentSensors.filter(s => s.type === 'vibration').reduce((sum, s) => sum + s.value, 0) / Math.max(recentSensors.filter(s => s.type === 'vibration').length, 1);
    const avgPressure = recentSensors.filter(s => s.type === 'pressure').reduce((sum, s) => sum + s.value, 0) / Math.max(recentSensors.filter(s => s.type === 'pressure').length, 1);

    // Normalize features
    return [
      age / 20, // Max 20 years
      daysSinceLastMaintenance / 365, // Max 1 year
      avgMaintenanceInterval / 365, // Max 1 year
      maintenanceFrequency * 10, // Scale up
      avgMaintenanceCost / 10000, // Max 10k
      totalDowntime / 1000, // Max 1000 hours
      equipment.status === 'operational' ? 1 : 0,
      equipment.status === 'maintenance' ? 1 : 0,
      equipment.status === 'failed' ? 1 : 0,
      avgTemperature / 100, // Normalized temperature
      avgVibration / 100, // Normalized vibration
      avgPressure / 1000, // Normalized pressure
      equipment.type === 'motor' ? 1 : 0,
      equipment.type === 'pump' ? 1 : 0,
      equipment.type === 'conveyor' ? 1 : 0,
    ];
  }

  private optimizeScheduling(
    recommendations: MaintenanceRecommendation[],
    timeHorizon: number
  ): MaintenanceSchedule[] {
    const schedule: MaintenanceSchedule[] = [];
    const sortedRecommendations = [...recommendations].sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const dailySchedule: Map<string, MaintenanceRecommendation[]> = new Map();

    for (const rec of sortedRecommendations) {
      const dateKey = rec.recommendedDate.toISOString().split('T')[0];
      
      if (!dailySchedule.has(dateKey)) {
        dailySchedule.set(dateKey, []);
      }
      
      const dayRecommendations = dailySchedule.get(dateKey)!;
      
      // Check resource constraints (max 8 hours per day)
      const currentDayDuration = dayRecommendations.reduce((sum, r) => sum + r.estimatedDuration, 0);
      
      if (currentDayDuration + rec.estimatedDuration <= 8) {
        dayRecommendations.push(rec);
      } else {
        // Reschedule to next available day
        const nextDay = new Date(rec.recommendedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        rec.recommendedDate = nextDay;
        
        const nextDateKey = nextDay.toISOString().split('T')[0];
        if (!dailySchedule.has(nextDateKey)) {
          dailySchedule.set(nextDateKey, []);
        }
        dailySchedule.get(nextDateKey)!.push(rec);
      }
    }

    // Convert to schedule format
    for (const [dateKey, dayRecommendations] of dailySchedule) {
      if (dayRecommendations.length > 0) {
        schedule.push({
          date: new Date(dateKey),
          equipmentIds: dayRecommendations.map(r => r.equipmentId),
          totalDuration: dayRecommendations.reduce((sum, r) => sum + r.estimatedDuration, 0),
          totalCost: dayRecommendations.reduce((sum, r) => sum + r.estimatedCost, 0),
          conflicts: this.detectConflicts(dayRecommendations),
        });
      }
    }

    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getLastMaintenanceDate(equipment: EquipmentData): Date {
    if (equipment.maintenanceHistory.length === 0) {
      return equipment.createdAt;
    }
    
    return equipment.maintenanceHistory.reduce((latest, maintenance) => 
      maintenance.date > latest ? maintenance.date : latest, 
      equipment.maintenanceHistory[0].date
    );
  }

  private calculateAverageMaintenanceInterval(history: MaintenanceRecord[]): number {
    if (history.length < 2) return 90; // Default 90 days
    
    const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
    let totalInterval = 0;
    
    for (let i = 1; i < sortedHistory.length; i++) {
      const interval = (sortedHistory[i].date.getTime() - sortedHistory[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      totalInterval += interval;
    }
    
    return totalInterval / (sortedHistory.length - 1);
  }

  private determineMaintenanceType(urgencyScore: number, equipment: EquipmentData): 'preventive' | 'corrective' | 'overhaul' {
    if (urgencyScore > 0.8) return 'corrective';
    if (urgencyScore > 0.5) return 'preventive';
    
    // Check if equipment is old enough for overhaul
    const age = (Date.now() - equipment.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (age > 5) return 'overhaul';
    
    return 'preventive';
  }

  private determinePriority(urgencyScore: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (urgencyScore > 0.9) return 'urgent';
    if (urgencyScore > 0.7) return 'high';
    if (urgencyScore > 0.4) return 'medium';
    return 'low';
  }

  private estimateDuration(equipment: EquipmentData, type: 'preventive' | 'corrective' | 'overhaul'): number {
    const baseDuration = {
      preventive: 2,
      corrective: 4,
      overhaul: 8,
    };
    
    const typeFactor = {
      motor: 1.0,
      pump: 1.2,
      conveyor: 1.5,
      default: 1.0,
    };
    
    return baseDuration[type] * (typeFactor[equipment.type as keyof typeof typeFactor] || typeFactor.default);
  }

  private estimateCost(equipment: EquipmentData, type: 'preventive' | 'corrective' | 'overhaul', costFactor: number): number {
    const baseCost = {
      preventive: 500,
      corrective: 1500,
      overhaul: 5000,
    };
    
    return baseCost[type] * (1 + costFactor);
  }

  private generateDescription(equipment: EquipmentData, type: 'preventive' | 'corrective' | 'overhaul'): string {
    const descriptions = {
      preventive: `Bảo trì phòng ngừa cho ${equipment.type} ${equipment.equipmentId}: Kiểm tra tổng quát, thay dầu nhớt, vệ sinh hệ thống`,
      corrective: `Bảo trì sửa chữa cho ${equipment.type} ${equipment.equipmentId}: Khắc phục sự cố, thay thế linh kiện hỏng hóc`,
      overhaul: `Đại tu cho ${equipment.type} ${equipment.equipmentId}: Kiểm tra toàn diện, thay thế các bộ phận quan trọng`,
    };
    
    return descriptions[type];
  }

  private recommendSpareParts(equipment: EquipmentData, type: 'preventive' | 'corrective' | 'overhaul'): string[] {
    const spareParts: Record<string, string[]> = {
      motor: ['bearing', 'oil_seal', 'cooling_fan'],
      pump: ['impeller', 'mechanical_seal', 'gasket'],
      conveyor: ['belt', 'roller', 'bearing'],
    };
    
    const typeParts = spareParts[equipment.type] || ['general_parts'];
    
    if (type === 'overhaul') {
      return [...typeParts, 'complete_maintenance_kit'];
    }
    
    return typeParts.slice(0, type === 'corrective' ? 2 : 1);
  }

  private estimateDowntime(equipment: EquipmentData, type: 'preventive' | 'corrective' | 'overhaul'): number {
    // Downtime is typically longer than actual maintenance time
    const duration = this.estimateDuration(equipment, type);
    return duration * 1.2; // 20% buffer for preparation and startup
  }

  private calculateCurrentMaintenanceCosts(equipmentList: EquipmentData[]): number {
    return equipmentList.reduce((total, equipment) => {
      const avgCost = equipment.maintenanceHistory.reduce((sum, m) => sum + m.cost, 0) / 
                     Math.max(equipment.maintenanceHistory.length, 1);
      return total + avgCost * 4; // Quarterly projection
    }, 0);
  }

  private calculateOptimizedCosts(recommendations: MaintenanceRecommendation[]): number {
    return recommendations.reduce((total, rec) => total + rec.estimatedCost, 0);
  }

  private calculateDowntimeReduction(equipmentList: EquipmentData[], recommendations: MaintenanceRecommendation[]): number {
    const currentDowntime = equipmentList.reduce((total, equipment) => {
      return total + equipment.maintenanceHistory.reduce((sum, m) => sum + m.duration, 0);
    }, 0);

    const optimizedDowntime = recommendations.reduce((total, rec) => total + rec.expectedDowntime, 0);
    
    return currentDowntime > 0 ? ((currentDowntime - optimizedDowntime) / currentDowntime) * 100 : 0;
  }

  private detectConflicts(dayRecommendations: MaintenanceRecommendation[]): string[] {
    const conflicts: string[] = [];
    
    // Check for resource conflicts
    const totalDuration = dayRecommendations.reduce((sum, r) => sum + r.estimatedDuration, 0);
    if (totalDuration > 8) {
      conflicts.push('Vượt quá thời gian làm việc trong ngày');
    }
    
    // Check for critical equipment maintenance on same day
    const criticalEquipment = dayRecommendations.filter(r => r.priority === 'urgent');
    if (criticalEquipment.length > 1) {
      conflicts.push('Nhiều thiết bị critical cần bảo trì cùng ngày');
    }
    
    return conflicts;
  }
}

interface EquipmentProfile {
  equipmentId: string;
  type: string;
  avgMaintenanceInterval: number;
  avgCost: number;
  reliabilityScore: number;
}