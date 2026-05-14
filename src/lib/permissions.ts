import type { Role } from '@prisma/client'

type Action =
  | 'clients:read' | 'clients:write' | 'clients:delete'
  | 'quotes:read' | 'quotes:write' | 'quotes:delete' | 'quotes:approve'
  | 'projects:read' | 'projects:write' | 'projects:delete'
  | 'users:manage'
  | 'settings:manage'
  | 'reports:view'

const PERMISSIONS: Record<Role, Action[]> = {
  ADMIN: [
    'clients:read', 'clients:write', 'clients:delete',
    'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:approve',
    'projects:read', 'projects:write', 'projects:delete',
    'users:manage', 'settings:manage', 'reports:view',
  ],
  MANAGEMENT: [
    'clients:read', 'clients:write',
    'quotes:read', 'quotes:write', 'quotes:approve',
    'projects:read', 'projects:write',
    'reports:view',
  ],
  SALES: [
    'clients:read', 'clients:write',
    'quotes:read', 'quotes:write',
    'projects:read',
  ],
  OPERATIONS: [
    'clients:read',
    'quotes:read',
    'projects:read', 'projects:write',
  ],
}

export function can(role: Role, action: Action): boolean {
  return PERMISSIONS[role]?.includes(action) ?? false
}

export function requireRole(role: Role, action: Action) {
  if (!can(role, action)) {
    throw new Error(`Forbidden: rol ${role} no puede ${action}`)
  }
}
