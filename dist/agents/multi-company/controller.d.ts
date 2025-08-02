import { Request, Response, NextFunction } from 'express';
export interface ConsolidationStructure {
    id: string;
    parentCompanyId: string;
    subsidiaries: SubsidiaryInfo[];
    consolidationMethod: 'full' | 'proportional' | 'equity';
    reportingPeriod: 'monthly' | 'quarterly' | 'annually';
    reportingCurrency: string;
    eliminationRules: EliminationRule[];
    createdAt: Date;
    updatedAt: Date;
}
export interface SubsidiaryInfo {
    companyId: string;
    ownershipPercentage: number;
    effectiveDate: Date;
    endDate?: Date;
    votingRights: number;
    consolidationMethod: 'full' | 'proportional' | 'equity';
}
export interface EliminationRule {
    id: string;
    type: 'intercompany-sales' | 'intercompany-loans' | 'dividends' | 'investments';
    description: string;
    automatic: boolean;
    conditions: Record<string, any>;
}
export interface IntercompanyTransaction {
    id: string;
    fromCompanyId: string;
    toCompanyId: string;
    type: 'sales' | 'purchase' | 'loan' | 'service' | 'dividend';
    amount: number;
    currency: string;
    description: string;
    transactionDate: Date;
    accountingEntries: AccountingEntry[];
    status: 'pending' | 'confirmed' | 'eliminated';
    eliminationId?: string;
    createdAt: Date;
}
export interface AccountingEntry {
    account: string;
    debit: number;
    credit: number;
    description: string;
}
export interface BoardMember {
    id: string;
    name: string;
    position: string;
    appointmentDate: Date;
    termEnd?: Date;
    qualifications: string[];
    isIndependent: boolean;
    committees: string[];
    compensation?: number;
}
export interface BoardMeeting {
    id: string;
    companyId: string;
    title: string;
    meetingDate: Date;
    agenda: AgendaItem[];
    attendees: string[];
    minutes?: string;
    decisions: Decision[];
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}
export interface AgendaItem {
    id: string;
    topic: string;
    presenter: string;
    duration: number;
    documents: string[];
}
export interface Decision {
    id: string;
    topic: string;
    decision: string;
    votingResults: {
        inFavor: number;
        against: number;
        abstentions: number;
    };
    effectiveDate: Date;
}
export interface SharedServiceCenter {
    id: string;
    name: string;
    location: string;
    services: string[];
    servingCompanies: string[];
    manager: string;
    budget: number;
    performance: ServicePerformance;
    createdAt: Date;
}
export interface ServicePerformance {
    efficiency: number;
    quality: number;
    customerSatisfaction: number;
    costSavings: number;
    slaCompliance: number;
}
export interface ServiceLevelAgreement {
    id: string;
    centerId: string;
    companyId: string;
    serviceType: string;
    slaMetrics: SLAMetric[];
    effectiveDate: Date;
    expiryDate: Date;
    penaltyClause?: string;
}
export interface SLAMetric {
    metric: string;
    target: number;
    unit: string;
    measurement: string;
    penalty?: number;
}
export interface RiskAssessment {
    id: string;
    companyId: string;
    riskType: string;
    description: string;
    probability: number;
    impact: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
    owner: string;
    status: 'identified' | 'assessed' | 'mitigated' | 'monitored';
    lastReview: Date;
    nextReview: Date;
}
export declare class MultiCompanyController {
    createCompany(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCompanies(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCorporateHierarchy(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCompany(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCompany(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCompany(req: Request, res: Response, next: NextFunction): Promise<void>;
    addSubsidiary(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSubsidiaries(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeSubsidiary(req: Request, res: Response, next: NextFunction): Promise<void>;
    setupConsolidation(req: Request, res: Response, next: NextFunction): Promise<void>;
    getConsolidationReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    processConsolidation(req: Request, res: Response, next: NextFunction): Promise<void>;
    createIntercompanyTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    getIntercompanyTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getIntercompanyReconciliation(req: Request, res: Response, next: NextFunction): Promise<void>;
    addBoardMember(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBoardMembers(req: Request, res: Response, next: NextFunction): Promise<void>;
    scheduleBoardMeeting(req: Request, res: Response, next: NextFunction): Promise<void>;
    getComplianceStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    createComplianceReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    createSharedServiceCenter(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSharedServiceCenters(req: Request, res: Response, next: NextFunction): Promise<void>;
    createServiceLevelAgreement(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSharedServicePerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
    setupCostAllocation(req: Request, res: Response, next: NextFunction): Promise<void>;
    processCostAllocation(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCostAllocationReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGroupPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSubsidiaryComparison(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBenchmarkAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    getExecutiveDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    addRisk(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRisks(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGroupRiskAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    private calculateRiskLevel;
}
//# sourceMappingURL=controller.d.ts.map