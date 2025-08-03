import { createClient, RedisClientType } from 'redis';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { SensorReading, EquipmentData } from '../../../types/index';
import { config } from '../../../config/config';
import { logger } from '../../../utils/logger';

export interface TimeSeriesData {
  timestamp: Date;
  equipmentId: string;
  measurements: Record<string, number>;
  tags?: Record<string, string>;
}

export interface ProcessingConfig {
  samplingRate: number; // Hz
  bufferSize: number;
  anomalyThreshold: number;
  smoothingWindow: number;
}

export class TimeSeriesAnalysis {
  private redisClient: RedisClientType | null = null;
  private influxDB: InfluxDB | null = null;
  private writeApi: WriteApi | null = null;
  private isInitialized = false;
  private processingConfig: ProcessingConfig;

  constructor(processingConfig?: Partial<ProcessingConfig>) {
    this.processingConfig = {
      samplingRate: 1, // 1 Hz default
      bufferSize: 1000,
      anomalyThreshold: 3.0, // 3 standard deviations
      smoothingWindow: 10,
      ...processingConfig,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Demo mode - skip Redis and InfluxDB for demo
      if (config.nodeEnv === 'development') {
        logger.info('📊 Time Series Analysis running in demo mode (no Redis/InfluxDB)');
        this.isInitialized = true;
        return;
      }

      // Initialize Redis for real-time data buffering
      this.redisClient = createClient({
        url: `redis://${config.redis.host}:${config.redis.port}`,
        password: config.redis.password,
      });

      await this.redisClient.connect();

      // Initialize InfluxDB for time series storage
      this.influxDB = new InfluxDB({
        url: config.influxdb.url,
        token: config.influxdb.token,
      });

      this.writeApi = this.influxDB.getWriteApi(
        config.influxdb.org,
        config.influxdb.bucket,
        'ms'
      );

      this.isInitialized = true;
      logger.info('📊 Time Series Analysis engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Time Series Analysis:', error);
      throw error;
    }
  }

