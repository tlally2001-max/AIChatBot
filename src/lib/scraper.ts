import { load } from 'cheerio'
import { ScrapedData } from '@/types'

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
const phoneRegex = /\+?1?\s*\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})/g

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  try {
    // Ensure URL has protocol
    let fullUrl = url.trim()
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl
    }

    // Validate URL format
    try {
      new URL(fullUrl)
    } catch (err) {
      throw new Error(`Invalid URL format: ${fullUrl}`)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = load(html)

    // Extract basic metadata
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || ''
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      ''

    // Extract headings
    const headings: string[] = []
    $('h1, h2').each((_, elem) => {
      const text = $(elem).text().trim()
      if (text) headings.push(text)
    })

    // Extract contact info
    let contactPhone: string | undefined
    let contactEmail: string | undefined

    const bodyText = $('body').text()
    const emailMatch = bodyText.match(emailRegex)
    if (emailMatch) {
      contactEmail = emailMatch[0]
    }

    const phoneMatch = bodyText.match(phoneRegex)
    if (phoneMatch) {
      contactPhone = phoneMatch[0]
    }

    // Try to extract address (common patterns)
    let address: string | undefined
    const addressPatterns = [
      $('*:contains("Address")').next().text(),
      $('[class*="address"]').text(),
      $('[id*="address"]').text(),
    ]
    address = addressPatterns.find(p => p?.length > 5)?.trim()

    return {
      title,
      description,
      headings,
      contactPhone,
      contactEmail,
      address,
      bodyText,
    }
  } catch (error) {
    console.error('Scrape error:', error)
    throw new Error(
      `Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
