import { describe, it, expect } from 'vitest';
import {
  Permissions,
  RolePermissions,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionsForRole,
} from './permissions';
import type { UserRole } from '@ndt-suite/shared-types';

describe('Permission System', () => {
  describe('Permission constants', () => {
    it('should define all required permissions', () => {
      expect(Permissions.PROJECT_CREATE).toBe('project:create');
      expect(Permissions.PROJECT_READ).toBe('project:read');
      expect(Permissions.PROJECT_UPDATE).toBe('project:update');
      expect(Permissions.PROJECT_DELETE).toBe('project:delete');

      expect(Permissions.INSPECTION_CREATE).toBe('inspection:create');
      expect(Permissions.INSPECTION_READ).toBe('inspection:read');
      expect(Permissions.INSPECTION_UPDATE).toBe('inspection:update');
      expect(Permissions.INSPECTION_DELETE).toBe('inspection:delete');

      expect(Permissions.USER_CREATE).toBe('user:create');
      expect(Permissions.USER_READ).toBe('user:read');
      expect(Permissions.USER_UPDATE).toBe('user:update');
      expect(Permissions.USER_DELETE).toBe('user:delete');

      expect(Permissions.SETTINGS_MANAGE).toBe('settings:manage');
    });

    it('should have unique permission values', () => {
      const values = Object.values(Permissions);
      const uniqueValues = new Set(values);

      expect(values.length).toBe(uniqueValues.size);
    });

    it('should follow naming convention (resource:action)', () => {
      const values = Object.values(Permissions);

      for (const value of values) {
        expect(value).toMatch(/^[a-z]+:[a-z]+$/);
      }
    });
  });

  describe('RolePermissions matrix', () => {
    it('should define permissions for all roles', () => {
      expect(RolePermissions.admin).toBeDefined();
      expect(RolePermissions.manager).toBeDefined();
      expect(RolePermissions.inspector).toBeDefined();
      expect(RolePermissions.viewer).toBeDefined();
    });

    it('should give admin all permissions', () => {
      const adminPerms = RolePermissions.admin;
      const allPerms = Object.values(Permissions);

      expect(adminPerms.length).toBe(allPerms.length);

      for (const perm of allPerms) {
        expect(adminPerms).toContain(perm);
      }
    });

    it('should give manager subset of admin permissions', () => {
      const adminPerms = RolePermissions.admin;
      const managerPerms = RolePermissions.manager;

      expect(managerPerms.length).toBeLessThan(adminPerms.length);

      for (const perm of managerPerms) {
        expect(adminPerms).toContain(perm);
      }
    });

    it('should give inspector subset of manager permissions', () => {
      const managerPerms = RolePermissions.manager;
      const inspectorPerms = RolePermissions.inspector;

      expect(inspectorPerms.length).toBeLessThan(managerPerms.length);
    });

    it('should give viewer only read permissions', () => {
      const viewerPerms = RolePermissions.viewer;

      for (const perm of viewerPerms) {
        expect(perm).toContain(':read');
      }
    });

    it('should not give viewer any write permissions', () => {
      const viewerPerms = RolePermissions.viewer;
      const writeActions = ['create', 'update', 'delete', 'manage'];

      for (const perm of viewerPerms) {
        for (const action of writeActions) {
          expect(perm).not.toContain(action);
        }
      }
    });

    it('should only give admin settings management', () => {
      expect(RolePermissions.admin).toContain(Permissions.SETTINGS_MANAGE);
      expect(RolePermissions.manager).not.toContain(Permissions.SETTINGS_MANAGE);
      expect(RolePermissions.inspector).not.toContain(Permissions.SETTINGS_MANAGE);
      expect(RolePermissions.viewer).not.toContain(Permissions.SETTINGS_MANAGE);
    });

    it('should not give admin duplicate permissions', () => {
      const adminPerms = RolePermissions.admin;
      const uniquePerms = new Set(adminPerms);

      expect(adminPerms.length).toBe(uniquePerms.size);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      const allPerms = Object.values(Permissions);

      for (const perm of allPerms) {
        expect(hasPermission('admin', perm)).toBe(true);
      }
    });

    it('should return true for manager with project create', () => {
      expect(hasPermission('manager', Permissions.PROJECT_CREATE)).toBe(true);
    });

    it('should return false for inspector with project create', () => {
      expect(hasPermission('inspector', Permissions.PROJECT_CREATE)).toBe(false);
    });

    it('should return true for inspector with inspection create', () => {
      expect(hasPermission('inspector', Permissions.INSPECTION_CREATE)).toBe(true);
    });

    it('should return false for viewer with any write permission', () => {
      expect(hasPermission('viewer', Permissions.PROJECT_CREATE)).toBe(false);
      expect(hasPermission('viewer', Permissions.INSPECTION_CREATE)).toBe(false);
      expect(hasPermission('viewer', Permissions.USER_CREATE)).toBe(false);
    });

    it('should return true for viewer with read permissions', () => {
      expect(hasPermission('viewer', Permissions.PROJECT_READ)).toBe(true);
      expect(hasPermission('viewer', Permissions.INSPECTION_READ)).toBe(true);
      expect(hasPermission('viewer', Permissions.USER_READ)).toBe(true);
    });

    it('should return false for viewer with settings manage', () => {
      expect(hasPermission('viewer', Permissions.SETTINGS_MANAGE)).toBe(false);
    });

    it('should return false for non-existent permission', () => {
      expect(hasPermission('admin', 'nonexistent:permission' as any)).toBe(false);
    });

    it('should handle case sensitivity', () => {
      expect(hasPermission('admin', Permissions.PROJECT_CREATE)).toBe(true);
      expect(hasPermission('Admin' as UserRole, Permissions.PROJECT_CREATE)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true for admin with all permissions', () => {
      const allPerms = Object.values(Permissions);
      expect(hasAllPermissions('admin', allPerms)).toBe(true);
    });

    it('should return true when all permissions are granted', () => {
      expect(
        hasAllPermissions('manager', [
          Permissions.PROJECT_CREATE,
          Permissions.PROJECT_READ,
        ])
      ).toBe(true);
    });

    it('should return false when any permission is missing', () => {
      expect(
        hasAllPermissions('inspector', [
          Permissions.INSPECTION_CREATE,
          Permissions.PROJECT_CREATE, // Inspector doesn't have this
        ])
      ).toBe(false);
    });

    it('should return true for empty permission array', () => {
      expect(hasAllPermissions('viewer', [])).toBe(true);
    });

    it('should return false for viewer with write permissions', () => {
      expect(
        hasAllPermissions('viewer', [
          Permissions.PROJECT_READ,
          Permissions.PROJECT_CREATE, // Viewer doesn't have this
        ])
      ).toBe(false);
    });

    it('should handle single permission', () => {
      expect(hasAllPermissions('manager', [Permissions.PROJECT_CREATE])).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(
        hasAllPermissions('viewer', [
          Permissions.PROJECT_CREATE,
          Permissions.PROJECT_DELETE,
        ])
      ).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if role has any of the permissions', () => {
      expect(
        hasAnyPermission('inspector', [
          Permissions.PROJECT_CREATE, // Inspector doesn't have this
          Permissions.INSPECTION_CREATE, // But has this
        ])
      ).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(
        hasAnyPermission('viewer', [
          Permissions.PROJECT_CREATE,
          Permissions.PROJECT_DELETE,
          Permissions.USER_DELETE,
        ])
      ).toBe(false);
    });

    it('should return true if role has all permissions', () => {
      expect(
        hasAnyPermission('admin', [
          Permissions.PROJECT_CREATE,
          Permissions.INSPECTION_CREATE,
        ])
      ).toBe(true);
    });

    it('should return false for empty permission array', () => {
      expect(hasAnyPermission('admin', [])).toBe(false);
    });

    it('should return true for single matching permission', () => {
      expect(hasAnyPermission('manager', [Permissions.PROJECT_CREATE])).toBe(true);
    });

    it('should return false for single non-matching permission', () => {
      expect(hasAnyPermission('viewer', [Permissions.PROJECT_CREATE])).toBe(false);
    });

    it('should work with read permissions for viewer', () => {
      expect(
        hasAnyPermission('viewer', [
          Permissions.PROJECT_READ,
          Permissions.PROJECT_CREATE,
        ])
      ).toBe(true);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return all permissions for admin', () => {
      const perms = getPermissionsForRole('admin');
      const allPerms = Object.values(Permissions);

      expect(perms).toHaveLength(allPerms.length);
      expect(perms).toEqual(expect.arrayContaining(allPerms));
    });

    it('should return manager permissions', () => {
      const perms = getPermissionsForRole('manager');

      expect(perms).toContain(Permissions.PROJECT_CREATE);
      expect(perms).toContain(Permissions.PROJECT_READ);
      expect(perms).not.toContain(Permissions.SETTINGS_MANAGE);
    });

    it('should return inspector permissions', () => {
      const perms = getPermissionsForRole('inspector');

      expect(perms).toContain(Permissions.INSPECTION_CREATE);
      expect(perms).toContain(Permissions.INSPECTION_READ);
      expect(perms).not.toContain(Permissions.PROJECT_CREATE);
    });

    it('should return viewer permissions (read-only)', () => {
      const perms = getPermissionsForRole('viewer');

      expect(perms).toContain(Permissions.PROJECT_READ);
      expect(perms).toContain(Permissions.INSPECTION_READ);
      expect(perms).not.toContain(Permissions.PROJECT_CREATE);
      expect(perms).not.toContain(Permissions.INSPECTION_CREATE);
    });

    it('should return array that can be modified without affecting original', () => {
      const perms1 = getPermissionsForRole('admin');
      const perms2 = getPermissionsForRole('admin');

      perms1.push('custom:permission' as any);

      expect(perms2).not.toContain('custom:permission');
    });

    it('should return empty array for unknown role', () => {
      const perms = getPermissionsForRole('unknown' as UserRole);

      expect(perms).toEqual([]);
    });
  });

  describe('Role hierarchy', () => {
    it('should have admin with most permissions', () => {
      const adminCount = RolePermissions.admin.length;
      const managerCount = RolePermissions.manager.length;
      const inspectorCount = RolePermissions.inspector.length;
      const viewerCount = RolePermissions.viewer.length;

      expect(adminCount).toBeGreaterThan(managerCount);
      expect(managerCount).toBeGreaterThan(inspectorCount);
      expect(inspectorCount).toBeGreaterThan(viewerCount);
    });

    it('should allow inspectors to read what managers can create', () => {
      // If managers can create projects, inspectors should read them
      if (hasPermission('manager', Permissions.PROJECT_CREATE)) {
        expect(hasPermission('inspector', Permissions.PROJECT_READ)).toBe(true);
      }
    });

    it('should allow viewers to read what inspectors can create', () => {
      // If inspectors can create inspections, viewers should read them
      if (hasPermission('inspector', Permissions.INSPECTION_CREATE)) {
        expect(hasPermission('viewer', Permissions.INSPECTION_READ)).toBe(true);
      }
    });
  });

  describe('Permission categories', () => {
    it('should have project permissions', () => {
      const projectPerms = Object.values(Permissions).filter((p) =>
        p.startsWith('project:')
      );

      expect(projectPerms.length).toBeGreaterThanOrEqual(4); // CRUD
    });

    it('should have inspection permissions', () => {
      const inspectionPerms = Object.values(Permissions).filter((p) =>
        p.startsWith('inspection:')
      );

      expect(inspectionPerms.length).toBeGreaterThanOrEqual(4); // CRUD
    });

    it('should have user permissions', () => {
      const userPerms = Object.values(Permissions).filter((p) =>
        p.startsWith('user:')
      );

      expect(userPerms.length).toBeGreaterThanOrEqual(4); // CRUD
    });

    it('should have settings permissions', () => {
      const settingsPerms = Object.values(Permissions).filter((p) =>
        p.startsWith('settings:')
      );

      expect(settingsPerms.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Real-world scenarios', () => {
    it('should allow manager to create and assign projects', () => {
      expect(hasPermission('manager', Permissions.PROJECT_CREATE)).toBe(true);
      expect(hasPermission('manager', Permissions.USER_READ)).toBe(true);
    });

    it('should allow inspector to create inspections but not projects', () => {
      expect(hasPermission('inspector', Permissions.INSPECTION_CREATE)).toBe(true);
      expect(hasPermission('inspector', Permissions.PROJECT_CREATE)).toBe(false);
    });

    it('should allow viewer to see everything but change nothing', () => {
      expect(hasPermission('viewer', Permissions.PROJECT_READ)).toBe(true);
      expect(hasPermission('viewer', Permissions.INSPECTION_READ)).toBe(true);
      expect(hasPermission('viewer', Permissions.USER_READ)).toBe(true);

      expect(hasPermission('viewer', Permissions.PROJECT_UPDATE)).toBe(false);
      expect(hasPermission('viewer', Permissions.INSPECTION_UPDATE)).toBe(false);
      expect(hasPermission('viewer', Permissions.USER_UPDATE)).toBe(false);
    });

    it('should only allow admin to delete users', () => {
      expect(hasPermission('admin', Permissions.USER_DELETE)).toBe(true);
      expect(hasPermission('manager', Permissions.USER_DELETE)).toBe(false);
      expect(hasPermission('inspector', Permissions.USER_DELETE)).toBe(false);
      expect(hasPermission('viewer', Permissions.USER_DELETE)).toBe(false);
    });

    it('should only allow admin to manage organization settings', () => {
      expect(hasPermission('admin', Permissions.SETTINGS_MANAGE)).toBe(true);
      expect(hasPermission('manager', Permissions.SETTINGS_MANAGE)).toBe(false);
      expect(hasPermission('inspector', Permissions.SETTINGS_MANAGE)).toBe(false);
      expect(hasPermission('viewer', Permissions.SETTINGS_MANAGE)).toBe(false);
    });
  });
});
