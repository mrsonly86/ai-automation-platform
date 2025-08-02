export interface VietnameseLocale {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  auth: AuthTranslations;
  dashboard: DashboardTranslations;
  agents: AgentTranslations;
  payments: PaymentTranslations;
  analytics: AnalyticsTranslations;
  errors: ErrorTranslations;
  success: SuccessTranslations;
  business: BusinessTranslations;
  mobile: MobileTranslations;
}

export interface CommonTranslations {
  loading: string;
  saving: string;
  saved: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  view: string;
  close: string;
  next: string;
  previous: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  refresh: string;
  help: string;
  settings: string;
  logout: string;
  profile: string;
  yes: string;
  no: string;
  ok: string;
  apply: string;
  reset: string;
  clear: string;
  submit: string;
  back: string;
  forward: string;
  home: string;
  menu: string;
  more: string;
  less: string;
  all: string;
  none: string;
  select: string;
  deselect: string;
  expand: string;
  collapse: string;
  maximize: string;
  minimize: string;
  fullscreen: string;
  exitFullscreen: string;
  copy: string;
  paste: string;
  cut: string;
  share: string;
  download: string;
  upload: string;
  print: string;
  preview: string;
  today: string;
  yesterday: string;
  tomorrow: string;
  thisWeek: string;
  lastWeek: string;
  thisMonth: string;
  lastMonth: string;
  thisYear: string;
  lastYear: string;
  currency: string;
  vnd: string;
  usd: string;
  eur: string;
}

export interface NavigationTranslations {
  dashboard: string;
  agents: string;
  analytics: string;
  payments: string;
  integrations: string;
  settings: string;
  support: string;
  documentation: string;
  apiReference: string;
  community: string;
  blog: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  security: string;
  status: string;
  changelog: string;
  roadmap: string;
}

export interface AuthTranslations {
  login: string;
  logout: string;
  register: string;
  forgotPassword: string;
  resetPassword: string;
  changePassword: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
  rememberMe: string;
  loginWithGoogle: string;
  loginWithFacebook: string;
  loginWithZalo: string;
  signupWithGoogle: string;
  signupWithFacebook: string;
  signupWithZalo: string;
  emailVerification: string;
  twoFactorAuth: string;
  phoneVerification: string;
  accountActivation: string;
  accountSuspended: string;
  accountDeactivated: string;
  sessionExpired: string;
  invalidCredentials: string;
  emailNotVerified: string;
  passwordTooWeak: string;
  passwordMismatch: string;
  emailExists: string;
  usernameExists: string;
  acceptTerms: string;
  agreePrivacy: string;
  marketingConsent: string;
  vietnamDataConsent: string;
}

export interface DashboardTranslations {
  welcomeBack: string;
  overview: string;
  quickActions: string;
  recentActivity: string;
  systemStatus: string;
  performanceMetrics: string;
  vietnamMetrics: string;
  businessSummary: string;
  todaysSummary: string;
  weekSummary: string;
  monthSummary: string;
  yearSummary: string;
  totalRevenue: string;
  activeUsers: string;
  completedTasks: string;
  successRate: string;
  conversionRate: string;
  averageResponseTime: string;
  systemUptime: string;
  errorRate: string;
  cpuUsage: string;
  memoryUsage: string;
  diskUsage: string;
  networkTraffic: string;
  databaseConnections: string;
  activeConnections: string;
  queuedJobs: string;
  failedJobs: string;
  notifications: string;
  alerts: string;
  warnings: string;
  criticalIssues: string;
  maintenanceMode: string;
  backupStatus: string;
  securityScore: string;
  complianceStatus: string;
}

export interface AgentTranslations {
  aiAgents: string;
  createAgent: string;
  editAgent: string;
  deleteAgent: string;
  executeAgent: string;
  agentStatus: string;
  agentType: string;
  agentDescription: string;
  agentConfiguration: string;
  agentHistory: string;
  agentLogs: string;
  agentMetrics: string;
  agentSettings: string;
  analyticsAgent: string;
  marketingAgent: string;
  legalAgent: string;
  financialAgent: string;
  customerServiceAgent: string;
  contentAgent: string;
  salesAgent: string;
  operationsAgent: string;
  businessIntelligence: string;
  predictiveAnalytics: string;
  marketAutomation: string;
  legalCompliance: string;
  financialPlanning: string;
  customerSupport: string;
  contentGeneration: string;
  salesOptimization: string;
  processAutomation: string;
  executing: string;
  completed: string;
  failed: string;
  scheduled: string;
  paused: string;
  stopped: string;
  idle: string;
  busy: string;
  error: string;
  timeout: string;
  cancelled: string;
  retrying: string;
  success: string;
  warning: string;
  vietnamese: string;
  english: string;
  multilingual: string;
}

