import type { UserRole } from '@ndt-suite/shared-types';

/**
 * Permission definitions
 */
export const Permissions = {
  // Project permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',

  // Work order permissions
  WORK_ORDER_CREATE: 'work_order:create',
  WORK_ORDER_READ: 'work_order:read',
  WORK_ORDER_UPDATE: 'work_order:update',
  WORK_ORDER_DELETE: 'work_order:delete',
  WORK_ORDER_ASSIGN: 'work_order:assign',

  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Inspection permissions
  INSPECTION_CREATE: 'inspection:create',
  INSPECTION_READ: 'inspection:read',
  INSPECTION_UPDATE: 'inspection:update',
  INSPECTION_DELETE: 'inspection:delete',

  // Equipment permissions
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_READ: 'equipment:read',
  EQUIPMENT_UPDATE: 'equipment:update',
  EQUIPMENT_DELETE: 'equipment:delete',

  // Certification permissions
  CERTIFICATION_CREATE: 'certification:create',
  CERTIFICATION_READ: 'certification:read',
  CERTIFICATION_UPDATE: 'certification:update',
  CERTIFICATION_DELETE: 'certification:delete',

  // Procedure permissions
  PROCEDURE_CREATE: 'procedure:create',
  PROCEDURE_READ: 'procedure:read',
  PROCEDURE_UPDATE: 'procedure:update',
  PROCEDURE_DELETE: 'procedure:delete',
  PROCEDURE_APPROVE: 'procedure:approve',

  // NCR permissions
  NCR_CREATE: 'ncr:create',
  NCR_READ: 'ncr:read',
  NCR_UPDATE: 'ncr:update',
  NCR_DELETE: 'ncr:delete',

  // Report permissions
  REPORT_CREATE: 'report:create',
  REPORT_READ: 'report:read',
  REPORT_DELETE: 'report:delete',

  // Settings permissions
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

/**
 * Role-based permission matrix
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Admins have all permissions
    ...Object.values(Permissions),
  ],
  manager: [
    // Project management
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_READ,
    Permissions.PROJECT_UPDATE,
    Permissions.PROJECT_DELETE,

    // Work order management
    Permissions.WORK_ORDER_CREATE,
    Permissions.WORK_ORDER_READ,
    Permissions.WORK_ORDER_UPDATE,
    Permissions.WORK_ORDER_DELETE,
    Permissions.WORK_ORDER_ASSIGN,

    // User management (limited)
    Permissions.USER_READ,
    Permissions.USER_UPDATE,

    // Inspections
    Permissions.INSPECTION_CREATE,
    Permissions.INSPECTION_READ,
    Permissions.INSPECTION_UPDATE,

    // Equipment
    Permissions.EQUIPMENT_READ,
    Permissions.EQUIPMENT_UPDATE,

    // Certifications
    Permissions.CERTIFICATION_CREATE,
    Permissions.CERTIFICATION_READ,
    Permissions.CERTIFICATION_UPDATE,

    // Procedures
    Permissions.PROCEDURE_CREATE,
    Permissions.PROCEDURE_READ,
    Permissions.PROCEDURE_UPDATE,
    Permissions.PROCEDURE_APPROVE,

    // NCRs
    Permissions.NCR_CREATE,
    Permissions.NCR_READ,
    Permissions.NCR_UPDATE,

    // Reports
    Permissions.REPORT_CREATE,
    Permissions.REPORT_READ,

    // Settings
    Permissions.SETTINGS_READ,
    Permissions.SETTINGS_UPDATE,
  ],
  inspector: [
    // Projects (read only)
    Permissions.PROJECT_READ,

    // Work orders
    Permissions.WORK_ORDER_READ,
    Permissions.WORK_ORDER_UPDATE, // Can update assigned work orders

    // Inspections (full access)
    Permissions.INSPECTION_CREATE,
    Permissions.INSPECTION_READ,
    Permissions.INSPECTION_UPDATE,

    // Equipment (read only)
    Permissions.EQUIPMENT_READ,

    // Certifications (own only)
    Permissions.CERTIFICATION_READ,

    // Procedures (read only)
    Permissions.PROCEDURE_READ,

    // NCRs
    Permissions.NCR_CREATE,
    Permissions.NCR_READ,

    // Reports (read only)
    Permissions.REPORT_READ,
  ],
  viewer: [
    // Read-only access
    Permissions.PROJECT_READ,
    Permissions.WORK_ORDER_READ,
    Permissions.INSPECTION_READ,
    Permissions.EQUIPMENT_READ,
    Permissions.CERTIFICATION_READ,
    Permissions.PROCEDURE_READ,
    Permissions.NCR_READ,
    Permissions.REPORT_READ,
  ],
};

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissions[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  requiredPermissions: Permission[]
): boolean {
  const permissions = getPermissionsForRole(role);
  return requiredPermissions.every((p) => permissions.includes(p));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  requiredPermissions: Permission[]
): boolean {
  const permissions = getPermissionsForRole(role);
  return requiredPermissions.some((p) => permissions.includes(p));
}
