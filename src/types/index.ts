export interface Proposal {
  id: string
  title: string
  description?: string
  type: 'service' | 'product'
  tenantId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Version {
  id: string
  proposalId: string
  version: number
  content: any // JSON
  isPublished: boolean
  publicUrl?: string
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