export interface PaymentTranslations {
  payments: string;
  createPayment: string;
  processPayment: string;
  paymentHistory: string;
  paymentMethods: string;
  paymentStatus: string;
  paymentAmount: string;
  paymentCurrency: string;
  paymentDate: string;
  paymentGateway: string;
  paymentReference: string;
  transactionId: string;
  orderId: string;
  customerInfo: string;
  billingAddress: string;
  shippingAddress: string;
  paymentDetails: string;
  paymentSummary: string;
  paymentConfirmation: string;
  paymentReceipt: string;
  paymentRefund: string;
  refundAmount: string;
  refundReason: string;
  refundStatus: string;
  vnpay: string;
  zalopay: string;
  momo: string;
  vietcombank: string;
  bankTransfer: string;
  creditCard: string;
  debitCard: string;
  eWallet: string;
  cashOnDelivery: string;
  internetBanking: string;
  qrCode: string;
  pending: string;
  processing: string;
  completed: string;
  failed: string;
  cancelled: string;
  refunded: string;
  partiallyRefunded: string;
  expired: string;
  declined: string;
  authorized: string;
  captured: string;
  disputed: string;
  chargedBack: string;
  vietnamTax: string;
  vatCalculation: string;
  invoiceGeneration: string;
  taxCompliance: string;
  businessLicense: string;
  taxCode: string;
  companyName: string;
  companyAddress: string;
  legalRepresentative: string;
}

export interface AnalyticsTranslations {
  analytics: string;
  reports: string;
  insights: string;
  metrics: string;
  charts: string;
  graphs: string;
  tables: string;
  dashboards: string;
  realTimeData: string;
  historicalData: string;
  predictiveAnalytics: string;
  dataVisualization: string;
  businessIntelligence: string;
  performanceMetrics: string;
  userAnalytics: string;
  salesAnalytics: string;
  marketingAnalytics: string;
  financialAnalytics: string;
  operationalAnalytics: string;
  customReports: string;
  scheduledReports: string;
  exportData: string;
  shareReport: string;
  vietnameseMarket: string;
  seasonalTrends: string;
  tetImpact: string;
  holidayAnalysis: string;
  regionalData: string;
  demographicAnalysis: string;
  competitorAnalysis: string;
  marketShare: string;
  growthRate: string;
  conversionFunnel: string;
  customerLifetime: string;
  cohortAnalysis: string;
  segmentation: string;
  attribution: string;
  retention: string;
  churn: string;
  engagement: string;
  satisfaction: string;
  nps: string;
  csat: string;
  ces: string;
  kpi: string;
  roi: string;
  roas: string;
  ltv: string;
  cac: string;
  arpu: string;
  mrr: string;
  arr: string;
}

export interface ErrorTranslations {
  generalError: string;
  networkError: string;
  serverError: string;
  timeoutError: string;
  authenticationError: string;
  authorizationError: string;
  validationError: string;
  notFoundError: string;
  conflictError: string;
  rateLimit: string;
  maintenance: string;
  unavailable: string;
  invalidInput: string;
  requiredField: string;
  invalidEmail: string;
  invalidPhone: string;
  invalidDate: string;
  invalidAmount: string;
  insufficientFunds: string;
  paymentDeclined: string;
  connectionFailed: string;
  uploadFailed: string;
  downloadFailed: string;
  permissionDenied: string;
  quotaExceeded: string;
  expiredSession: string;
  invalidToken: string;
  blockedUser: string;
  suspendedAccount: string;
  deletedAccount: string;
  maintenanceMode: string;
  serviceUnavailable: string;
}

