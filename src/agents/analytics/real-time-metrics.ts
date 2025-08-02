import { BusinessMetric, MetricCategory, MetricTrend } from '@/types/analytics';

export interface RealTimeMetric extends BusinessMetric {
  updateFrequency: number; // seconds
  source: MetricSource;
  alerts: MetricAlert[];
  history: MetricHistoryPoint[];
}

export interface MetricSource {
  type: SourceType;
  endpoint?: string;
  query?: string;
  aggregation: AggregationType;
}

export enum SourceType {
  DATABASE = 'database',
  API = 'api', 
  WEBSOCKET = 'websocket',
  WEBHOOK = 'webhook',
  PAYMENT_GATEWAY = 'payment_gateway',
  VIETNAMESE_PLATFORM = 'vietnamese_platform'
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MAX = 'max',
  MIN = 'min',
  MEDIAN = 'median',
  PERCENTILE = 'percentile'
}

export interface MetricAlert {
  id: string;
  condition: AlertCondition;
  threshold: number;
  message: string;
  severity: AlertSeverity;
  isActive: boolean;
  lastTriggered?: Date;
}

export enum AlertCondition {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUALS = 'equals',
  PERCENTAGE_CHANGE = 'percentage_change',
  TREND_CHANGE = 'trend_change',
  ANOMALY_DETECTED = 'anomaly_detected'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface MetricHistoryPoint {
  timestamp: Date;
  value: number;
  metadata?: any;
}

export interface DashboardConfiguration {
  id: string;
  name: string;
  userId: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  refreshInterval: number; // seconds
  vietnameseSettings: VietnameseSettings;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  responsive: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  metricIds: string[];
  configuration: WidgetConfiguration;
}

export enum WidgetType {
  METRIC_CARD = 'metric_card',
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  GAUGE = 'gauge',
  TABLE = 'table',
  ALERT_LIST = 'alert_list',
  VIETNAMESE_MAP = 'vietnamese_map'
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfiguration {
  showTrend: boolean;
  showTarget: boolean;
  timeRange: number; // hours
  colors: string[];
  vietnamese: boolean;
}

export interface VietnameseSettings {
  timezone: string; // 'Asia/Ho_Chi_Minh'
  language: string; // 'vi'
  currency: string; // 'VND'
  numberFormat: string; // Vietnamese number formatting
  dateFormat: string; // Vietnamese date format
}

/**
 * Real-Time Metrics Service
 * Provides live monitoring and alerting for Vietnamese business metrics
 */
export class RealTimeMetricsService {
  
  private metrics: Map<string, RealTimeMetric> = new Map();
  private dashboards: Map<string, DashboardConfiguration> = new Map();
  private activeAlerts: Map<string, MetricAlert> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private websocketConnections: Map<string, WebSocket> = new Map();

  constructor() {
    this.initializeVietnameseMetrics();
    this.setupWebSocketConnections();
  }

