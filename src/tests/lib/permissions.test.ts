import { describe, it, expect } from 'vitest'
import {
  isAdmin,
  hasPermission,
  getPermissions,
  isLimitedByFreePlan,
  FREE_PLAN_PROPOSAL_LIMIT,
} from '@/lib/permissions'
import type { AppUser } from '@/types'

function makeUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    id: 'user-1',
    clerkId: 'clerk-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

const regularUser = makeUser()
const adminUser = makeUser({ role: 'ADMIN', email: 'mauriciogonzalezdeveloper@gmail.com' })

describe('FREE_PLAN_PROPOSAL_LIMIT', () => {
  it('is 3', () => {
    expect(FREE_PLAN_PROPOSAL_LIMIT).toBe(3)
  })
})

describe('isAdmin', () => {
  it('returns false for USER role', () => {
    expect(isAdmin(regularUser)).toBe(false)
  })

  it('returns true for ADMIN role', () => {
    expect(isAdmin(adminUser)).toBe(true)
  })
})

describe('isLimitedByFreePlan', () => {
  it('limits regular users', () => {
    expect(isLimitedByFreePlan(regularUser)).toBe(true)
  })

  it('does NOT limit admin users', () => {
    expect(isLimitedByFreePlan(adminUser)).toBe(false)
  })
})

describe('hasPermission', () => {
  it('grants USER basic proposal permissions', () => {
    expect(hasPermission(regularUser, 'proposals:create')).toBe(true)
    expect(hasPermission(regularUser, 'proposals:read')).toBe(true)
    expect(hasPermission(regularUser, 'proposals:update')).toBe(true)
    expect(hasPermission(regularUser, 'proposals:delete')).toBe(true)
    expect(hasPermission(regularUser, 'proposals:publish')).toBe(true)
  })

  it('grants USER analytics and versions permissions', () => {
    expect(hasPermission(regularUser, 'analytics:read')).toBe(true)
    expect(hasPermission(regularUser, 'versions:create')).toBe(true)
    expect(hasPermission(regularUser, 'versions:read')).toBe(true)
  })

  it('denies USER admin permissions', () => {
    expect(hasPermission(regularUser, 'admin:access')).toBe(false)
    expect(hasPermission(regularUser, 'admin:manage_users')).toBe(false)
  })

  it('grants ADMIN all permissions including admin ones', () => {
    expect(hasPermission(adminUser, 'proposals:create')).toBe(true)
    expect(hasPermission(adminUser, 'admin:access')).toBe(true)
    expect(hasPermission(adminUser, 'admin:manage_users')).toBe(true)
  })
})

describe('getPermissions', () => {
  it('returns permissions array for USER', () => {
    const perms = getPermissions(regularUser)
    expect(Array.isArray(perms)).toBe(true)
    expect(perms).toContain('proposals:create')
    expect(perms).not.toContain('admin:access')
  })

  it('returns more permissions for ADMIN than USER', () => {
    const userPerms = getPermissions(regularUser)
    const adminPerms = getPermissions(adminUser)
    expect(adminPerms.length).toBeGreaterThan(userPerms.length)
  })
})
