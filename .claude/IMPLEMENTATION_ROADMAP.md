# Implementation Roadmap - Dropanalizer MVP

## 📋 Overview

Este documento define el roadmap técnico para llevar Dropanalizer desde su estado actual (creación básica de propuestas) a un MVP funcional (propuestas con IA, versioning, tracking).

**Fase Actual:** Infraestructura + Primera funcionalidad (Generación con IA)

---

## 🎯 Milestone 1: Proposal Generation with AI

**Spec:** [SPEC_PROPOSAL_GENERATION.md](./SPEC_PROPOSAL_GENERATION.md)

### Task 1.1: Update DB Schema
- [ ] Agregar campo `status` a Proposal
- [ ] Agregar campo `generatedAt` a Version
- [ ] Update Prisma schema
- [ ] Run migration

**Acceptance:**
- Schema está actualizado en prisma/schema.prisma
- Migration ejecutada exitosamente

---

### Task 1.2: Update API /api/proposals (POST)
- [ ] Recibir `generateWithAI` en body
- [ ] Validar title y brief
- [ ] Crear Proposal + Version
- [ ] SI generateWithAI: llamar OpenAI
- [ ] Manejar errores de OpenAI
- [ ] Return proposal + version

**Acceptance:**
- POST /api/proposals crea propuesta
- generateWithAI=true dispara OpenAI
- Response incluye version con content estructurado
- Errores no crashean la app

**Files to change:**
- `src/app/api/proposals/route.ts`
- `src/lib/openai.ts` (mejorar)

---

### Task 1.3: Create Editable Page /proposals/[id]/edit
- [ ] Mostrar title + status
- [ ] Formulario editable: scope, deliverables, timeline, pricing
- [ ] Button "Save Draft"
- [ ] Button "Publish"
- [ ] Button "Preview"
- [ ] Validar antes de guardar

**Acceptance:**
- Página carga sin errores
- Puedo editar cada sección
- Los cambios se guardan

**Files to create:**
- `src/app/proposals/[id]/edit/page.tsx`

---

### Task 1.4: Create API PUT /api/proposals/[id]/versions/[versionId]
- [ ] Recibir content actualizado
- [ ] Validar estructura
- [ ] Guardar en BD
- [ ] Return version actualizada

**Acceptance:**
- PUT request actualiza version
- Validaciones funcionan
- Response es correcta

**Files to change:**
- `src/app/api/proposals/[id]/route.ts` (agregar PUT handler)

---

### Task 1.5: Update Public Landing /p/[id]
- [ ] Renderizar content (scope, deliverables, timeline, pricing)
- [ ] Mejorar visual (sections)
- [ ] Agregar tracking (lado del cliente)

**Acceptance:**
- Landing renderiza content correctamente
- Se ve profesional
- Tracking iniciado (no debe bloquear)

**Files to change:**
- `src/app/p/[id]/page.tsx`
- `src/lib/tracking.ts` (crear)

---

## 🎯 Milestone 2: Versioning

**Spec:** [SPEC_VERSIONING.md](./SPEC_VERSIONING.md)

### Task 2.1: Create API POST /api/proposals/[id]/versions
- [ ] Crear nueva versión basada en anterior
- [ ] Copiar content
- [ ] Incrementar version number
- [ ] SI AI: llamar OpenAI con contexto

**Acceptance:**
- Puedo crear nueva versión
- Content se copia correctamente

**Files to change:**
- Create `src/app/api/proposals/[id]/versions/route.ts`

---

### Task 2.2: Create API POST /api/proposals/[id]/versions/[versionId]/publish
- [ ] Validar versión
- [ ] Marcar como published
- [ ] Generar publicUrl
- [ ] Archivar versiones anteriores

**Acceptance:**
- Versión se publica
- URL pública es generada
- Versiones anteriores se archivan

**Files to change:**
- Create `src/app/api/proposals/[id]/versions/[versionId]/route.ts`

---

### Task 2.3: Update Dashboard /proposals/[id]
- [ ] Mostrar tabla de versiones
- [ ] Actions: Edit / Publish / Preview
- [ ] Status badge

**Acceptance:**
- Dashboard muestra todas las versiones
- Puedo publicar versión desde dashboard

**Files to change:**
- `src/app/proposals/[id]/page.tsx`

