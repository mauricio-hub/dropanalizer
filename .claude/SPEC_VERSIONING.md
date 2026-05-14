# SPEC: Proposal Versioning

## 1. OBJETIVO
Permitir a usuarios crear múltiples versiones de una propuesta:
- Nueva versión basada en draft anterior
- Nueva versión generada con IA (mejora)
- Comparación entre versiones

---

## 2. FLUJO: Crear Nueva Versión

### 2.1 USER JOURNEY
1. Usuario ve propuesta publicada en `/proposals/[id]`
2. Click en "New Version"
3. Selecciona base: "From current" o "From AI"
4. Ajusta contenido
5. Guarda como draft
6. Puede previsualizar antes de publicar

### 2.2 BACKEND: POST /api/proposals/[id]/versions

**Input:**
```json
{
  "basedOnVersionId": "ver_1",
  "generateWithAI": false
}
```

**Logic:**
1. Validar que proposal pertenece al usuario
2. Copiar content de versión anterior
3. Incrementar version number
4. Crear nueva Version con:
   - Si generateWithAI=true: llamar OpenAI con contexto anterior
   - Si generateWithAI=false: copiar tal cual

**Output:**
```json
{
  "id": "ver_2",
  "version": 2,
  "proposalId": "prop_xyz",
  "content": { ... },
  "isPublished": false
}
```

---

## 3. ESTADOS DE VERSIÓN

```
draft -> publishing -> published
  ↓         ↓            ↓
Edit    In progress   Immutable
Save    API call      (tracking only)
```

---

## 4. PUBLICAR VERSIÓN

### 4.1 BACKEND: POST /api/proposals/[id]/versions/[versionId]/publish

**Steps:**
1. Validar versión pertenece a propuesta del usuario
2. Validar content está completo
3. Marcar `isPublished = true`
4. Generar URL único: `/p/{proposalId}-{versionId}`
5. Cualquier versión anterior se marca como "archived"

**Output:**
```json
{
  "id": "ver_1",
  "isPublished": true,
  "publicUrl": "/p/prop_xyz-ver_1"
}
```

---

## 5. LANDING PÚBLICA: /p/[id]

Renderiza la **versión activa** (published=true):
- Si hay múltiples published: usa la más reciente
- Content: scope, deliverables, timeline, pricing
- Tracking: registra views y clicks
- NO edición ni versioning visible

---

## 6. DASHBOARD: Mostrar Versiones

### 6.1 En `/proposals/[id]`
Mostrar tabla de versiones:
- Version number
- Fecha de creación
- Status (draft/published)
- Actions (Edit / Publish / Preview / Delete draft)

---

## 7. SUCCESS CRITERIA
- [ ] Usuario puede crear nueva versión
- [ ] Versión hereda content de anterior
- [ ] Usuario puede editar nueva versión
- [ ] Usuario puede publicar versión
- [ ] URL pública renderiza versión correcta
- [ ] Versiones anteriores se archivan
- [ ] Dashboard muestra todas las versiones
