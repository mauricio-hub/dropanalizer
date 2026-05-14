# SPEC: Proposal Generation with AI

## 1. OBJETIVO
Cuando un usuario crea una propuesta con un brief (texto libre), el sistema debe:
1. Capturar el brief
2. Llamar a OpenAI para estructurar el contenido
3. Guardar el contenido estructurado en la BD
4. Permitir al usuario ver y editar el contenido antes de publicar

---

## 2. DATA MODEL

### Propuesta (Actualizada)
```
Proposal {
  id: String
  title: String
  type: "service" | "product"
  userId: String
  tenantId: String
  status: "draft" | "published"  // NUEVO: estado
  createdAt: DateTime
  updatedAt: DateTime
  
  versions: Version[]
}
```

### Version (Actualizada)
```
Version {
  id: String
  proposalId: String
  version: Int
  content: {
    scope: String
    deliverables: String[]
    timeline: TimelinePhase[]
    pricing: {
      total: Number
      currency: "USD" | "EUR" | "ARS"
      breakdown?: String
    }
  }
  isPublished: Boolean
  publicUrl: String? @unique
  generatedAt: DateTime  // NUEVO: timestamp de generación
  createdAt: DateTime
  
  events: Event[]
}
```

### TimelinePhase
```
{
  phase: String
  duration: String
  description: String
}
```

---

## 3. FLUJO: "Crear Propuesta"

### 3.1 USER JOURNEY
1. Usuario va a `/proposals/new`
2. Ingresa `title` y `brief` (textarea)
3. **[OPCIONAL]** Checkbox: "Generate with AI"
4. Click en "Create Proposal"

### 3.2 BACKEND: POST /api/proposals

**Input:**
```json
{
  "title": "Website Redesign for Acme Co.",
  "brief": "We need a complete redesign of our e-commerce website...",
  "generateWithAI": true
}
```

**Output:**
```json
{
  "id": "prop_xyz",
  "title": "Website Redesign for Acme Co.",
  "type": "service",
  "status": "draft",
  "versions": [{
    "id": "ver_1",
    "version": 1,
    "content": {
      "scope": "...",
      "deliverables": ["Feature 1", "Feature 2"],
      "timeline": [...],
      "pricing": { "total": 5000, "currency": "USD" }
    },
    "isPublished": false,
    "generatedAt": "2026-05-13T10:00:00Z"
  }]
}
```

**Steps:**
1. Validar user (auth)
2. Validar input (title requerido)
3. Crear Proposal con status="draft"
4. SI generateWithAI=true:
   - Llamar OpenAI (prompt estructurado)
   - Crear Version con content estructurado
5. SI generateWithAI=false:
   - Crear Version vacía (el user rellenará manualmente)
6. Retornar proposal con primera version

---

## 4. OPENAI INTEGRATION

### 4.1 PROMPT (para estruturación)
```
Tu tarea es analizar el siguiente brief de propuesta y estructurarlo profesionalmente.

BRIEF:
{brief}

Debes retornar un JSON con esta estructura exacta:
{
  "scope": "Una descripción concisa del alcance del proyecto (2-3 párrafos)",
  "deliverables": ["Deliverable 1", "Deliverable 2", ...],
  "timeline": [
    {
      "phase": "Nombre de la fase",
      "duration": "Ej: 2 semanas",
      "description": "Qué se hace en esta fase"
    }
  ],
  "pricing": {
    "total": 5000,
    "currency": "USD",
    "breakdown": "Descripción opcional de cómo se distribuye el precio"
  }
}

Reglas:
- El JSON debe ser válido
- Sé profesional pero accesible
- Proporciona al menos 3 deliverables
- Proporciona al menos 2 fases de timeline
- El precio debe ser realista para la industria
```

### 4.2 Error Handling
- Si OpenAI falla: crear Version vacía, retornar error al cliente
- Si parse falla: usar defaults, retornar error al cliente
- Reintentos: máximo 3 intentos con backoff exponencial

---

## 5. PÁGINA: /proposals/[id] (Editable)

### 5.1 UI
- **Header**: Title + Status badge
- **Content Sections** (editables):
  - Scope (textarea)
  - Deliverables (lista editable)
  - Timeline (tabla editable)
  - Pricing (número + currency)
- **Actions**:
  - "Save Draft"
  - "Publish"
  - "Preview" (vista pública)

### 5.2 Backend: PUT /api/proposals/[id]/versions/[versionId]
**Input:**
```json
{
  "content": {
    "scope": "...",
    "deliverables": [...],
    "timeline": [...],
    "pricing": {...}
  }
}
```

**Output:** Version actualizada

---

## 6. PÁGINA: /p/[id] (Pública)

### 6.1 Cambios
- Renderizar `version.content` en lugar de `proposal.description`
- Mostrar scope, deliverables, timeline, pricing
- Agregar tracking para views y clicks
- **NO mostrar** opciones de edición

---

## 7. VALIDACIONES

### Propuesta
- title: required, min 5 chars, max 200
- brief: required, min 20 chars, max 5000

### Content (Versión)
- scope: min 50 chars, max 2000
- deliverables: min 1, max 20 items
- timeline: min 1 phase, max 10 phases
- pricing.total: min 0, max 999999

---

## 8. PRIORIDAD PARA MVP
1. ✅ Crear Proposal + Version en BD (sin AI)
2. 🔄 Integración OpenAI (this task)
3. 📝 Página editable `/proposals/[id]`
4. 🌐 Publicar + landing pública `/p/[id]`
5. 📊 Tracking básico
6. 🔀 Versioning (crear nuevas versiones)

---

## 9. SUCCESS CRITERIA
- [ ] Usuario puede crear propuesta con brief
- [ ] OpenAI genera contenido estructurado
- [ ] Versión se guarda en BD con content
- [ ] Usuario ve la propuesta generada
- [ ] Usuario puede editar antes de publicar
- [ ] Landing pública renderiza content correctamente
- [ ] No hay errores de parse ni crashes
