import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import type { DropshippingContent, FaqItem } from '@/types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ProposalContent {
  scope: string
  deliverables: string[]
  timeline: TimelinePhase[]
  pricing: {
    total: number
    currency: string
    breakdown?: string
  }
}

interface TimelinePhase {
  phase: string
  duration: string
  description: string
}

const PROPOSAL_GENERATION_PROMPT = (brief: string, catalogContext?: string, catalogPrices?: { name: string; price: number }[]) => {
  const servicesSelected = catalogPrices && catalogPrices.length > 0
    ? `SERVICIOS/PRODUCTOS SELECCIONADOS (que se incluirán en la propuesta):\n${catalogPrices.map(p => `- ${p.name}: $${p.price}`).join('\n')}`
    : ''

  const priceInfo = catalogPrices
    ? `Precio total exacto: $${catalogPrices.reduce((sum, p) => sum + p.price, 0)}\nDesglose:\n${catalogPrices.map(p => `- ${p.name}: $${p.price}`).join('\n')}`
    : 'No hay precios fijos del catálogo'

  return `
Tu tarea es crear una propuesta profesional ESPECÍFICA y CONCRETA basada en los servicios/productos que el usuario va a ofrecer.

BRIEF DEL CLIENTE:
${brief}

${servicesSelected}

INSTRUCCIONES CRÍTICAS:
1. El scope DEBE ser específico al servicio/producto seleccionado. No ser vago.
2. Los deliverables DEBEN ser concretos y específicos al servicio/producto, no genéricos.
3. Las fases del timeline DEBEN reflejar el trabajo real para ese servicio específico.
4. Los precios son EXACTOS y NO pueden ser alterados.

Debes retornar un JSON válido con esta estructura (sin markdown, sin explicaciones):
{
  "scope": "Descripción ESPECÍFICA y CONCRETA del proyecto (2-3 párrafos). Menciona exactamente qué servicios/productos se entregarán y por qué son necesarios.",
  "deliverables": ["Deliverable concreto 1", "Deliverable concreto 2", "Deliverable concreto 3", "Deliverable concreto 4"],
  "timeline": [
    {
      "phase": "Nombre específico de la fase",
      "duration": "Duración realista",
      "description": "Qué se hace exactamente en esta fase relacionado al servicio"
    }
  ],
  "pricing": {
    "total": NUMERO_EXACTO,
    "currency": "USD",
    "breakdown": "Desglose exacto: ${catalogPrices?.map(p => `${p.name}: $${p.price}`).join(', ') || 'N/A'}"
  }
}

Reglas obligatorias:
- El scope debe mencionar explícitamente los servicios seleccionados
- Los deliverables deben ser específicos y medibles para el servicio elegido
- Al menos 2 fases de timeline, cada una con descripción concreta del trabajo
- Los precios son EXACTOS del catálogo - cópialos sin modificar
- El breakdown debe listar cada servicio con su precio exacto
- Retorna SOLO el JSON válido, sin explicaciones
`
}

// Mock generator for testing when API models are not available
function generateMockProposal(brief: string): ProposalContent {
  const isPlumbing = brief.toLowerCase().includes('plomería') || brief.toLowerCase().includes('plomeria')

  if (isPlumbing) {
    return {
      scope: 'Se desarrollará una página web profesional para servicios de plomería que permita a los clientes conocer los servicios disponibles, ver precios actualizados y contactar directamente. La plataforma incluirá información de ubicación, teléfono de contacto y formulario de solicitud de presupuesto.',
      deliverables: [
        'Sitio web responsive (móvil, tablet, desktop)',
        'Catálogo de servicios con descripciones y precios',
        'Formulario de contacto y solicitud de presupuesto',
        'Mapa interactivo con ubicación',
        'Integración de WhatsApp Business',
      ],
      timeline: [
        {
          phase: 'Diseño y planificación',
          duration: '1 semana',
          description: 'Diseño de wireframes, mockups y estructura del sitio'
        },
        {
          phase: 'Desarrollo frontend',
          duration: '2 semanas',
          description: 'Construcción del HTML, CSS y componentes interactivos'
        },
        {
          phase: 'Integración y testing',
          duration: '1 semana',
          description: 'Pruebas de funcionalidad, optimización y lanzamiento'
        }
      ],
      pricing: {
        total: 2500,
        currency: 'USD',
        breakdown: 'Diseño: $800, Desarrollo: $1400, Integración y deploy: $300'
      }
    }
  }

  return {
    scope: 'Proyecto web profesional con estructura moderna y responsiva. Incluye diseño completo, funcionalidades interactivas y optimización para motores de búsqueda.',
    deliverables: [
      'Sitio web responsive',
      'Diseño profesional y moderno',
      'SEO básico implementado',
      'Formularios de contacto',
      'Integración de redes sociales'
    ],
    timeline: [
      {
        phase: 'Fase 1: Diseño',
        duration: '1-2 semanas',
        description: 'Creación de wireframes y diseño visual'
      },
      {
        phase: 'Fase 2: Desarrollo',
        duration: '2-3 semanas',
        description: 'Codificación y desarrollo del sitio'
      },
      {
        phase: 'Fase 3: Lanzamiento',
        duration: '1 semana',
        description: 'Testing, optimización y deploy'
      }
    ],
    pricing: {
      total: 3000,
      currency: 'USD',
      breakdown: 'Diseño UX/UI: $1000, Desarrollo: $1500, Mantenimiento inicial: $500'
    }
  }
}

