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
  scope: string
  deliverables: string[]
  timeline: TimelinePhase[]
  pricing: ProposalPricing
}

export interface Proposal {
  id: string
  title: string
  description?: string
  type: 'service' | 'product'
  status: 'draft' | 'published'
  tenantId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Version {
  id: string
  proposalId: string
  version: number
  content: ProposalContent
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