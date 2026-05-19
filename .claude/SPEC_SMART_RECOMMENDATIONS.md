# SPEC: Sistema de Recomendaciones Inteligentes

## What
Un sistema que analiza el comportamiento de los visitantes en cada página de venta y genera recomendaciones accionables en lenguaje natural — sin gráficas, sin métricas técnicas. El usuario ve qué está pasando y qué hacer, con un solo click para actuar.

## Why
Los dropshippers no saben leer métricas. Tener Google Analytics-style dashboards genera confusión, no acción. Dropanalizer debe actuar como un mentor de ventas: diagnosticar el problema y decir exactamente qué hacer.

## Arquitectura: Dos capas

### Capa 1 — Reglas deterministas (todos los planes, instantáneo, sin costo AI)
Lógica basada en umbrales. Corre en el servidor al cargar la página de analytics.

| Condición | Señal | Severidad |
|-----------|-------|-----------|
| visitas < 30 | "Muy pronto para concluir algo. Comparte más tu link." | info |
| visitas >= 30 AND días activa < 2 | "Solo lleva X días. Dale al menos 3 días antes de cambiar algo." | info |
| CTR < 1% AND visitas >= 50 AND días >= 3 | "Casi nadie quiere comprar. El problema puede ser el precio, el producto o la confianza." | critical |
| CTR 1-3% AND visitas >= 50 | "Hay interés pero algo frena la decisión. Prueba agregar urgencia o testimonios." | warning |
| CTR > 5% | "Buena intención de compra. Escala el tráfico." | success |
| días >= 7 AND CTR < 2% | "Esta página lleva 7+ días sin convertir bien. Es momento de cambiar algo." | critical |
| días >= 5 AND CTR < 1% AND visitas >= 100 | "Con este tráfico y sin conversiones, considera cambiar de producto." | critical |
| tiempo_promedio < 10s AND visitas >= 30 | "Los visitantes se van muy rápido. Tu hero o imagen principal no engancha." | warning |
| 0 clicks en sección beneficios AND visitas >= 50 | "Nadie está leyendo tus beneficios. Ponlos más arriba o hazlos más cortos." | warning |

### Capa 2 — Análisis con Claude (Pro y Business, máx 1 vez cada 6h por página)
Claude recibe contexto completo y genera un diagnóstico narrativo personalizado.

**Input al modelo:**
```
- Contenido de la página (headline, beneficios, precio, CTA text)
- Métricas: visitas, CTR, tiempo promedio por sección, clicks por sección
- Días activa, versión actual
- Historial de versiones anteriores y sus métricas
```

**Output esperado (JSON):**
```json
{
  "diagnosis": "Tu headline promete ahorro pero tu precio de $89 no tiene justificación visible. Los visitantes llegan, ven el precio y se van.",
  "action": "Agrega una comparación: 'Normalmente $150, hoy $89'. El contraste visual justifica el precio.",
  "actionType": "edit_content", // "edit_content" | "new_version" | "change_product" | "scale_traffic"
  "confidence": "high" // "low" | "medium" | "high"
}
```

## Modelo de datos

```prisma
model Recommendation {
  id           String   @id @default(cuid())
  proposalId   String
  proposal     Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  layer        Int      // 1 = reglas, 2 = AI
  type         String   // "info" | "warning" | "critical" | "success"
  title        String
  body         String
  actionLabel  String?
  actionType   String?  // "edit_content" | "new_version" | "change_product" | "scale_traffic" | "share_link"
  dismissed    Boolean  @default(false)
  generatedAt  DateTime @default(now())
  expiresAt    DateTime?
}
```

## UI: Sección "Señales" en la página de analytics

Reemplaza (o va encima de) las métricas actuales. Se muestra como un feed de tarjetas.

### Anatomía de una tarjeta
```
┌─────────────────────────────────────────────┐
│ 🔴  Intención de compra muy baja             │
│                                              │
│ 94 personas vieron tu página pero solo 1    │
│ hizo click en Comprar. Con 5 días de datos  │
│ esto es una señal clara de problema.        │
│                                             │
│ [→ Generar nueva versión con IA]  [Ignorar] │
└─────────────────────────────────────────────┘
```

### Estados según tráfico
- **Sin datos aún** (< 10 visitas): mensaje único — "Comparte tu link para empezar a recibir señales."
- **Datos insuficientes** (10-29 visitas): señales de capa 1 solo tipo "info"
- **Datos confiables** (30+ visitas): señales completas de capa 1
- **Análisis AI disponible** (Pro/Business, 50+ visitas): señal de capa 2 al tope

## Disponibilidad por plan

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Señales básicas (Capa 1) | ✓ 2 señales máx | ✓ Todas | ✓ Todas |
| Diagnóstico AI (Capa 2) | — | ✓ | ✓ |
| Recomendación cross-páginas | — | — | ✓ |
| Frecuencia de actualización AI | — | Cada 6h | Cada 2h |

**Free ve** las 2 señales más críticas con un banner: *"Activa Pro para ver el diagnóstico completo con IA."*

## Flujo de generación

1. Usuario abre analytics de una página
2. API carga señales de Capa 1 en tiempo real (sin costo, sin delay)
3. Si el usuario es Pro/Business Y la última recomendación AI tiene > 6h:
   - Se dispara job en background que llama a Claude
   - Resultado se guarda en `Recommendation`
   - Frontend hace polling o recibe por SSE
4. Si la recomendación AI tiene < 6h: se sirve la guardada en DB

## Acciones desde una señal

| actionType | Qué hace |
|------------|----------|
| `edit_content` | Abre el editor de la página directamente |
| `new_version` | Llama al endpoint de generar nueva versión con IA |
| `change_product` | Lleva al wizard de nueva página de venta |
| `scale_traffic` | Abre modal con el link para copiar y compartir |
| `share_link` | Copia el link al clipboard |

## Archivos a crear/modificar

**Crear:**
- `src/app/api/recommendations/[proposalId]/route.ts` — genera y sirve señales Capa 1
- `src/app/api/recommendations/[proposalId]/ai/route.ts` — dispara análisis Capa 2
- `src/components/SmartRecommendations.tsx` — UI del feed de señales
- `src/lib/recommendations.ts` — lógica de reglas Capa 1

**Modificar:**
- `prisma/schema.prisma` — agregar modelo Recommendation
- `src/app/(authenticated)/proposals/[id]/analytics/page.tsx` — integrar componente

## Acceptance criteria

- [ ] Capa 1 genera señales correctas según umbrales definidos
- [ ] Free ve máximo 2 señales con CTA a upgrade
- [ ] Pro/Business ven diagnóstico AI actualizado cada 6h
- [ ] Cada señal tiene exactamente una acción sugerida
- [ ] Las señales se adaptan al tiempo de vida de la página
- [ ] Usuario puede descartar una señal (dismissed)
- [ ] Sin datos suficientes muestra estado vacío claro, no señales falsas

## Out of scope

- Recomendaciones cross-páginas (Business, fase 2)
- A/B testing automático
- Notificaciones push o email cuando hay nueva señal
- Historial de recomendaciones pasadas
