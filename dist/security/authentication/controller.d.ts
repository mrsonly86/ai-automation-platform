import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    setupMFA(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyMFA(req: Request, res: Response, next: NextFunction): Promise<void>;
    samlLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    oauthLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    logoutAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    terminateSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    private generateAccessToken;
    private generateRefreshToken;
}
//# sourceMappingURL=controller.d.ts.map