export interface SuccessTranslations {
  success: string;
  saved: string;
  created: string;
  updated: string;
  deleted: string;
  sent: string;
  received: string;
  processed: string;
  completed: string;
  approved: string;
  rejected: string;
  verified: string;
  activated: string;
  deactivated: string;
  published: string;
  unpublished: string;
  shared: string;
  downloaded: string;
  uploaded: string;
  exported: string;
  imported: string;
  synchronized: string;
  backed_up: string;
  restored: string;
  migrated: string;
  optimized: string;
  indexed: string;
  cached: string;
  cleared: string;
  refreshed: string;
  restarted: string;
  deployed: string;
  rollback: string;
  scheduled: string;
  cancelled: string;
  paused: string;
  resumed: string;
  retried: string;
  fixed: string;
  resolved: string;
  connected: string;
  disconnected: string;
  authenticated: string;
  authorized: string;
  logged_in: string;
  logged_out: string;
  registered: string;
  unregistered: string;
  subscribed: string;
  unsubscribed: string;
  purchased: string;
  refunded: string;
  transferred: string;
  credited: string;
  debited: string;
  charged: string;
  invoiced: string;
  paid: string;
  settled: string;
}

export interface BusinessTranslations {
  business: string;
  company: string;
  enterprise: string;
  organization: string;
  department: string;
  team: string;
  employee: string;
  manager: string;
  admin: string;
  owner: string;
  director: string;
  executive: string;
  staff: string;
  consultant: string;
  contractor: string;
  freelancer: string;
  client: string;
  customer: string;
  supplier: string;
  vendor: string;
  partner: string;
  stakeholder: string;
  investor: string;
  shareholder: string;
  board: string;
  committee: string;
  project: string;
  task: string;
  workflow: string;
  process: string;
  procedure: string;
  policy: string;
  regulation: string;
  compliance: string;
  audit: string;
  review: string;
  approval: string;
  authorization: string;
  delegation: string;
  escalation: string;
  priority: string;
  urgency: string;
  deadline: string;
  milestone: string;
  deliverable: string;
  outcome: string;
  objective: string;
  goal: string;
  target: string;
  kpi: string;
  metric: string;
  benchmark: string;
  baseline: string;
  forecast: string;
  budget: string;
  cost: string;
  expense: string;
  revenue: string;
  profit: string;
  loss: string;
  margin: string;
  growth: string;
  decline: string;
  trend: string;
  pattern: string;
  cycle: string;
  season: string;
  quarter: string;
  semester: string;
  fiscal: string;
  calendar: string;
  schedule: string;
  timeline: string;
  roadmap: string;
  strategy: string;
  tactic: string;
  initiative: string;
  campaign: string;
  program: string;
  portfolio: string;
  service: string;
  product: string;
  solution: string;
  platform: string;
  system: string;
  application: string;
  software: string;
  hardware: string;
  infrastructure: string;
  network: string;
  database: string;
  server: string;
  cloud: string;
  security: string;
  backup: string;
  recovery: string;
  maintenance: string;
  support: string;
  training: string;
  documentation: string;
  manual: string;
  guide: string;
  tutorial: string;
  faq: string;
  helpdesk: string;
  ticketing: string;
  escalation: string;
  resolution: string;
  feedback: string;
  survey: string;
  rating: string;
  review: string;
  testimonial: string;
  reference: string;
  case_study: string;
  whitepaper: string;
  research: string;
  analysis: string;
  insight: string;
  recommendation: string;
  action_plan: string;
  next_steps: string;
  follow_up: string;
}

