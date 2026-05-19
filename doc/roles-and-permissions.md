# Roles y Permisos — Proply

## Resumen

Proply usa un sistema de roles simple y extensible. Cada usuario tiene un rol asignado en base de datos que determina qué puede hacer en la plataforma.

---

## Roles

| Rol | Descripción | Quién lo tiene |
|-----|-------------|----------------|
| `USER` | Usuario estándar. Sujeto a los límites del plan gratuito. | Todos los usuarios nuevos por defecto |
| `ADMIN` | Acceso total. Sin límites de creación. Puede gestionar la plataforma. | `mauriciogonzalezdeveloper@gmail.com` |

### Asignación de roles

- **Por defecto:** todo usuario nuevo recibe `role: USER` (definido en el schema de Prisma como `@default(USER)`).
- **ADMIN:** los emails listados en `ADMIN_EMAILS` (`src/lib/permissions.ts`) reciben `role: ADMIN` automáticamente en cada upsert al hacer login. Esto garantiza que aunque el registro se haya creado antes de este sistema, el rol se actualiza al próximo inicio de sesión.

Para agregar un nuevo admin, añadir su email a la constante `ADMIN_EMAILS` en [`src/lib/permissions.ts`](../src/lib/permissions.ts):

```ts
export const ADMIN_EMAILS = [
  'mauriciogonzalezdeveloper@gmail.com',
  // 'nuevo-admin@ejemplo.com',
] as const
```

---

## Permisos

Los permisos son strings con formato `recurso:accion`. Se definen en [`src/types/index.ts`](../src/types/index.ts) como el tipo `Permission`.

### Matriz de permisos por rol

| Permiso | USER | ADMIN |
|---------|------|-------|
| `proposals:create` | ✅ (limitado) | ✅ (ilimitado) |
| `proposals:read` | ✅ | ✅ |
| `proposals:update` | ✅ | ✅ |
| `proposals:delete` | ✅ | ✅ |
| `proposals:publish` | ✅ | ✅ |
| `versions:create` | ✅ | ✅ |
| `versions:read` | ✅ | ✅ |
| `catalog:manage` | ✅ | ✅ |
| `analytics:read` | ✅ | ✅ |
| `admin:access` | ❌ | ✅ |
| `admin:manage_users` | ❌ | ✅ |

> Los permisos `admin:*` están reservados para futura UI de administración.

---

## Límites del plan gratuito

| Recurso | Límite (USER) | Límite (ADMIN) |
|---------|--------------|----------------|
| Proposals | 3 | Ilimitado |

El límite está definido en `FREE_PLAN_PROPOSAL_LIMIT` en [`src/lib/permissions.ts`](../src/lib/permissions.ts).

---

## Helpers disponibles

Todos en [`src/lib/permissions.ts`](../src/lib/permissions.ts):

```ts
// ¿El usuario es ADMIN?
isAdmin(user: AppUser): boolean

// ¿El usuario tiene un permiso específico?
hasPermission(user: AppUser, permission: Permission): boolean

// Lista todos los permisos del usuario
getPermissions(user: AppUser): Permission[]

// ¿El usuario está sujeto al límite del plan gratuito?
isLimitedByFreePlan(user: AppUser): boolean
```

### Ejemplo de uso en una API route

```ts
import { getCurrentUser } from '@/lib/auth'
import { isAdmin, hasPermission } from '@/lib/permissions'

const user = await getCurrentUser()
if (!user) return unauthorized()

// Verificar permiso específico
if (!hasPermission(user, 'admin:access')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Verificar si es admin
if (isAdmin(user)) {
  // lógica exclusiva de admin
}
```

---

## Archivos del sistema

| Archivo | Rol |
|---------|-----|
| [`prisma/schema.prisma`](../prisma/schema.prisma) | Define el enum `Role` y el campo `role` en el modelo `User` |
| [`src/types/index.ts`](../src/types/index.ts) | Tipos TypeScript: `Role`, `Permission`, `AppUser` |
| [`src/lib/permissions.ts`](../src/lib/permissions.ts) | Constantes (`ADMIN_EMAILS`, `FREE_PLAN_PROPOSAL_LIMIT`) y helpers |
| [`src/lib/auth.ts`](../src/lib/auth.ts) | `getCurrentUser()` — asigna rol ADMIN en upsert |
| [`src/app/api/proposals/route.ts`](../src/app/api/proposals/route.ts) | Ejemplo: límite de plan respetando el rol |

---

## Roadmap de permisos (fuera del MVP)

- [ ] UI de administración (`/admin`) visible solo para `ADMIN`
- [ ] Gestión de usuarios desde el panel (cambiar roles, suspender)
- [ ] Sistema de planes (Free / Pro / Business) con permisos por plan
- [ ] Audit log: registrar quién hizo qué y cuándo
- [ ] API keys para integraciones externas
