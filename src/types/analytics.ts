export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: MetricTrend;
  category: MetricCategory;
  timestamp: Date;
  previousValue?: number;
  targetValue?: number;
}

export enum MetricTrend {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export enum MetricCategory {
  REVENUE = 'revenue',
  USERS = 'users',
  PERFORMANCE = 'performance',
  AGENTS = 'agents',
  PAYMENTS = 'payments',
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion'
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  reportType: ReportType;
  dateRange: DateRange;
  metrics: BusinessMetric[];
  charts: ChartConfig[];
  insights: AnalyticsInsight[];
  generatedAt: Date;
  generatedBy: string;
}

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  timezone: string;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
  options: ChartOptions;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  DONUT = 'donut',
  HEATMAP = 'heatmap'
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: Date;
  category?: string;
  metadata?: any;
}

export interface ChartOptions {
  responsive: boolean;
  legend: boolean;
  colors: string[];
  gridLines: boolean;
  animation: boolean;
  vietnamese: boolean;
}

export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  confidence: number; // 0-1
  recommendations: string[];
  affectedMetrics: string[];
}

export enum InsightType {
  TREND = 'trend',
  ANOMALY = 'anomaly',
  CORRELATION = 'correlation',
  PREDICTION = 'prediction',
  OPPORTUNITY = 'opportunity',
  RISK = 'risk'
}

export enum InsightImpact {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface UserBehaviorAnalysis {
  userId: string;
  sessionId: string;
  actions: UserAction[];
  patterns: BehaviorPattern[];
  segmentation: UserSegment;
  lifetime: UserLifetimeValue;
}

export interface UserAction {
  actionType: string;
  timestamp: Date;
  page: string;
  metadata: any;
  duration: number;
  success: boolean;
}

export interface BehaviorPattern {
  patternType: string;
  frequency: number;
  timeOfDay: number[];
  dayOfWeek: number[];
  devices: string[];
  locations: string[];
}

export interface UserSegment {
  segmentId: string;
  segmentName: string;
  characteristics: string[];
  size: number;
  value: number;
}

export interface UserLifetimeValue {
  totalRevenue: number;
  averageOrderValue: number;
  orderFrequency: number;
  customerLifespan: number; // days
  predictedValue: number;
}

export interface PredictiveAnalytics {
  prediction: Prediction;
  model: ModelInfo;
  accuracy: number;
  confidence: number;
  dataPoints: number;
  lastTraining: Date;
}

export interface Prediction {
  metric: string;
  predictedValue: number;
  timeframe: number; // days
  scenario: PredictionScenario;
  factors: PredictionFactor[];
}

export enum PredictionScenario {
  OPTIMISTIC = 'optimistic',
  REALISTIC = 'realistic',
  PESSIMISTIC = 'pessimistic'
}

export interface PredictionFactor {
  factor: string;
  weight: number;
  impact: string;
  confidence: number;
}

export interface ModelInfo {
  name: string;
  version: string;
  algorithm: string;
  features: string[];
  lastUpdated: Date;
}

export interface VietnameseMarketAnalysis {
  marketSegment: VietnameseMarketSegment;
  seasonalTrends: SeasonalTrend[];
  holidayImpact: HolidayImpact[];
  regionalData: RegionalData[];
  competitorAnalysis: CompetitorAnalysis;
}

export interface VietnameseMarketSegment {
  segmentName: string;
  cities: string[];
  demographics: Demographics;
  preferences: MarketPreferences;
  paymentMethods: PaymentMethodUsage[];
}

export interface Demographics {
  ageGroups: AgeGroupData[];
  genderDistribution: GenderData;
  incomeRanges: IncomeRangeData[];
  education: EducationData[];
}

export interface AgeGroupData {
  range: string;
  percentage: number;
  engagement: number;
  averageSpend: number;
}

export interface GenderData {
  male: number;
  female: number;
  other: number;
}

export interface IncomeRangeData {
  range: string;
  percentage: number;
  spendingPower: number;
}

export interface EducationData {
  level: string;
  percentage: number;
  techSavviness: number;
}

export interface MarketPreferences {
  preferredLanguage: string;
  communicationChannels: string[];
  productCategories: string[];
  pricesensitivity: number;
}

export interface PaymentMethodUsage {
  method: string;
  usage: number;
  preference: number;
  trustLevel: number;
}

export interface SeasonalTrend {
  season: string;
  months: number[];
  impact: number;
  categories: string[];
  description: string;
}

export interface HolidayImpact {
  holiday: string;
  date: string;
  impact: number;
  duration: number; // days
  affectedSectors: string[];
}

export interface RegionalData {
  region: string;
  cities: string[];
  population: number;
  internetPenetration: number;
  mobileUsage: number;
  averageIncome: number;
  businessActivity: number;
}

export interface CompetitorAnalysis {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  marketShare: MarketShareData;
  differentiators: string[];
}

export interface Competitor {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: PricingStrategy;
  targetMarket: string[];
}

export interface PricingStrategy {
  model: string;
  range: PriceRange;
  discounts: DiscountStrategy[];
}

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  currency: string;
}

export interface DiscountStrategy {
  type: string;
  percentage: number;
  conditions: string[];
}

export interface MarketShareData {
  ourShare: number;
  topCompetitor: string;
  topCompetitorShare: number;
  marketGrowthRate: number;
  opportunitySize: number;
}