  /**
   * Initialize Vietnamese-specific real-time metrics
   */
  private initializeVietnameseMetrics(): void {
    
    // VNPay transaction monitoring
    this.registerMetric({
      id: 'vnpay-transactions-realtime',
      name: 'VNPay Giao Dịch (Real-time)',
      value: 0,
      unit: 'giao dịch/phút',
      trend: MetricTrend.STABLE,
      category: MetricCategory.PAYMENTS,
      timestamp: new Date(),
      updateFrequency: 30, // 30 seconds
      source: {
        type: SourceType.WEBHOOK,
        endpoint: '/webhook/vnpay',
        aggregation: AggregationType.COUNT
      },
      alerts: [
        {
          id: 'vnpay-low-volume',
          condition: AlertCondition.LESS_THAN,
          threshold: 10,
          message: 'Lượng giao dịch VNPay thấp bất thường',
          severity: AlertSeverity.MEDIUM,
          isActive: false
        },
        {
          id: 'vnpay-high-volume',
          condition: AlertCondition.GREATER_THAN,
          threshold: 100,
          message: 'Lượng giao dịch VNPay cao bất thường',
          severity: AlertSeverity.HIGH,
          isActive: false
        }
      ],
      history: []
    });

    // Shopee integration monitoring
    this.registerMetric({
      id: 'shopee-sync-realtime',
      name: 'Shopee Đồng Bộ (Real-time)',
      value: 0,
      unit: 'sản phẩm/phút',
      trend: MetricTrend.STABLE,
      category: MetricCategory.ENGAGEMENT,
      timestamp: new Date(),
      updateFrequency: 60, // 1 minute
      source: {
        type: SourceType.API,
        endpoint: '/api/shopee/sync-status',
        aggregation: AggregationType.COUNT
      },
      alerts: [
        {
          id: 'shopee-sync-failed',
          condition: AlertCondition.LESS_THAN,
          threshold: 1,
          message: 'Đồng bộ Shopee bị lỗi',
          severity: AlertSeverity.HIGH,
          isActive: false
        }
      ],
      history: []
    });

    // User activity in Vietnam regions
    this.registerMetric({
      id: 'vietnam-user-activity',
      name: 'Hoạt Động Người Dùng VN',
      value: 0,
      unit: 'người dùng online',
      trend: MetricTrend.STABLE,
      category: MetricCategory.USERS,
      timestamp: new Date(),
      updateFrequency: 15, // 15 seconds
      source: {
        type: SourceType.WEBSOCKET,
        endpoint: 'ws://localhost:8080/vietnam-activity',
        aggregation: AggregationType.COUNT
      },
      alerts: [
        {
          id: 'low-user-activity',
          condition: AlertCondition.LESS_THAN,
          threshold: 50,
          message: 'Hoạt động người dùng thấp',
          severity: AlertSeverity.MEDIUM,
          isActive: false
        }
      ],
      history: []
    });

    // AI Agent performance in Vietnamese
    this.registerMetric({
      id: 'ai-agent-response-time-vn',
      name: 'Thời Gian Phản Hồi AI (VN)',
      value: 0,
      unit: 'ms',
      trend: MetricTrend.STABLE,
      category: MetricCategory.PERFORMANCE,
      timestamp: new Date(),
      updateFrequency: 10, // 10 seconds
      source: {
        type: SourceType.DATABASE,
        query: 'SELECT AVG(response_time) FROM ai_agent_logs WHERE language = "vi" AND created_at > NOW() - INTERVAL 1 MINUTE',
        aggregation: AggregationType.AVERAGE
      },
      alerts: [
        {
          id: 'slow-ai-response-vn',
          condition: AlertCondition.GREATER_THAN,
          threshold: 2000,
          message: 'AI agent phản hồi chậm cho người dùng Việt Nam',
          severity: AlertSeverity.HIGH,
          isActive: false
        }
      ],
      history: []
    });
  }

  /**
   * Register a new real-time metric
   */
  registerMetric(metric: RealTimeMetric): void {
    this.metrics.set(metric.id, metric);
    this.startMetricUpdates(metric);
    console.log(`📊 Registered real-time metric: ${metric.name}`);
  }

  /**
   * Start automatic updates for a metric
   */
  private startMetricUpdates(metric: RealTimeMetric): void {
    const interval = setInterval(async () => {
      try {
        await this.updateMetric(metric.id);
      } catch (error) {
        console.error(`Error updating metric ${metric.id}:`, error);
      }
    }, metric.updateFrequency * 1000);

    this.updateIntervals.set(metric.id, interval);
  }

