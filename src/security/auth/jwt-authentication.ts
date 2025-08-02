import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, JWTPayload, AuthTokens, UserRole, Permission } from '@/types/auth';

export class JWTAuthenticationService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshExpiresIn: string = '7d';

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.warn('⚠️ Warning: Using fallback JWT secrets. Set JWT_SECRET and REFRESH_TOKEN_SECRET in production!');
    }
  }

  /**
   * Generate JWT access and refresh tokens
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    const sessionId = this.generateSessionId();
    
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      sessionId
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'ai-automation-platform',
      audience: 'ai-automation-platform-users'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, sessionId },
      this.refreshSecret,
      {
        expiresIn: this.refreshExpiresIn,
        issuer: 'ai-automation-platform'
      }
    );

    // Calculate expiration time in seconds
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - decoded.iat;

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'ai-automation-platform',
        audience: 'ai-automation-platform-users'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, getUserById: (id: string) => Promise<User | null>): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret) as any;
      const user = await getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Check if user has required permission
   */
  hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
    return userPermissions.includes(requiredPermission);
  }

  /**
   * Check if user has required role (or higher)
   */
  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.GUEST]: 0,
      [UserRole.USER]: 1,
      [UserRole.MANAGER]: 2,
      [UserRole.ADMIN]: 3,
      [UserRole.SUPER_ADMIN]: 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ cái viết hoa');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ cái viết thường');
    }

    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}