async function getCatalogContext(userId: string): Promise<string | undefined> {
  try {
    const items = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (items.length === 0) return undefined

    const catalogText = items
      .map((item) => {
        const type = item.type === 'service' ? 'Servicio' : 'Producto'
        const price = item.price ? ` - Precio: $${item.price}` : ''
        const desc = item.description ? ` - ${item.description}` : ''
        return `- ${item.name} (${type})${price}${desc}`
      })
      .join('\n')

    return catalogText
  } catch (error) {
    console.error('Failed to fetch catalog context:', error)
    return undefined
  }
}

export async function generateProposalContent(brief: string, userId?: string, catalogPrices?: { name: string; price: number }[]): Promise<ProposalContent> {
  const useAI = !!process.env.ANTHROPIC_API_KEY

  // Fetch catalog context if userId provided
  let catalogContext: string | undefined
  if (userId) {
    catalogContext = await getCatalogContext(userId)
  }

  // Use mock in development or if no API key
  if (!useAI) {
    console.log('Using mock proposal generator (set ANTHROPIC_API_KEY for real AI)')
    return generateMockProposal(brief)
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: PROPOSAL_GENERATION_PROMPT(brief, catalogContext, catalogPrices),
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const jsonStr = content.text.trim()
    const parsed = JSON.parse(jsonStr) as ProposalContent

    validateProposalContent(parsed)

    return parsed
  } catch (error) {
    console.error('Error generating proposal content with AI, falling back to mock:', error)
    // Fallback to mock if API fails
    return generateMockProposal(brief)
  }
}

function validateProposalContent(content: any): asserts content is ProposalContent {
  if (!content.scope || typeof content.scope !== 'string') {
    throw new Error('Invalid scope: must be a non-empty string')
  }

  if (!Array.isArray(content.deliverables) || content.deliverables.length < 1) {
    throw new Error('Invalid deliverables: must be an array with at least 1 item')
  }

  if (!Array.isArray(content.timeline) || content.timeline.length < 1) {
    throw new Error('Invalid timeline: must be an array with at least 1 phase')
  }

  if (!content.pricing || typeof content.pricing.total !== 'number' || content.pricing.total < 0) {
    throw new Error('Invalid pricing: total must be a non-negative number')
  }

  if (!content.pricing.currency || typeof content.pricing.currency !== 'string') {
    throw new Error('Invalid pricing: currency must be a string')
  }
}

const DROPSHIPPING_GENERATION_PROMPT = (
  productName: string,
  template: 'producto_nuevo' | 'oferta_limitada',
  audienceLang: 'es' | 'en',
  description?: string
) => {
  const isLimitedOffer = template === 'oferta_limitada'
  const isSpanish = audienceLang === 'es'

  const langInstruction = isSpanish
    ? 'IDIOMA: Todo el contenido debe estar en ESPAÑOL LATINOAMERICANO. Lenguaje coloquial, cercano, no formal.'
    : 'LANGUAGE: All content must be in ENGLISH. Use casual, direct, conversion-focused language.'

  const headlineGuide = isLimitedOffer
    ? (isSpanish ? 'Titular de urgencia en español: máximo 8 palabras. Escasez o descuento claro.' : 'Urgency headline in English: max 8 words. Scarcity or discount.')
    : (isSpanish ? 'Titular de deseo en español: máximo 8 palabras. Promesa clara del beneficio.' : 'Desire headline in English: max 8 words. Clear benefit promise.')

  return `You are an expert e-commerce copywriter. Generate high-converting landing page content for a dropshipping product.

PRODUCT: "${productName}"
${description ? `SELLER DESCRIPTION: ${description}` : ''}
CAMPAIGN TYPE: ${isLimitedOffer ? 'LIMITED OFFER (urgency, scarcity, discount)' : 'PRODUCT LAUNCH (novelty, solution, discovery)'}
${langInstruction}

Generate a valid JSON (no markdown) with this exact structure:
{
  "headline": "${headlineGuide}",
  "benefits": [
    "Benefit 1: ultra-specific to ${productName}, not generic",
    "Benefit 2: solves a real buyer pain point",
    "Benefit 3: differentiator vs competition",
    "Benefit 4: focused on end result",
    "Benefit 5: eliminates a common objection"
  ],
  "socialProof": "Social proof text with believable invented numbers. E.g. (in the chosen language): '3,400+ people already own it. 91% recommended it to a friend. 4.8/5 stars across 800+ reviews.'",
  "faq": [
    {"question": "Question about shipping/delivery time specific to this product", "answer": "Concrete reassuring answer"},
    {"question": "Question about quality or how it works", "answer": "Answer that removes doubt"},
    {"question": "Question about guarantee or returns", "answer": "Answer with clear policy"},
    {"question": "Question about how to use it or compatibility", "answer": "Answer that gives confidence"}
  ]${isLimitedOffer ? `,
  "urgency": "Credible scarcity/urgency phrase in the chosen language. E.g.: 'Only 15 units left at this price.'"` : ''}
}

CRITICAL RULES:
- EVERY field must be written in ${isSpanish ? 'SPANISH' : 'ENGLISH'} — no mixing languages
- The headline MUST reference the product "${productName}"
- Benefits must be specific to "${productName}", not about generic shipping
- Social proof must sound real with concrete numbers
- FAQs must be REAL objections a buyer would have about "${productName}"
- Return ONLY the JSON, no extra text`
}