  /**
   * Update a specific metric
   */
  async updateMetric(metricId: string): Promise<void> {
    const metric = this.metrics.get(metricId);
    if (!metric) return;

    try {
      let newValue: number;

      switch (metric.source.type) {
        case SourceType.DATABASE:
          newValue = await this.fetchFromDatabase(metric.source.query || '');
          break;
        case SourceType.API:
          newValue = await this.fetchFromAPI(metric.source.endpoint || '');
          break;
        case SourceType.WEBHOOK:
          newValue = await this.getWebhookValue(metricId);
          break;
        case SourceType.WEBSOCKET:
          newValue = await this.getWebSocketValue(metricId);
          break;
        case SourceType.PAYMENT_GATEWAY:
          newValue = await this.fetchFromPaymentGateway(metricId);
          break;
        case SourceType.VIETNAMESE_PLATFORM:
          newValue = await this.fetchFromVietnamesePlatform(metricId);
          break;
        default:
          newValue = metric.value;
      }

      // Update metric with new value
      const previousValue = metric.value;
      metric.value = newValue;
      metric.timestamp = new Date();
      
      // Determine trend
      if (newValue > previousValue) {
        metric.trend = MetricTrend.UP;
      } else if (newValue < previousValue) {
        metric.trend = MetricTrend.DOWN;
      } else {
        metric.trend = MetricTrend.STABLE;
      }

      // Add to history
      metric.history.push({
        timestamp: new Date(),
        value: newValue
      });

      // Keep only last 100 points in history
      if (metric.history.length > 100) {
        metric.history = metric.history.slice(-100);
      }

      // Check alerts
      await this.checkAlerts(metric);

      // Update the metric in the map
      this.metrics.set(metricId, metric);

    } catch (error) {
      console.error(`Failed to update metric ${metricId}:`, error);
    }
  }

