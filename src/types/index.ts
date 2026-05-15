export interface TimelinePhase {
  phase: string
  duration: string
  description: string
}

export interface ProposalPricing {
  total: number
  currency: string
  breakdown?: string
}

export interface ProposalContent {
  contentType?: 'proposal'
  scope: string
  deliverables: string[]
  timeline: TimelinePhase[]
  pricing: ProposalPricing
}

export interface DropshippingPricing {
  price: number
  currency: string
  originalPrice?: number
}

export interface FaqItem {
  question: string
  answer: string
}

export interface DropshippingContent {
  contentType: 'dropshipping'
  headline: string
  benefits: string[]
  socialProof: string
  faq: FaqItem[]
  urgency?: string
  pricing: DropshippingPricing
  lang?: 'es' | 'en'
}

export interface Image {
  id: string
  proposalId: string
  url: string
  publicId: string
  order: number
  createdAt: Date
}

export interface Proposal {
  id: string
  title: string
  description?: string
  type: 'service' | 'product'
  template: 'producto_nuevo' | 'oferta_limitada'
  status: 'draft' | 'published'
  tenantId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  images?: Image[]
}

export interface Version {
  id: string
  proposalId: string
  version: number
  content: ProposalContent | DropshippingContent
  isPublished: boolean
  publicUrl?: string
  generatedAt?: Date
  createdAt: Date
}

export interface Event {
  id: string
  versionId: string
  type: string
  data: any
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  price?: number
  userId: string
  createdAt: Date
  updatedAt: Date
}