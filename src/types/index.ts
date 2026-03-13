export type LeadStatus = 'new_lead' | 'scraped' | 'demo_sent' | 'demo_opened'

export interface BusinessProfile {
  businessName: string
  services: string[]
  contactPhone?: string
  contactEmail?: string
  address?: string
  description?: string
  faq?: { question: string; answer: string }[]
  serviceAreas?: string[]
  uniqueSellingPoints?: string[]
  officeHours?: string
  websiteUrl?: string
}

export interface Lead {
  id: string
  user_id: string
  url: string
  business_name?: string
  business_profile?: BusinessProfile
  status: LeadStatus
  prospect_email?: string
  demo_token: string
  created_at: string
  updated_at: string
}

export interface ScrapedData {
  title?: string
  description?: string
  headings: string[]
  contactPhone?: string
  contactEmail?: string
  address?: string
  bodyText: string
}