  /**
   * Check alerts for a metric
   */
  private async checkAlerts(metric: RealTimeMetric): Promise<void> {
    for (const alert of metric.alerts) {
      const isTriggered = this.evaluateAlertCondition(alert, metric);
      
      if (isTriggered && !alert.isActive) {
        // Trigger alert
        alert.isActive = true;
        alert.lastTriggered = new Date();
        this.activeAlerts.set(alert.id, alert);
        
        // Send notification
        await this.sendAlertNotification(alert, metric);
        
        console.warn(`🚨 Alert triggered: ${alert.message}`);
      } else if (!isTriggered && alert.isActive) {
        // Clear alert
        alert.isActive = false;
        this.activeAlerts.delete(alert.id);
        
        console.log(`✅ Alert cleared: ${alert.message}`);
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(alert: MetricAlert, metric: RealTimeMetric): boolean {
    switch (alert.condition) {
      case AlertCondition.GREATER_THAN:
        return metric.value > alert.threshold;
      case AlertCondition.LESS_THAN:
        return metric.value < alert.threshold;
      case AlertCondition.EQUALS:
        return metric.value === alert.threshold;
      case AlertCondition.PERCENTAGE_CHANGE:
        if (metric.history.length < 2) return false;
        const previousValue = metric.history[metric.history.length - 2].value;
        const changePercent = ((metric.value - previousValue) / previousValue) * 100;
        return Math.abs(changePercent) > alert.threshold;
      case AlertCondition.TREND_CHANGE:
        return metric.trend !== MetricTrend.STABLE;
      case AlertCondition.ANOMALY_DETECTED:
        return this.detectAnomaly(metric);
      default:
        return false;
    }
  }

  /**
   * Detect anomalies in metric values
   */
  private detectAnomaly(metric: RealTimeMetric): boolean {
    if (metric.history.length < 10) return false;
    
    const recentValues = metric.history.slice(-10).map(h => h.value);
    const mean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const stdDev = Math.sqrt(
      recentValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / recentValues.length
    );
    
    // Consider values outside 2 standard deviations as anomalies
    return Math.abs(metric.value - mean) > 2 * stdDev;
  }

  /**
   * Create Vietnamese business dashboard
   */
  async createVietnameseDashboard(userId: string): Promise<DashboardConfiguration> {
    const dashboard: DashboardConfiguration = {
      id: `dashboard-${userId}-vietnam`,
      name: 'Bảng Điều Khiển Kinh Doanh Việt Nam',
      userId,
      layout: {
        columns: 4,
        rows: 3,
        responsive: true
      },
      refreshInterval: 30,
      vietnameseSettings: {
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        currency: 'VND',
        numberFormat: '#,##0.00',
        dateFormat: 'DD/MM/YYYY HH:mm'
      },
      widgets: [
        {
          id: 'revenue-card',
          type: WidgetType.METRIC_CARD,
          title: 'Doanh Thu Real-time',
          position: { x: 0, y: 0 },
          size: { width: 1, height: 1 },
          metricIds: ['revenue-total'],
          configuration: {
            showTrend: true,
            showTarget: true,
            timeRange: 24,
            colors: ['#28a745'],
            vietnamese: true
          }
        },
        {
          id: 'vnpay-chart',
          type: WidgetType.LINE_CHART,
          title: 'Giao Dịch VNPay',
          position: { x: 1, y: 0 },
          size: { width: 2, height: 1 },
          metricIds: ['vnpay-transactions-realtime'],
          configuration: {
            showTrend: true,
            showTarget: false,
            timeRange: 6,
            colors: ['#007bff'],
            vietnamese: true
          }
        },
        {
          id: 'user-activity-gauge',
          type: WidgetType.GAUGE,
          title: 'Người Dùng Online',
          position: { x: 3, y: 0 },
          size: { width: 1, height: 1 },
          metricIds: ['vietnam-user-activity'],
          configuration: {
            showTrend: false,
            showTarget: true,
            timeRange: 1,
            colors: ['#ffc107'],
            vietnamese: true
          }
        },
        {
          id: 'shopee-sync-table',
          type: WidgetType.TABLE,
          title: 'Tích Hợp Platform',
          position: { x: 0, y: 1 },
          size: { width: 2, height: 1 },
          metricIds: ['shopee-sync-realtime'],
          configuration: {
            showTrend: true,
            showTarget: false,
            timeRange: 2,
            colors: ['#6f42c1'],
            vietnamese: true
          }
        },
        {
          id: 'ai-performance-chart',
          type: WidgetType.BAR_CHART,
          title: 'Hiệu Suất AI Agents',
          position: { x: 2, y: 1 },
          size: { width: 2, height: 1 },
          metricIds: ['ai-agent-response-time-vn'],
          configuration: {
            showTrend: true,
            showTarget: true,
            timeRange: 4,
            colors: ['#dc3545'],
            vietnamese: true
          }
        },
        {
          id: 'vietnam-map',
          type: WidgetType.VIETNAMESE_MAP,
          title: 'Hoạt Động Theo Vùng',
          position: { x: 0, y: 2 },
          size: { width: 2, height: 1 },
          metricIds: ['vietnam-user-activity'],
          configuration: {
            showTrend: false,
            showTarget: false,
            timeRange: 24,
            colors: ['#20c997'],
            vietnamese: true
          }
        },
        {
          id: 'alerts-list',
          type: WidgetType.ALERT_LIST,
          title: 'Cảnh Báo Hệ Thống',
          position: { x: 2, y: 2 },
          size: { width: 2, height: 1 },
          metricIds: [],
          configuration: {
            showTrend: false,
            showTarget: false,
            timeRange: 24,
            colors: ['#fd7e14'],
            vietnamese: true
          }
        }
      ]
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Get current dashboard data for Vietnamese market
   */
  async getDashboardData(dashboardId: string): Promise<{
    dashboard: DashboardConfiguration;
    metrics: RealTimeMetric[];
    alerts: MetricAlert[];
    lastUpdated: Date;
  }> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const metrics: RealTimeMetric[] = [];
    const metricIds = new Set<string>();
    
    // Collect all metric IDs from widgets
    dashboard.widgets.forEach(widget => {
      widget.metricIds.forEach(id => metricIds.add(id));
    });

    // Get metrics data
    metricIds.forEach(id => {
      const metric = this.metrics.get(id);
      if (metric) {
        metrics.push(metric);
      }
    });

    return {
      dashboard,
      metrics,
      alerts: Array.from(this.activeAlerts.values()),
      lastUpdated: new Date()
    };
  }

  /**
   * Export metrics data for Vietnamese reporting
   */
  async exportVietnameseMetrics(
    metricIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<{
    data: any[];
    format: 'vietnamese_excel';
    fileName: string;
  }> {
    const data: any[] = [];
    
    for (const metricId of metricIds) {
      const metric = this.metrics.get(metricId);
      if (!metric) continue;

      const historyInRange = metric.history.filter(
        h => h.timestamp >= startDate && h.timestamp <= endDate
      );

      data.push({
        'Tên Chỉ Số': metric.name,
        'Đơn Vị': metric.unit,
        'Giá Trị Hiện Tại': this.formatVietnameseNumber(metric.value),
        'Xu Hướng': this.getVietnameseTrend(metric.trend),
        'Danh Mục': this.getVietnameseCategory(metric.category),
        'Số Điểm Dữ Liệu': historyInRange.length,
        'Cập Nhật Cuối': this.formatVietnameseDate(metric.timestamp)
      });
    }

    return {
      data,
      format: 'vietnamese_excel',
      fileName: `Bao_cao_metrics_${this.formatVietnameseDate(new Date())}.xlsx`
    };
  }

  // Private helper methods for data fetching
  private async fetchFromDatabase(query: string): Promise<number> {
    // Simulate database query
    return Math.floor(Math.random() * 1000);
  }

  private async fetchFromAPI(endpoint: string): Promise<number> {
    // Simulate API call
    return Math.floor(Math.random() * 100);
  }

  private async getWebhookValue(metricId: string): Promise<number> {
    // Simulate webhook data
    return Math.floor(Math.random() * 50);
  }

  private async getWebSocketValue(metricId: string): Promise<number> {
    // Simulate WebSocket data
    return Math.floor(Math.random() * 200);
  }

  private async fetchFromPaymentGateway(metricId: string): Promise<number> {
    // Simulate payment gateway data
    return Math.floor(Math.random() * 300);
  }

  private async fetchFromVietnamesePlatform(metricId: string): Promise<number> {
    // Simulate Vietnamese platform data
    return Math.floor(Math.random() * 150);
  }

  private async sendAlertNotification(alert: MetricAlert, metric: RealTimeMetric): Promise<void> {
    // Implement alert notification (email, SMS, Slack, etc.)
    console.log(`Sending alert notification: ${alert.message}`);
  }

  private setupWebSocketConnections(): void {
    // Setup WebSocket connections for real-time data
    console.log('Setting up WebSocket connections for real-time metrics');
  }

  // Vietnamese formatting helpers
  private formatVietnameseNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private formatVietnameseDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private getVietnameseTrend(trend: MetricTrend): string {
    switch (trend) {
      case MetricTrend.UP: return 'Tăng';
      case MetricTrend.DOWN: return 'Giảm';
      case MetricTrend.STABLE: return 'Ổn định';
      case MetricTrend.VOLATILE: return 'Biến động';
      default: return 'Không xác định';
    }
  }

  private getVietnameseCategory(category: MetricCategory): string {
    switch (category) {
      case MetricCategory.REVENUE: return 'Doanh Thu';
      case MetricCategory.USERS: return 'Người Dùng';
      case MetricCategory.PERFORMANCE: return 'Hiệu Suất';
      case MetricCategory.AGENTS: return 'AI Agents';
      case MetricCategory.PAYMENTS: return 'Thanh Toán';
      case MetricCategory.ENGAGEMENT: return 'Tương Tác';
      case MetricCategory.CONVERSION: return 'Chuyển Đổi';
      default: return category;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Clear all intervals
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();

    // Close WebSocket connections
    this.websocketConnections.forEach(ws => ws.close());
    this.websocketConnections.clear();

    console.log('Real-time metrics service destroyed');
  }
}