---

## 🎯 Milestone 3: Event Tracking

**Spec:** [SPEC_TRACKING.md](./SPEC_TRACKING.md)

### Task 3.1: Create Tracking Library
- [ ] Crear `src/lib/tracking.ts`
- [ ] Función `trackEvent(versionId, type, section?)`
- [ ] Cliente-side async calls
- [ ] No bloquea si falla

**Acceptance:**
- trackEvent() está disponible
- Calls son async

---

### Task 3.2: Create API POST /api/track
- [ ] Recibir versionId, type, section
- [ ] Crear Event en BD
- [ ] Return 200 OK

**Acceptance:**
- POST /api/track crea eventos
- No requiere auth

**Files to change:**
- Create `src/app/api/track/route.ts`

---

### Task 3.3: Integrate Tracking in Landing /p/[id]
- [ ] Al cargar: trackEvent(..., "view")
- [ ] En secciones: onClick trackEvent(..., "click", section)

**Acceptance:**
- Landing trackea views
- Clicks se registran
- BD tiene eventos

---

### Task 3.4: Create Analytics Page /proposals/[id]/analytics
- [ ] Mostrar tabla de eventos
- [ ] Totales: views, clicks por sección
- [ ] Gráficos básicos (opcional para MVP)

**Acceptance:**
- Página muestra eventos
- Datos son correctos

**Files to create:**
- `src/app/proposals/[id]/analytics/page.tsx`

---

## 📊 Task Breakdown by File

### `/src/app/api/proposals/route.ts`
- [ ] POST: Agregar generateWithAI logic
- [ ] POST: Crear Version con content

### `/src/app/api/proposals/[id]/route.ts`
- [ ] GET: Incluir versions
- [ ] PUT: Handler para actualizar version

### `/src/app/api/proposals/[id]/versions/route.ts` (NEW)
- [ ] POST: Crear nueva versión

### `/src/app/api/proposals/[id]/versions/[versionId]/route.ts` (NEW)
- [ ] POST: Publish versión

### `/src/app/api/track/route.ts` (NEW)
- [ ] POST: Crear evento

### `/src/lib/tracking.ts` (NEW)
- [ ] trackEvent() function

### `/src/lib/openai.ts` (IMPROVE)
- [ ] Función para generar propuesta estruturada

### `/src/app/proposals/[id]/edit/page.tsx` (NEW)
- [ ] Formulario editable

### `/src/app/proposals/[id]/analytics/page.tsx` (NEW)
- [ ] Tabla de eventos

### `/src/app/p/[id]/page.tsx` (UPDATE)
- [ ] Renderizar content
- [ ] Agregar tracking calls

### `/prisma/schema.prisma`
- [ ] Agregar status a Proposal
- [ ] Agregar generatedAt a Version

---

## ⏱️ Estimated Timeline

| Milestone | Task | Est. Hours |
|-----------|------|-----------|
| M1 | Schema + API updates | 3 |
| M1 | Edit page + validation | 4 |
| M1 | Public landing + tracking | 3 |
| M2 | Versioning APIs | 4 |
| M2 | Dashboard updates | 2 |
| M3 | Tracking library + API | 3 |
| M3 | Analytics page | 2 |
| **TOTAL** | | **21 hours** |

---

## ✅ Success Criteria (MVP Complete)

- [ ] Usuario puede crear propuesta + brief
- [ ] OpenAI genera contenido estructurado
- [ ] Usuario ve propuesta editable
- [ ] Usuario puede editar y guardar
- [ ] Usuario puede publicar
- [ ] Landing pública renderiza correctamente
- [ ] Landing trackea views y clicks
- [ ] Usuario puede crear nuevas versiones
- [ ] Usuario ve analytics básico
- [ ] No hay N+1 queries
- [ ] Errors son manejados gracefully
- [ ] Performance < 3s por página

---

## 🔧 Dependencies

- OpenAI API key (ya configurado)
- Prisma migrations
- TypeScript types
- Database (PostgreSQL)

---

## 📝 Notes

1. **Spec-driven:** Cada task debe implementar exactamente lo que dice su spec
2. **Minimal MVP:** No agregar features fuera del roadmap
3. **Testing:** Probar manualmente cada feature en el navegador
4. **Commits:** Un commit por task completada