function generateMockDropshipping(productName: string, template: 'producto_nuevo' | 'oferta_limitada'): DropshippingContent {
  const mockHeadlines = {
    producto_nuevo: '🚀 La solución que esperabas',
    oferta_limitada: '⚡ Último chance: 50% off hoy',
  }

  const mockBenefits = [
    'Entrega rápida y segura en 48-72 horas',
    'Garantía de devolución en 30 días',
    'Atención al cliente 24/7',
    'Pago seguro con múltiples métodos',
    'Envío gratis a partir de $50',
  ]

  const mockFaq: FaqItem[] = [
    {
      question: '¿Cuánto tarda el envío?',
      answer: 'El envío tarda entre 48 a 72 horas hábiles. En algunos casos puede ser más rápido.',
    },
    {
      question: '¿Hay devolución?',
      answer: 'Sí, puedes devolver el producto en 30 días si no estás satisfecho.',
    },
    {
      question: '¿Es seguro comprar?',
      answer: 'Completamente seguro. Usamos encriptación SSL y procesamos pagos con proveedores certificados.',
    },
  ]

  const urgency = template === 'oferta_limitada'
    ? 'Solo quedan 8 unidades a este precio. Esta oferta vence en 24 horas.'
    : undefined

  return {
    contentType: 'dropshipping',
    headline: mockHeadlines[template],
    benefits: mockBenefits,
    socialProof: 'Miles de clientes satisfechos. +95% recomendaría este producto. Más de 10,000 compras realizadas.',
    faq: mockFaq,
    urgency,
    pricing: {
      price: 99.99,
      currency: 'USD',
    },
  }
}

function validateDropshippingContent(content: any): asserts content is DropshippingContent {
  if (!content.headline || typeof content.headline !== 'string') {
    throw new Error('Invalid headline: must be a non-empty string')
  }

  if (!Array.isArray(content.benefits) || content.benefits.length < 3) {
    throw new Error('Invalid benefits: must be an array with at least 3 items')
  }

  if (!content.socialProof || typeof content.socialProof !== 'string') {
    throw new Error('Invalid socialProof: must be a non-empty string')
  }

  if (!Array.isArray(content.faq) || content.faq.length < 2) {
    throw new Error('Invalid FAQ: must be an array with at least 2 items')
  }

  for (const item of content.faq) {
    if (!item.question || !item.answer) {
      throw new Error('Invalid FAQ item: must have question and answer')
    }
  }

  if (!content.pricing || typeof content.pricing.price !== 'number' || content.pricing.price < 0) {
    throw new Error('Invalid pricing: price must be a non-negative number')
  }
}

export async function generateDropshippingContent(
  productName: string,
  price: number,
  currency: string,
  template: 'producto_nuevo' | 'oferta_limitada',
  description?: string,
  originalPrice?: number,
  audienceLang: 'es' | 'en' = 'es'
): Promise<DropshippingContent> {
  const useAI = !!process.env.ANTHROPIC_API_KEY

  if (!useAI) {
    console.log('Using mock dropshipping generator (set ANTHROPIC_API_KEY for real AI)')
    const mock = generateMockDropshipping(productName, template)
    return {
      ...mock,
      pricing: { price, currency, originalPrice },
      lang: audienceLang,
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: DROPSHIPPING_GENERATION_PROMPT(productName, template, audienceLang, description),
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const jsonStr = content.text.trim()
    const parsed = JSON.parse(jsonStr) as Omit<DropshippingContent, 'contentType' | 'pricing'>

    validateDropshippingContent({ ...parsed, contentType: 'dropshipping', pricing: { price, currency } })

    return {
      contentType: 'dropshipping',
      headline: parsed.headline,
      benefits: parsed.benefits,
      socialProof: parsed.socialProof,
      faq: parsed.faq,
      urgency: parsed.urgency,
      pricing: { price, currency, originalPrice },
      lang: audienceLang,
    }
  } catch (error) {
    console.error('Error generating dropshipping content with AI, falling back to mock:', error)
    const mock = generateMockDropshipping(productName, template)
    return {
      ...mock,
      pricing: { price, currency, originalPrice },
    }
  }
}