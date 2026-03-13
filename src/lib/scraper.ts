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
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    console.log(`📡 Fetching ${fullUrl} with timeout 15s`)

    let response
    try {
      response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
      console.error(`❌ Fetch error for ${fullUrl}: ${errorMsg}`)
      throw new Error(`Network error: ${errorMsg}. Website may be blocking requests or unreachable.`)
    }

    clearTimeout(timeoutId)

    console.log(`📊 Got response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`❌ Scrape error: ${errMsg}`)
    throw new Error(errMsg)
  }
}
