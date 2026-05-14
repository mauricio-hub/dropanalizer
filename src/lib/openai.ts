import Anthropic from '@anthropic-ai/sdk'

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

const PROPOSAL_GENERATION_PROMPT = (brief: string) => `
Tu tarea es analizar el siguiente brief de propuesta y estructurarlo profesionalmente.

BRIEF:
${brief}

Debes retornar un JSON válido con esta estructura exacta (sin markdown, sin explicaciones):
{
  "scope": "Una descripción concisa del alcance del proyecto (2-3 párrafos)",
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
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

Reglas importantes:
- El JSON debe ser válido y parseable
- Sé profesional pero accesible
- Proporciona al menos 3 deliverables
- Proporciona al menos 2 fases de timeline
- El precio debe ser realista para la industria
- Currency debe ser USD, EUR, ARS u otra válida
- Retorna SOLO el JSON, sin explicaciones adicionales
`

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

export async function generateProposalContent(brief: string): Promise<ProposalContent> {
  const useAI = process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'production'

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
          content: PROPOSAL_GENERATION_PROMPT(brief),
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