  async processSensorData(sensorReading: SensorReading): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Time Series Analysis not initialized');
    }

    try {
      // Demo mode - just log the sensor data
      if (config.nodeEnv === 'development') {
        logger.debug(`📊 Processing sensor data: ${sensorReading.sensorId} = ${sensorReading.value} ${sensorReading.unit}`);
        return;
      }

      // Store in Redis for real-time processing
      await this.bufferData(sensorReading);

      // Detect anomalies
      const anomalyScore = await this.detectAnomaly(sensorReading);
      
      // Apply smoothing
      const smoothedValue = await this.applySmoothingFilter(sensorReading);

      // Store processed data in InfluxDB
      await this.storeTimeSeriesData({
        timestamp: sensorReading.timestamp,
        equipmentId: sensorReading.sensorId.split('_')[0], // Extract equipment ID
        measurements: {
          raw_value: sensorReading.value,
          smoothed_value: smoothedValue,
          anomaly_score: anomalyScore,
        },
        tags: {
          sensor_type: sensorReading.type,
          unit: sensorReading.unit,
        },
      });

      // Trigger alerts for high anomaly scores
      if (anomalyScore > this.processingConfig.anomalyThreshold) {
        await this.triggerAnomalyAlert(sensorReading, anomalyScore);
      }

    } catch (error) {
      logger.error('Error processing sensor data:', error);
      throw error;
    }
  }

  private async bufferData(sensorReading: SensorReading): Promise<void> {
    if (!this.redisClient) return;

    const key = `sensor:${sensorReading.sensorId}:buffer`;
    const dataPoint = JSON.stringify({
      timestamp: sensorReading.timestamp.toISOString(),
      value: sensorReading.value,
    });

    // Add to circular buffer
    await this.redisClient.lPush(key, dataPoint);
    await this.redisClient.lTrim(key, 0, this.processingConfig.bufferSize - 1);
    
    // Set expiration for cleanup
    await this.redisClient.expire(key, 3600); // 1 hour
  }

  private async detectAnomaly(sensorReading: SensorReading): Promise<number> {
    if (!this.redisClient) return 0;

    const key = `sensor:${sensorReading.sensorId}:buffer`;
    const bufferData = await this.redisClient.lRange(key, 0, -1);

    if (bufferData.length < 10) return 0; // Need enough data points

    const values = bufferData.map(data => JSON.parse(data).value as number);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Z-score based anomaly detection
    const zScore = Math.abs((sensorReading.value - mean) / stdDev);
    return zScore;
  }

  private async applySmoothingFilter(sensorReading: SensorReading): Promise<number> {
    if (!this.redisClient) return sensorReading.value;

    const key = `sensor:${sensorReading.sensorId}:buffer`;
    const bufferData = await this.redisClient.lRange(key, 0, this.processingConfig.smoothingWindow - 1);

    if (bufferData.length === 0) return sensorReading.value;

    const values = bufferData.map(data => JSON.parse(data).value as number);
    values.push(sensorReading.value);

    // Simple moving average
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private async storeTimeSeriesData(data: TimeSeriesData): Promise<void> {
    if (!this.writeApi) return;

    const point = new Point('sensor_data')
      .timestamp(data.timestamp)
      .tag('equipment_id', data.equipmentId);

    // Add tags
    if (data.tags) {
      Object.entries(data.tags).forEach(([key, value]) => {
        point.tag(key, value);
      });
    }

    // Add measurements
    Object.entries(data.measurements).forEach(([key, value]) => {
      point.floatField(key, value);
    });

    this.writeApi.writePoint(point);
  }

  private async triggerAnomalyAlert(sensorReading: SensorReading, anomalyScore: number): Promise<void> {
    logger.warn(`🚨 Anomaly detected: ${sensorReading.sensorId}`, {
      value: sensorReading.value,
      anomalyScore,
      timestamp: sensorReading.timestamp,
      type: sensorReading.type,
    });

    // Store alert in Redis for dashboard
    if (this.redisClient) {
      const alertKey = 'anomaly_alerts';
      const alert = {
        sensorId: sensorReading.sensorId,
        value: sensorReading.value,
        anomalyScore,
        timestamp: sensorReading.timestamp.toISOString(),
        type: sensorReading.type,
        severity: anomalyScore > 5 ? 'high' : 'medium',
      };

      await this.redisClient.lPush(alertKey, JSON.stringify(alert));
      await this.redisClient.lTrim(alertKey, 0, 99); // Keep last 100 alerts
    }
  }

  async getHistoricalData(
    equipmentId: string,
    sensorType: string,
    startTime: Date,
    endTime: Date
  ): Promise<TimeSeriesData[]> {
    if (!this.influxDB) return [];

    const queryApi = this.influxDB.getQueryApi(config.influxdb.org);
    const fluxQuery = `
      from(bucket: "${config.influxdb.bucket}")
        |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_data")
        |> filter(fn: (r) => r.equipment_id == "${equipmentId}")
        |> filter(fn: (r) => r.sensor_type == "${sensorType}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const results: TimeSeriesData[] = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          results.push({
            timestamp: new Date(o._time),
            equipmentId: o.equipment_id,
            measurements: {
              raw_value: o.raw_value || 0,
              smoothed_value: o.smoothed_value || 0,
              anomaly_score: o.anomaly_score || 0,
            },
            tags: {
              sensor_type: o.sensor_type,
              unit: o.unit || '',
            },
          });
        },
        error(error) {
          logger.error('Error querying historical data:', error);
          reject(error);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }

  async calculateStatistics(
    equipmentId: string,
    timeRange: string = '1h'
  ): Promise<Record<string, any>> {
    if (config.nodeEnv === 'development') {
      // Demo mode - return mock statistics
      return {
        temperature: {
          mean: [75.2, 76.1, 74.8, 77.3, 75.9],
          timestamps: Array.from({ length: 5 }, (_, i) => new Date(Date.now() - (4 - i) * 300000).toISOString()),
          min: 74.8,
          max: 77.3,
          avg: 75.86,
          stdDev: 0.98,
        },
        vibration: {
          mean: [45.1, 44.8, 46.2, 45.7, 44.9],
          timestamps: Array.from({ length: 5 }, (_, i) => new Date(Date.now() - (4 - i) * 300000).toISOString()),
          min: 44.8,
          max: 46.2,
          avg: 45.34,
          stdDev: 0.56,
        },
      };
    }

    if (!this.influxDB) return {};

    const queryApi = this.influxDB.getQueryApi(config.influxdb.org);
    const fluxQuery = `
      from(bucket: "${config.influxdb.bucket}")
        |> range(start: -${timeRange})
        |> filter(fn: (r) => r._measurement == "sensor_data")
        |> filter(fn: (r) => r.equipment_id == "${equipmentId}")
        |> filter(fn: (r) => r._field == "raw_value")
        |> group(columns: ["sensor_type"])
        |> aggregateWindow(every: 5m, fn: mean)
        |> yield(name: "mean")
    `;

    const statistics: Record<string, any> = {};

    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const sensorType = o.sensor_type;
          
          if (!statistics[sensorType]) {
            statistics[sensorType] = {
              mean: [],
              timestamps: [],
            };
          }
          
          statistics[sensorType].mean.push(o._value);
          statistics[sensorType].timestamps.push(o._time);
        },
        error(error) {
          logger.error('Error calculating statistics:', error);
          reject(error);
        },
        complete() {
          // Calculate additional statistics
          Object.keys(statistics).forEach(sensorType => {
            const values = statistics[sensorType].mean;
            statistics[sensorType].min = Math.min(...values);
            statistics[sensorType].max = Math.max(...values);
            statistics[sensorType].avg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
            
            // Calculate standard deviation
            const mean = statistics[sensorType].avg;
            const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length;
            statistics[sensorType].stdDev = Math.sqrt(variance);
          });
          
          resolve(statistics);
        },
      });
    });
  }

  async getRealtimeMetrics(): Promise<Record<string, any>> {
    if (config.nodeEnv === 'development') {
      // Demo mode - return mock metrics
      return {
        activeSensors: 15,
        processingRate: 120,
        recentAlerts: [
          {
            sensorId: 'MOTOR_001_temp',
            value: 85.5,
            anomalyScore: 3.2,
            timestamp: new Date().toISOString(),
            type: 'temperature',
            severity: 'medium',
          },
        ],
        lastUpdate: new Date().toISOString(),
        anomalyThreshold: this.processingConfig.anomalyThreshold,
        bufferSize: this.processingConfig.bufferSize,
      };
    }

    if (!this.redisClient) return {};

    try {
      // Get recent anomaly alerts
      const alertsData = await this.redisClient.lRange('anomaly_alerts', 0, 9);
      const alerts = alertsData.map(data => JSON.parse(data));

      // Get active sensor count
      const sensorKeys = await this.redisClient.keys('sensor:*:buffer');
      const activeSensors = sensorKeys.length;

      // Calculate processing rate
      const processingRateKey = 'processing_rate';
      const currentRate = await this.redisClient.get(processingRateKey) || '0';

      return {
        activeSensors,
        processingRate: parseInt(currentRate, 10),
        recentAlerts: alerts,
        lastUpdate: new Date().toISOString(),
        anomalyThreshold: this.processingConfig.anomalyThreshold,
        bufferSize: this.processingConfig.bufferSize,
      };
    } catch (error) {
      logger.error('Error getting realtime metrics:', error);
      return {};
    }
  }

  async updateProcessingRate(): Promise<void> {
    if (!this.redisClient) return;

    const rateKey = 'processing_rate';
    const currentRate = await this.redisClient.get(rateKey) || '0';
    const newRate = parseInt(currentRate, 10) + 1;
    
    await this.redisClient.setEx(rateKey, 60, newRate.toString()); // Reset every minute
  }

  async cleanup(): Promise<void> {
    try {
      if (this.writeApi) {
        await this.writeApi.close();
      }
      if (this.redisClient) {
        await this.redisClient.disconnect();
      }
      logger.info('📊 Time Series Analysis cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  getProcessingStatus(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      config: this.processingConfig,
      redisConnected: this.redisClient?.isReady || false,
      influxConnected: this.influxDB !== null,
    };
  }
}