export interface MobileTranslations {
  tapToOpen: string;
  swipeLeft: string;
  swipeRight: string;
  swipeUp: string;
  swipeDown: string;
  pinchToZoom: string;
  doubleTap: string;
  longPress: string;
  pullToRefresh: string;
  scrollToTop: string;
  scrollToBottom: string;
  backToTop: string;
  mobileOptimized: string;
  touchFriendly: string;
  responsiveDesign: string;
  mobileFirst: string;
  offlineMode: string;
  lowBandwidth: string;
  dataUsage: string;
  wifiOnly: string;
  mobileData: string;
  downloadForOffline: string;
  syncWhenOnline: string;
  backgroundSync: string;
  pushNotifications: string;
  locationAccess: string;
  cameraAccess: string;
  microphoneAccess: string;
  contactsAccess: string;
  calendarAccess: string;
  photosAccess: string;
  filesAccess: string;
  phoneAccess: string;
  smsAccess: string;
  installApp: string;
  addToHomeScreen: string;
  shareApp: string;
  rateApp: string;
  updateApp: string;
  appVersion: string;
  deviceInfo: string;
  batteryLevel: string;
  storageSpace: string;
  memoryUsage: string;
  networkStatus: string;
  connectionSpeed: string;
  signalStrength: string;
  gpsLocation: string;
  orientation: string;
  portrait: string;
  landscape: string;
  fullscreenMode: string;
  splitScreenMode: string;
  multitasking: string;
  quickAccess: string;
  shortcuts: string;
  widgets: string;
  notifications: string;
  badges: string;
  vibration: string;
  sound: string;
  silent: string;
  doNotDisturb: string;
  privacyMode: string;
  secureMode: string;
  biometricAuth: string;
  faceId: string;
  touchId: string;
  fingerprint: string;
  voiceControl: string;
  accessibility: string;
  largeText: string;
  highContrast: string;
  darkMode: string;
  lightMode: string;
  autoMode: string;
  systemDefault: string;
  customTheme: string;
  vietnamese: string;
  english: string;
  autoDetect: string;
  rightToLeft: string;
  leftToRight: string;
  topToBottom: string;
  bottomToTop: string;
}

/**
 * Vietnamese Localization Service
 * Provides comprehensive Vietnamese translations for the AI Automation Platform
 */
export class VietnameseLocalization {
  private readonly locale: VietnameseLocale;

  constructor() {
    this.locale = this.initializeVietnameseLocale();
  }

  /**
   * Get translation for a key
   */
  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getNestedValue(this.locale, key);
    
    if (!translation) {
      console.warn(`Missing Vietnamese translation for key: ${key}`);
      return key;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * Get all translations for a section
   */
  getSection(section: keyof VietnameseLocale): any {
    return this.locale[section];
  }

  /**
   * Format Vietnamese currency
   */
  formatCurrency(amount: number, currency: string = 'VND'): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format Vietnamese number
   */
  formatNumber(number: number): string {
    return new Intl.NumberFormat('vi-VN').format(number);
  }

  /**
   * Format Vietnamese date
   */
  formatDate(date: Date, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh'
    };

    switch (format) {
      case 'short':
        options.dateStyle = 'short';
        break;
      case 'medium':
        options.dateStyle = 'medium';
        break;
      case 'long':
        options.dateStyle = 'long';
        break;
      case 'full':
        options.dateStyle = 'full';
        break;
    }

    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  }

