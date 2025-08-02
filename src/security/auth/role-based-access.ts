import { User, UserRole, Permission } from '@/types/auth';

/**
 * Role-Based Access Control (RBAC) Service
 * Manages permissions and access control for the AI Automation Platform
 */
export class RoleBasedAccessControl {
  
  // Default permissions for each role
  private static readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.GUEST]: [
      Permission.USER_READ
    ],
    [UserRole.USER]: [
      Permission.USER_READ,
      Permission.AGENT_READ,
      Permission.AGENT_EXECUTE,
      Permission.PAYMENT_READ,
      Permission.ANALYTICS_READ
    ],
    [UserRole.MANAGER]: [
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.AGENT_READ,
      Permission.AGENT_UPDATE,
      Permission.AGENT_EXECUTE,
      Permission.PAYMENT_READ,
      Permission.PAYMENT_CREATE,
      Permission.PAYMENT_PROCESS,
      Permission.ANALYTICS_READ,
      Permission.ANALYTICS_EXPORT
    ],
    [UserRole.ADMIN]: [
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,
      Permission.AGENT_CREATE,
      Permission.AGENT_READ,
      Permission.AGENT_UPDATE,
      Permission.AGENT_DELETE,
      Permission.AGENT_EXECUTE,
      Permission.PAYMENT_CREATE,
      Permission.PAYMENT_READ,
      Permission.PAYMENT_PROCESS,
      Permission.PAYMENT_REFUND,
      Permission.ANALYTICS_READ,
      Permission.ANALYTICS_EXPORT,
      Permission.ANALYTICS_ADMIN,
      Permission.SYSTEM_MONITORING
    ],
    [UserRole.SUPER_ADMIN]: Object.values(Permission)
  };

  /**
   * Get default permissions for a role
   */
  static getDefaultPermissions(role: UserRole): Permission[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a user has a specific permission
   */
  static hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => user.permissions.includes(permission));
  }

  /**
   * Check if a user has sufficient role level
   */
  static hasRole(user: User, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.GUEST]: 0,
      [UserRole.USER]: 1,
      [UserRole.MANAGER]: 2,
      [UserRole.ADMIN]: 3,
      [UserRole.SUPER_ADMIN]: 4
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Check if user can access a specific agent
   */
  static canAccessAgent(user: User, agentType: string): boolean {
    // Basic agent access requires AGENT_READ permission
    if (!this.hasPermission(user, Permission.AGENT_READ)) {
      return false;
    }

    // Special restrictions for sensitive agents
    const sensitiveAgents = ['financial', 'legal'];
    if (sensitiveAgents.includes(agentType.toLowerCase())) {
      return this.hasRole(user, UserRole.MANAGER);
    }

    return true;
  }

  /**
   * Check if user can perform payment operations
   */
  static canProcessPayments(user: User): boolean {
    return this.hasPermission(user, Permission.PAYMENT_PROCESS) && 
           this.hasRole(user, UserRole.MANAGER);
  }

  /**
   * Check if user can access analytics data
   */
  static canAccessAnalytics(user: User, analyticsType: 'basic' | 'advanced' | 'financial'): boolean {
    if (!this.hasPermission(user, Permission.ANALYTICS_READ)) {
      return false;
    }

    switch (analyticsType) {
      case 'basic':
        return true;
      case 'advanced':
        return this.hasPermission(user, Permission.ANALYTICS_EXPORT);
      case 'financial':
        return this.hasRole(user, UserRole.ADMIN);
      default:
        return false;
    }
  }

  /**
   * Check if user can modify system configuration
   */
  static canModifySystemConfig(user: User): boolean {
    return this.hasPermission(user, Permission.SYSTEM_CONFIG) && 
           this.hasRole(user, UserRole.ADMIN);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: User, targetRole?: UserRole): boolean {
    if (!this.hasPermission(user, Permission.USER_UPDATE)) {
      return false;
    }

    // Admins can manage users and managers
    if (this.hasRole(user, UserRole.ADMIN)) {
      if (targetRole) {
        return this.hasRole(user, UserRole.SUPER_ADMIN) || 
               ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(targetRole);
      }
      return true;
    }

    // Managers can only manage users
    if (this.hasRole(user, UserRole.MANAGER)) {
      return !targetRole || targetRole === UserRole.USER;
    }

    return false;
  }

  /**
   * Get allowed actions for a user in a specific context
   */
  static getAllowedActions(user: User, context: 'agents' | 'payments' | 'analytics' | 'users' | 'system'): string[] {
    const actions: string[] = [];

    switch (context) {
      case 'agents':
        if (this.hasPermission(user, Permission.AGENT_READ)) actions.push('read');
        if (this.hasPermission(user, Permission.AGENT_EXECUTE)) actions.push('execute');
        if (this.hasPermission(user, Permission.AGENT_UPDATE)) actions.push('update');
        if (this.hasPermission(user, Permission.AGENT_CREATE)) actions.push('create');
        if (this.hasPermission(user, Permission.AGENT_DELETE)) actions.push('delete');
        break;

      case 'payments':
        if (this.hasPermission(user, Permission.PAYMENT_READ)) actions.push('read');
        if (this.hasPermission(user, Permission.PAYMENT_CREATE)) actions.push('create');
        if (this.hasPermission(user, Permission.PAYMENT_PROCESS)) actions.push('process');
        if (this.hasPermission(user, Permission.PAYMENT_REFUND)) actions.push('refund');
        break;

      case 'analytics':
        if (this.hasPermission(user, Permission.ANALYTICS_READ)) actions.push('read');
        if (this.hasPermission(user, Permission.ANALYTICS_EXPORT)) actions.push('export');
        if (this.hasPermission(user, Permission.ANALYTICS_ADMIN)) actions.push('admin');
        break;

      case 'users':
        if (this.hasPermission(user, Permission.USER_READ)) actions.push('read');
        if (this.hasPermission(user, Permission.USER_CREATE)) actions.push('create');
        if (this.hasPermission(user, Permission.USER_UPDATE)) actions.push('update');
        if (this.hasPermission(user, Permission.USER_DELETE)) actions.push('delete');
        break;

      case 'system':
        if (this.hasPermission(user, Permission.SYSTEM_CONFIG)) actions.push('config');
        if (this.hasPermission(user, Permission.SYSTEM_MONITORING)) actions.push('monitoring');
        if (this.hasPermission(user, Permission.SYSTEM_BACKUP)) actions.push('backup');
        break;
    }

    return actions;
  }

  /**
   * Create a new user with appropriate permissions based on role
   */
  static createUserWithRole(
    userDetails: Omit<User, 'permissions' | 'createdAt' | 'updatedAt'>,
    customPermissions?: Permission[]
  ): User {
    const defaultPermissions = this.getDefaultPermissions(userDetails.role);
    const permissions = customPermissions || defaultPermissions;

    return {
      ...userDetails,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Update user permissions while maintaining role constraints
   */
  static updateUserPermissions(
    user: User, 
    newPermissions: Permission[], 
    updatedBy: User
  ): { success: boolean; user?: User; error?: string } {
    // Only super admins can modify super admin permissions
    if (user.role === UserRole.SUPER_ADMIN && updatedBy.role !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Insufficient privileges to modify super admin permissions' };
    }

    // Ensure permissions are valid for the user's role
    const rolePermissions = this.getDefaultPermissions(user.role);
    const invalidPermissions = newPermissions.filter(p => !rolePermissions.includes(p));
    
    if (invalidPermissions.length > 0 && updatedBy.role !== UserRole.SUPER_ADMIN) {
      return { 
        success: false, 
        error: `Invalid permissions for role ${user.role}: ${invalidPermissions.join(', ')}` 
      };
    }

    const updatedUser: User = {
      ...user,
      permissions: newPermissions,
      updatedAt: new Date()
    };

    return { success: true, user: updatedUser };
  }

  /**
   * Get permission description in Vietnamese
   */
  static getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
      [Permission.USER_CREATE]: 'Tạo người dùng mới',
      [Permission.USER_READ]: 'Xem thông tin người dùng',
      [Permission.USER_UPDATE]: 'Cập nhật thông tin người dùng',
      [Permission.USER_DELETE]: 'Xóa người dùng',
      [Permission.AGENT_CREATE]: 'Tạo AI agent mới',
      [Permission.AGENT_READ]: 'Xem thông tin AI agent',
      [Permission.AGENT_UPDATE]: 'Cập nhật cấu hình AI agent',
      [Permission.AGENT_DELETE]: 'Xóa AI agent',
      [Permission.AGENT_EXECUTE]: 'Thực thi AI agent',
      [Permission.PAYMENT_CREATE]: 'Tạo giao dịch thanh toán',
      [Permission.PAYMENT_READ]: 'Xem thông tin thanh toán',
      [Permission.PAYMENT_PROCESS]: 'Xử lý thanh toán',
      [Permission.PAYMENT_REFUND]: 'Hoàn tiền',
      [Permission.ANALYTICS_READ]: 'Xem báo cáo phân tích',
      [Permission.ANALYTICS_EXPORT]: 'Xuất dữ liệu phân tích',
      [Permission.ANALYTICS_ADMIN]: 'Quản trị hệ thống phân tích',
      [Permission.SYSTEM_CONFIG]: 'Cấu hình hệ thống',
      [Permission.SYSTEM_MONITORING]: 'Giám sát hệ thống',
      [Permission.SYSTEM_BACKUP]: 'Sao lưu hệ thống'
    };

    return descriptions[permission] || permission;
  }
}