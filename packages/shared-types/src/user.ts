import { z } from 'zod';

// User roles
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  INSPECTOR: 'inspector',
  VIEWER: 'viewer',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// User status
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// User type
export interface User {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// User with profile
export interface UserWithProfile extends User {
  profile: UserProfile | null;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emergencyContact: string | null;
  hireDate: Date | null;
  terminationDate: Date | null;
}

// Zod schemas for validation
export const userRoleSchema = z.enum(['admin', 'manager', 'inspector', 'viewer']);
export const userStatusSchema = z.enum(['active', 'inactive', 'suspended']);

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