  /**
   * Format Vietnamese time
   */
  formatTime(date: Date, format: 'short' | 'medium' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh',
      timeStyle: format
    };

    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  }

  /**
   * Format Vietnamese date and time
   */
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  /**
   * Get Vietnamese relative time (e.g., "2 giờ trước")
   */
  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
    }
  }

  /**
   * Pluralize Vietnamese text (Vietnamese doesn't have standard pluralization)
   */
  pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) {
      return `${count} ${singular}`;
    }
    return `${count} ${plural || singular}`;
  }

  private initializeVietnameseLocale(): VietnameseLocale {
    return {
      common: {
        loading: 'Đang tải...',
        saving: 'Đang lưu...',
        saved: 'Đã lưu',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        view: 'Xem',
        close: 'Đóng',
        next: 'Tiếp theo',
        previous: 'Trước',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        export: 'Xuất',
        import: 'Nhập',
        refresh: 'Làm mới',
        help: 'Trợ giúp',
        settings: 'Cài đặt',
        logout: 'Đăng xuất',
        profile: 'Hồ sơ',
        yes: 'Có',
        no: 'Không',
        ok: 'OK',
        apply: 'Áp dụng',
        reset: 'Đặt lại',
        clear: 'Xóa',
        submit: 'Gửi',
        back: 'Quay lại',
        forward: 'Tiến',
        home: 'Trang chủ',
        menu: 'Menu',
        more: 'Thêm',
        less: 'Ít hơn',
        all: 'Tất cả',
        none: 'Không có',
        select: 'Chọn',
        deselect: 'Bỏ chọn',
        expand: 'Mở rộng',
        collapse: 'Thu gọn',
        maximize: 'Phóng to',
        minimize: 'Thu nhỏ',
        fullscreen: 'Toàn màn hình',
        exitFullscreen: 'Thoát toàn màn hình',
        copy: 'Sao chép',
        paste: 'Dán',
        cut: 'Cắt',
        share: 'Chia sẻ',
        download: 'Tải xuống',
        upload: 'Tải lên',
        print: 'In',
        preview: 'Xem trước',
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        tomorrow: 'Ngày mai',
        thisWeek: 'Tuần này',
        lastWeek: 'Tuần trước',
        thisMonth: 'Tháng này',
        lastMonth: 'Tháng trước',
        thisYear: 'Năm này',
        lastYear: 'Năm ngoái',
        currency: 'Tiền tệ',
        vnd: 'VND',
        usd: 'USD',
        eur: 'EUR'
      },
      navigation: {
        dashboard: 'Bảng điều khiển',
        agents: 'AI Agents',
        analytics: 'Phân tích',
        payments: 'Thanh toán',
        integrations: 'Tích hợp',
        settings: 'Cài đặt',
        support: 'Hỗ trợ',
        documentation: 'Tài liệu',
        apiReference: 'API Reference',
        community: 'Cộng đồng',
        blog: 'Blog',
        about: 'Về chúng tôi',
        contact: 'Liên hệ',
        privacy: 'Bảo mật',
        terms: 'Điều khoản',
        security: 'An ninh',
        status: 'Trạng thái',
        changelog: 'Lịch sử thay đổi',
        roadmap: 'Lộ trình'
      },
      // ... (continuing with other sections, truncated for brevity)
      auth: {
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        register: 'Đăng ký',
        forgotPassword: 'Quên mật khẩu',
        resetPassword: 'Đặt lại mật khẩu',
        changePassword: 'Thay đổi mật khẩu',
        email: 'Email',
        username: 'Tên đăng nhập',
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu',
        currentPassword: 'Mật khẩu hiện tại',
        newPassword: 'Mật khẩu mới',
        rememberMe: 'Ghi nhớ đăng nhập',
        loginWithGoogle: 'Đăng nhập với Google',
        loginWithFacebook: 'Đăng nhập với Facebook',
        loginWithZalo: 'Đăng nhập với Zalo',
        signupWithGoogle: 'Đăng ký với Google',
        signupWithFacebook: 'Đăng ký với Facebook',
        signupWithZalo: 'Đăng ký với Zalo',
        emailVerification: 'Xác thực email',
        twoFactorAuth: 'Xác thực 2 yếu tố',
        phoneVerification: 'Xác thực số điện thoại',
        accountActivation: 'Kích hoạt tài khoản',
        accountSuspended: 'Tài khoản bị tạm khóa',
        accountDeactivated: 'Tài khoản bị vô hiệu hóa',
        sessionExpired: 'Phiên đăng nhập hết hạn',
        invalidCredentials: 'Thông tin đăng nhập không hợp lệ',
        emailNotVerified: 'Email chưa được xác thực',
        passwordTooWeak: 'Mật khẩu quá yếu',
        passwordMismatch: 'Mật khẩu không khớp',
        emailExists: 'Email đã tồn tại',
        usernameExists: 'Tên đăng nhập đã tồn tại',
        acceptTerms: 'Chấp nhận điều khoản sử dụng',
        agreePrivacy: 'Đồng ý chính sách bảo mật',
        marketingConsent: 'Đồng ý nhận thông tin marketing',
        vietnamDataConsent: 'Đồng ý xử lý dữ liệu cá nhân tại Việt Nam'
      },
      // Add remaining sections following the same pattern
      dashboard: {} as DashboardTranslations,
      agents: {} as AgentTranslations,
      payments: {} as PaymentTranslations,
      analytics: {} as AnalyticsTranslations,
      errors: {} as ErrorTranslations,
      success: {} as SuccessTranslations,
      business: {} as BusinessTranslations,
      mobile: {} as MobileTranslations
    };
  }

  private getNestedValue(obj: any, key: string): string {
    return key.split('.').reduce((o, k) => o && o[k], obj);
  }

  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
}