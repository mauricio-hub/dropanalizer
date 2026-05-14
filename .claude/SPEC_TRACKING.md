# SPEC: Event Tracking (MVP)

## 1. OBJETIVO
Registrar comportamiento del cliente en propuestas públicas sin afectar performance:
- Page views
- Section clicks
- Time spent (opcional para MVP)

---

## 2. EVENTOS A REGISTRAR

### 2.1 Page View
**Cuándo:** Cliente abre `/p/[id]`
**Data:**
```json
{
  "type": "view",
  "versionId": "ver_1",
  "timestamp": "2026-05-13T10:00:00Z"
}
```

### 2.2 Section Click
**Cuándo:** Cliente hace click en sección (scope, deliverables, timeline, pricing)
**Data:**
```json
{
  "type": "click",
  "versionId": "ver_1",
  "section": "deliverables",
  "timestamp": "2026-05-13T10:00:15Z"
}
```

---

## 3. IMPLEMENTACIÓN

### 3.1 Tracking Script (Cliente)
```typescript
// /src/lib/tracking.ts
export async function trackEvent(versionId: string, type: string, section?: string) {
  fetch('/api/track', {
    method: 'POST',
    body: JSON.stringify({ versionId, type, section }),
  }).catch(() => {}) // No bloquea si falla
}
```

### 3.2 Backend: POST /api/track
**Input:**
```json
{
  "versionId": "ver_1",
  "type": "view" | "click",
  "section": "deliverables"
}
```

**Logic:**
1. Validar versionId existe
2. Crear Event en BD
3. Return 200 OK
4. **No validar auth** (cliente público)

**Performance:**
- Llamada async, no bloquea
- No esperar confirmación del servidor

---

## 4. LANDING PAGE: /p/[id]

### 4.1 Cambios
1. Al cargar: trackEvent(versionId, "view")
2. En cada sección: onClick handler que llama trackEvent(..., "click", section)
3. Links, CTAs también se trackean

---

## 5. DASHBOARD: Ver EVENTOS

### 5.1 En `/proposals/[id]/analytics`
Tabla simple:
- Tabla de eventos (últimos 100)
- Columnas: Fecha, Tipo, Sección
- Totales: X views, Y clicks

---

## 6. SUCCESS CRITERIA
- [ ] Landing page trackea views
- [ ] Clicks en secciones se registran
- [ ] Events se guardan en BD
- [ ] No bloquean la experiencia del usuario
- [ ] Dashboard muestra eventos
- [ ] No hay N+1 queries
