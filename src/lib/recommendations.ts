export type Severity = 'info' | 'warning' | 'critical' | 'success'
export type ActionType = 'edit_content' | 'new_version' | 'change_product' | 'scale_traffic' | 'share_link'

export interface Signal {
  severity: Severity
  title: string
  body: string
  actionLabel?: string
  actionType?: ActionType
}

interface MetricsInput {
  totalViews: number
  buyIntentClicks: number
  totalClicks: number
  avgTimeOnPage: number // seconds
  benefitsClicks: number
  createdAt: Date // proposal creation date
  language: 'es' | 'en'
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export function generateSignals(metrics: MetricsInput): Signal[] {
  const {
    totalViews,
    buyIntentClicks,
    totalClicks,
    avgTimeOnPage,
    benefitsClicks,
    createdAt,
    language,
  } = metrics

  const es = language === 'es'
  const days = daysSince(createdAt)
  const ctr = totalViews > 0 ? buyIntentClicks / totalViews : 0
  const signals: Signal[] = []

  // --- No traffic yet ---
  if (totalViews < 10) {
    signals.push({
      severity: 'info',
      title: es ? 'Comparte tu página para empezar' : 'Share your page to get started',
      body: es
        ? 'Aún no tienes visitas suficientes. Comparte el link en tus anuncios, redes o grupos para empezar a recibir datos.'
        : "You don't have enough visits yet. Share your link in your ads, social media or groups to start collecting data.",
      actionLabel: es ? 'Copiar link' : 'Copy link',
      actionType: 'share_link',
    })
    return signals
  }

  // --- Too early to conclude ---
  if (days < 2 && totalViews < 50) {
    signals.push({
      severity: 'info',
      title: es ? 'Es muy pronto para concluir algo' : 'Too early to draw conclusions',
      body: es
        ? `Tu página lleva solo ${days === 0 ? 'menos de 1 día' : `${days} día${days > 1 ? 's' : ''}`}. Dale al menos 3 días con tráfico constante antes de hacer cambios.`
        : `Your page has been live for only ${days === 0 ? 'less than a day' : `${days} day${days > 1 ? 's' : ''}`}. Give it at least 3 days of steady traffic before making changes.`,
      actionLabel: es ? 'Copiar link' : 'Copy link',
      actionType: 'share_link',
    })
    return signals
  }

  // --- Good conversion ---
  if (ctr >= 0.05 && totalViews >= 30) {
    signals.push({
      severity: 'success',
      title: es ? 'Buena intención de compra' : 'Strong buy intent',
      body: es
        ? `El ${(ctr * 100).toFixed(1)}% de tus visitantes hace click en Comprar — eso está por encima del promedio del sector (1–3%). Es momento de escalar el tráfico.`
        : `${(ctr * 100).toFixed(1)}% of your visitors click Buy — that's above the industry average (1–3%). Time to scale your traffic.`,
      actionLabel: es ? 'Copiar link' : 'Copy link',
      actionType: 'share_link',
    })
    return signals
  }

  // --- Critical: very low CTR with enough data ---
  if (ctr < 0.01 && totalViews >= 50 && days >= 3) {
    if (days >= 5 && totalViews >= 100) {
      signals.push({
        severity: 'critical',
        title: es ? 'Considera cambiar de producto' : 'Consider changing the product',
        body: es
          ? `Con ${totalViews} visitas en ${days} días y casi nadie comprando, puede ser que el producto no tenga suficiente demanda. Intenta con otro producto o ajusta el precio radicalmente.`
          : `With ${totalViews} visits over ${days} days and almost no one buying, the product may lack demand. Try a different product or drastically adjust the price.`,
        actionLabel: es ? 'Crear nueva página de venta' : 'Create new sales page',
        actionType: 'change_product',
      })
    } else {
      signals.push({
        severity: 'critical',
        title: es ? 'Intención de compra muy baja' : 'Very low buy intent',
        body: es
          ? `${totalViews} personas vieron tu página pero solo ${buyIntentClicks} hizo click en Comprar. El problema puede ser el precio, la confianza o el producto mismo. Genera una nueva versión optimizada.`
          : `${totalViews} people saw your page but only ${buyIntentClicks} clicked Buy. The issue could be price, trust, or the product itself. Generate an optimized new version.`,
        actionLabel: es ? 'Generar nueva versión con IA' : 'Generate new version with AI',
        actionType: 'new_version',
      })
    }
  }

  // --- Warning: moderate CTR ---
  if (ctr >= 0.01 && ctr < 0.03 && totalViews >= 30) {
    signals.push({
      severity: 'warning',
      title: es ? 'Hay interés pero algo frena la decisión' : "There's interest but something stops the purchase",
      body: es
        ? `El ${(ctr * 100).toFixed(1)}% de tus visitantes hace click en Comprar — hay interés, pero se quedan a mitad de camino. Prueba agregar urgencia, testimonios o una garantía visible.`
        : `${(ctr * 100).toFixed(1)}% of visitors click Buy — there's interest, but they're not following through. Try adding urgency, testimonials, or a visible guarantee.`,
      actionLabel: es ? 'Editar página' : 'Edit page',
      actionType: 'edit_content',
    })
  }

  // --- Bounce: visitors leave too fast ---
  if (avgTimeOnPage < 10 && totalViews >= 30) {
    signals.push({
      severity: 'warning',
      title: es ? 'Los visitantes se van muy rápido' : 'Visitors leave too quickly',
      body: es
        ? 'El tiempo promedio en tu página es menor a 10 segundos. Tu imagen principal o headline no está enganchando. Cambia la foto del producto o la primera frase.'
        : "Average time on page is under 10 seconds. Your hero image or headline isn't grabbing attention. Try changing the product photo or the opening line.",
      actionLabel: es ? 'Editar headline e imagen' : 'Edit headline & image',
      actionType: 'edit_content',
    })
  }

  // --- Benefits ignored ---
  if (benefitsClicks === 0 && totalViews >= 50) {
    signals.push({
      severity: 'warning',
      title: es ? 'Nadie lee tus beneficios' : 'Nobody reads your benefits',
      body: es
        ? 'La sección de beneficios no está recibiendo ninguna interacción. Puede estar muy abajo en la página o ser muy larga. Acórtalos o súbelos antes del precio.'
        : "Your benefits section isn't getting any interaction. It might be too far down or too long. Shorten it or move it above the price.",
      actionLabel: es ? 'Editar beneficios' : 'Edit benefits',
      actionType: 'edit_content',
    })
  }

  // --- Page aging with no improvement ---
  if (days >= 7 && ctr < 0.02 && totalViews >= 30) {
    signals.push({
      severity: 'critical',
      title: es ? 'Esta página lleva 7+ días sin convertir bien' : 'This page has been underperforming for 7+ days',
      body: es
        ? `Llevas ${days} días con una tasa de conversión del ${(ctr * 100).toFixed(1)}%. Es momento de probar algo diferente — genera una nueva versión con IA para ver si mejora.`
        : `You've had a ${(ctr * 100).toFixed(1)}% conversion rate for ${days} days. Time to try something different — generate a new AI version to see if it performs better.`,
      actionLabel: es ? 'Generar nueva versión con IA' : 'Generate new version with AI',
      actionType: 'new_version',
    })
  }

  // Deduplicate: if we already have a "change_product" critical, remove "7+ days" critical
  const hasCriticalChangeProduct = signals.some(
    (s) => s.actionType === 'change_product' && s.severity === 'critical'
  )
  return hasCriticalChangeProduct
    ? signals.filter((s) => s.actionType !== 'new_version' || s.severity !== 'critical')
    : signals
}
