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

export async function generateProposalContent(brief: string): Promise<ProposalContent> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
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
    console.error('Error generating proposal content:', error)
    throw error
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