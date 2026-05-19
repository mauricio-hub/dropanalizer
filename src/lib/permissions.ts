import type { AppUser, Permission, Role } from '@/types'

// Emails that are always granted ADMIN role regardless of DB value.
// Used as a safety net during upsert — the DB is the source of truth at runtime.
export const ADMIN_EMAILS = ['mauriciogonzalezdeveloper@gmail.com'] as const

export const FREE_PLAN_PROPOSAL_LIMIT = 3

// Permissions granted per role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [
    'proposals:create',
    'proposals:read',
    'proposals:update',
    'proposals:delete',
    'proposals:publish',
    'versions:create',
    'versions:read',
    'catalog:manage',
    'analytics:read',
  ],
  ADMIN: [
    'proposals:create',
    'proposals:read',
    'proposals:update',
    'proposals:delete',
    'proposals:publish',
    'versions:create',
    'versions:read',
    'catalog:manage',
    'analytics:read',
    'admin:access',
    'admin:manage_users',
  ],
}

export function isAdmin(user: AppUser): boolean {
  return user.role === 'ADMIN'
}

export function hasPermission(user: AppUser, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
}

export function getPermissions(user: AppUser): Permission[] {
  return ROLE_PERMISSIONS[user.role] ?? []
}

/** Returns true if user is subject to the free plan proposal limit. */
export function isLimitedByFreePlan(user: AppUser): boolean {
  return !isAdmin(user)
}
