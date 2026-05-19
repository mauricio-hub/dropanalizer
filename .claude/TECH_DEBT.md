# Deuda Técnica — Dropanalizer

Documento de funcionalidades pendientes para completar el producto. Ordenadas por prioridad de negocio.

---

## 1. Integración de Pagos con Lemon Squeezy (CRÍTICO)

**Por qué:** Sin pagos no hay monetización. Es el bloqueador principal para lanzar.

**Contexto:**
- Lemon Squeezy elegido sobre Stripe porque Colombia no es país soportado para recibir pagos directamente
- Lemon Squeezy actúa como Merchant of Record — maneja impuestos, facturación y compliance global
- Pagos llegan vía Wise o PayPal
- Comisión: ~5% + $0.50 USD por transacción

**Pasos para el dueño del producto:**
1. Crear cuenta en lemon squeezy.com
2. Crear producto "Pro" ($19/mo) y "Business" ($49/mo)
3. Crear cuenta en wise.com para recibir el dinero
4. Obtener: API Key, Webhook Secret, y Variant IDs de cada plan

**Lo que hay que implementar en el código:**

- [ ] `src/lib/lemonsqueezy.ts` — cliente SDK de Lemon Squeezy
- [ ] `src/app/api/webhooks/lemonsqueezy/route.ts` — webhook que escucha eventos:
  - `subscription_created` → activar plan en DB
  - `subscription_updated` → actualizar plan
  - `subscription_cancelled` → bajar a free al vencer
  - `subscription_payment_failed` → notificar / bajar plan
- [ ] Agregar campos al modelo `User` en Prisma:
  - `plan: FREE | PRO | BUSINESS`
  - `lsCustomerId` — ID del cliente en Lemon Squeezy
  - `lsSubscriptionId` — ID de la suscripción activa
  - `planExpiresAt` — fecha de vencimiento
- [ ] Botones "Upgrade" en `/settings` que redirijan al checkout de Lemon Squeezy
- [ ] Habilitar los planes en la página `/` (actualmente dicen "Próximamente")
- [ ] Middleware de permisos actualizado para validar plan desde DB (no solo free limit)
- [ ] Página de éxito post-pago (`/upgrade/success`)

**Archivos que se modifican:**
- `prisma/schema.prisma`
- `src/lib/permissions.ts`
- `src/app/(authenticated)/settings/page.tsx`
- `src/app/page.tsx` (pricing section)

---

## 2. Flujo de Upgrade In-App (ALTO)

**Por qué:** El free plan limita a 3 propuestas pero no hay forma de salir de ese límite desde la app.

**Lo que hay que implementar:**

- [ ] Modal/banner cuando el usuario alcanza el límite de 3 propuestas
- [ ] CTA claro hacia el plan Pro desde el dashboard
- [ ] Indicador del plan actual en el Topbar o Settings
- [ ] Página `/pricing` dedicada (o mejorar la sección en landing)

**Archivos que se modifican:**
- `src/components/ui/Topbar.tsx`
- `src/app/(authenticated)/dashboard/page.tsx`
- `src/components/DashboardEmptyState.tsx`

---

## 3. Background Jobs / AI Diagnosis Automático (MEDIO)

**Por qué:** Las recomendaciones AI se generan on-demand. El plan Business promete "diagnóstico automático cada 2-6h".

**Opciones de implementación:**
- Vercel Cron Jobs (simple, ya en el stack)
- Trigger.dev (más robusto, con reintentos)

**Lo que hay que implementar:**

- [ ] Cron job que recorra propuestas activas y genere recomendaciones nuevas
- [ ] `src/app/api/cron/recommendations/route.ts`
- [ ] Proteger el endpoint con `CRON_SECRET`
- [ ] Configurar en `vercel.json`

---

## 4. Página /catalog (MEDIO)

**Por qué:** La API CRUD existe (`/api/catalog`) pero la UI está vacía.

**Lo que hay que implementar:**

- [ ] Tabla de productos/servicios del usuario
- [ ] Formulario para crear/editar producto
- [ ] Botón de eliminar con confirmación
- [ ] Uso del catálogo como contexto al generar propuestas (ya hay soporte en el backend)

**Archivos que se modifican:**
- `src/app/(authenticated)/catalog/page.tsx`

---

## 5. A/B Testing de Versiones (BAJO — Plan Business)

**Por qué:** El sistema de versiones existe pero no hay comparación de performance entre versiones.

**Lo que hay que implementar:**

- [ ] UI de comparación side-by-side de métricas entre versiones
- [ ] Distribución de tráfico entre versiones (50/50 o configurable)
- [ ] Declarar "versión ganadora"

---

## 6. Notificaciones por Email (BAJO)

**Por qué:** No hay alertas cuando una propuesta recibe visitas o el cliente hace click en el CTA.

**Opciones:** Resend, SendGrid, Postmark

**Lo que hay que implementar:**

- [ ] Integrar proveedor de email (Resend recomendado)
- [ ] Email cuando propuesta recibe primera visita
- [ ] Email cuando cliente hace click en CTA (señal de compra)
- [ ] Email cuando suscripción falla el pago

---

## 7. Export de Analíticas (BAJO)

**Lo que hay que implementar:**

- [ ] Botón "Exportar CSV" en `/analytics` y `/proposals/[id]/analytics`
- [ ] Endpoint `GET /api/analytics/export`

---

## 8. Eliminación de Cuenta (BAJO)

**Por qué:** El botón existe en `/settings` pero está deshabilitado.

**Lo que hay que implementar:**

- [ ] Modal de confirmación con texto de verificación
- [ ] Endpoint `DELETE /api/user` que borre datos en cascada
- [ ] Cancelar suscripción en Lemon Squeezy antes de borrar
- [ ] Revocar sesión en Clerk

---

## 9. Panel de Admin (BAJO)

**Por qué:** El sistema de roles `USER | ADMIN` existe en Prisma y `ADMIN_EMAILS` en permissions.ts pero no hay UI.

**Lo que hay que implementar:**

- [ ] Ruta `/admin` protegida por rol ADMIN
- [ ] Tabla de usuarios con plan y fecha de registro
- [ ] Métricas globales (MRR, propuestas activas, usuarios por plan)

---

## Resumen de Prioridades

| # | Feature | Impacto | Esfuerzo | Prioridad |
|---|---------|---------|----------|-----------|
| 1 | Pagos Lemon Squeezy | Crítico | Alto | 🔴 P0 |
| 2 | Flujo upgrade in-app | Alto | Bajo | 🟠 P1 |
| 3 | Background jobs AI | Medio | Medio | 🟡 P2 |
| 4 | Página /catalog | Medio | Bajo | 🟡 P2 |
| 5 | A/B Testing | Bajo | Alto | 🟢 P3 |
| 6 | Notificaciones email | Bajo | Medio | 🟢 P3 |
| 7 | Export analíticas | Bajo | Bajo | 🟢 P3 |
| 8 | Eliminación de cuenta | Bajo | Bajo | 🟢 P3 |
| 9 | Panel admin | Bajo | Medio | 🟢 P3 |

---

*Última actualización: 2026-05-19*
