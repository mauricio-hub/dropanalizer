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
  const useAI = process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'production'

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

const DROPSHIPPING_GENERATION_PROMPT = (productName: string, template: 'producto_nuevo' | 'oferta_limitada', description?: string) => {
  const templateContext = template === 'oferta_limitada'
    ? 'Este es un producto con oferta limitada, descuento o urgencia. El énfasis debe ser en la escasez, el descuento y la urgencia.'
    : 'Este es un producto nuevo que el usuario está validando. El énfasis debe ser en la novedad, el descubrimiento y resolución de un problema.'

  return `
Tu tarea es crear un landing page convincente y orientado a conversión para un producto e-commerce.

PRODUCTO: ${productName}
${description ? `DESCRIPCIÓN/CONTEXTO: ${description}` : ''}
TIPO: ${templateContext}

Debes generar un JSON válido con esta estructura (sin markdown, solo JSON):
{
  "headline": "Headline único y compelling que capture atención en 1-2 segundos. Máximo 10 palabras. Beneficio claro.",
  "benefits": ["Beneficio 1 específico y tangible", "Beneficio 2", "Beneficio 3", "Beneficio 4", "Beneficio 5"],
  "socialProof": "Párrafo estilo testimonial (2-3 frases). Ej: 'Miles de clientes ya confían en nosotros. Generamos +$2M en ventas para nuestros usuarios en el último año. El 94% recomendaría este producto.'",
  "faq": [
    {"question": "¿Cuánto tiempo tarda en llegar?", "answer": "Respuesta específica y clara"},
    {"question": "¿Tiene garantía?", "answer": "Respuesta específica y clara"},
    {"question": "¿Es seguro comprar aquí?", "answer": "Respuesta específica y clara"}
  ],
  "urgency": "Solo si template es oferta_limitada. Texto que comunique escasez o urgencia. Ej: 'Solo quedan 12 unidades disponibles a este precio' o 'Esta oferta válida por 48 horas'."
}

REGLAS OBLIGATORIAS:
- Headline debe ser impactante, no genérico
- Benefits deben ser específicos al producto, no características genéricas
- Social proof debe sonar real y mostrar números/evidencia
- FAQ debe responder objeciones reales de compra
- Para "producto_nuevo": enfatiza novedad, descubrimiento, oportunidad
- Para "oferta_limitada": enfatiza escasez, descuento, tiempo limitado
- Urgency debe ser convincente pero creíble (sin mentiras)
- Retorna SOLO el JSON válido, sin explicaciones extra
`
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
  originalPrice?: number
): Promise<DropshippingContent> {
  const useAI = process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'production'

  if (!useAI) {
    console.log('Using mock dropshipping generator (set ANTHROPIC_API_KEY for real AI)')
    const mock = generateMockDropshipping(productName, template)
    return {
      ...mock,
      pricing: { price, currency, originalPrice },
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: DROPSHIPPING_GENERATION_PROMPT(productName, template, description),
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