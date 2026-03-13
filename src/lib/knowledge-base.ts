import { ScrapedData, BusinessProfile } from '@/types'

export function buildBusinessProfile(scraped: ScrapedData): BusinessProfile {
  // Extract business name from title
  const businessName = (scraped.title || '').split('|')[0].trim() || 'Business'

  // Extract services from headings and body text
  const services = extractServices(scraped)

  // Extract unique selling points and service areas
  const uniqueSellingPoints = extractUniqueSellingPoints(scraped)
  const serviceAreas = extractServiceAreas(scraped)

  // Build the knowledge base
  const profile: BusinessProfile = {
    businessName,
    services,
    contactPhone: scraped.contactPhone,
    contactEmail: scraped.contactEmail,
    address: scraped.address,
    description: scraped.description || generateDescription(scraped),
    faq: generateFAQ(scraped),
    serviceAreas,
    uniqueSellingPoints,
    officeHours: extractOfficeHours(scraped.bodyText),
  }

  return profile
}

function extractServices(scraped: ScrapedData): string[] {
  const services = new Set<string>()

  // Look for common service indicators in headings
  const serviceKeywords = [
    'service',
    'solution',
    'product',
    'offer',
    'feature',
    'benefit',
  ]

  scraped.headings.forEach(heading => {
    const lower = heading.toLowerCase()
    if (serviceKeywords.some(kw => lower.includes(kw))) {
      services.add(heading)
    }
  })

  // If no explicit services found, use general headings
  if (services.size === 0) {
    scraped.headings.slice(0, 3).forEach(h => services.add(h))
  }

  // Fallback
  if (services.size === 0) {
    services.add('Professional Services')
  }

  return Array.from(services)
}

function generateDescription(scraped: ScrapedData): string {
  if (scraped.description) return scraped.description

  // Generate from body text
  const sentences = scraped.bodyText.split(/[.!?]+/).filter(s => s.trim().length > 20)
  return sentences.slice(0, 2).join('. ').trim() || 'Service provider'
}

function generateFAQ(scraped: ScrapedData): { question: string; answer: string }[] {
  // Common questions to answer from scraped data
  const faq = []

  if (scraped.contactEmail || scraped.contactPhone) {
    faq.push({
      question: 'How do I contact you?',
      answer: [
        scraped.contactEmail && `Email: ${scraped.contactEmail}`,
        scraped.contactPhone && `Phone: ${scraped.contactPhone}`,
      ]
        .filter(Boolean)
        .join(' | '),
    })
  }

  if (scraped.address) {
    faq.push({
      question: 'What is your location?',
      answer: scraped.address,
    })
  }

  if (scraped.headings.length > 0) {
    faq.push({
      question: 'What services do you provide?',
      answer: scraped.headings.slice(0, 3).join(', '),
    })
  }

  faq.push({
    question: 'How can I schedule a demo?',
    answer: 'Click the demo link in your personalized email to schedule a meeting.',
  })

  return faq
}

function extractUniqueSellingPoints(scraped: ScrapedData): string[] {
  const usp = new Set<string>()

  // Look for common USP indicators in headings
  const uspKeywords = [
    'custom',
    'specialized',
    'unique',
    'award',
    'certified',
    'licensed',
    'expert',
    'professional',
    'trusted',
  ]

  scraped.headings.forEach(heading => {
    const lower = heading.toLowerCase()
    if (uspKeywords.some(kw => lower.includes(kw))) {
      usp.add(heading)
    }
  })

  // If none found, extract from body text
  if (usp.size === 0) {
    const sentences = scraped.bodyText.split(/[.!?]+/).filter(s => s.trim().length > 30)
    sentences.slice(0, 2).forEach(s => usp.add(s.trim()))
  }

  return Array.from(usp)
}

function extractServiceAreas(scraped: ScrapedData): string[] {
  const areas = new Set<string>()

  // Look for location/area indicators
  const areaKeywords = [
    'service area',
    'service',
    'serve',
    'available',
    'location',
    'area',
    'region',
  ]

  scraped.headings.forEach(heading => {
    const lower = heading.toLowerCase()
    if (areaKeywords.some(kw => lower.includes(kw))) {
      areas.add(heading)
    }
  })

  // Extract geographic names from body (simplified)
  const geoPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
  const matches = scraped.bodyText.match(geoPattern) || []
  matches.slice(0, 3).forEach(m => {
    if (m.length > 3) areas.add(m)
  })

  return Array.from(areas)
}

function extractOfficeHours(bodyText: string): string | undefined {
  // Look for common office hour patterns
  const hourPattern =
    /(?:hours?|open|operating)[\s:]*([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm|AM|PM)?.*?(?:to|-|–|\–).*?[0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm|AM|PM)?)/i
  const match = bodyText.match(hourPattern)
  return match ? match[1].trim() : undefined
}
