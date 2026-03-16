import { load } from 'cheerio'
import { ScrapedData } from '@/types'

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
const phoneRegex = /\+?1?\s*\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})/g

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
}

async function fetchUrl(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

async function extractPropertyLinks(baseUrl: string, html: string): Promise<string[]> {
  const $ = load(html)
  const baseUrlObj = new URL(baseUrl)
  const links = new Set<string>()

  // Look for common property/cabin/listing page links
  const selectors = [
    'a[href*="/property"]',
    'a[href*="/cabin"]',
    'a[href*="/listing"]',
    'a[href*="/room"]',
    'a[href*="/vacation"]',
    'a[href*="/rental"]',
    'a[href*="/details"]',
    'a[href*="/unit"]',
    'a[href*="/accommodation"]',
    'a[href*="/reserve"]',
    'a[href*="/book"]',
  ]

  selectors.forEach(selector => {
    $(selector).each((_, elem) => {
      const href = $(elem).attr('href')
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href
          // Only follow same-domain links
          if (new URL(absoluteUrl).hostname === baseUrlObj.hostname) {
            links.add(absoluteUrl)
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    })
  })

  // Also look for links with property-related keywords in text
  $('a').each((_, elem) => {
    const text = $(elem).text().toLowerCase()
    const href = $(elem).attr('href')

    if (href && (text.includes('cabin') || text.includes('property') || text.includes('cottage') ||
        text.includes('room') || text.includes('suite') || text.includes('unit') ||
        text.match(/\d+\s*(bed|br)/i))) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href
        if (new URL(absoluteUrl).hostname === baseUrlObj.hostname) {
          links.add(absoluteUrl)
        }
      } catch (e) {
        // Skip
      }
    }
  })

  // Remove duplicates and limit to first 8 property pages
  return Array.from(links).slice(0, 8)
}

async function scrapePropertyDetails(url: string): Promise<string> {
  try {
    const html = await fetchUrl(url)
    const $ = load(html)

    // Extract property details
    const details: string[] = []

    // Property name - multiple selectors
    const name = $('h1').first().text().trim() ||
                 $('[class*="property-name"]').first().text().trim() ||
                 $('[class*="title"]').first().text().trim() ||
                 $('title').text().split('|')[0].trim()
    if (name && name.length > 3) details.push(`Property: ${name}`)

    // All body text for mining
    const bodyText = $('body').text()

    // Extract all text content for detailed info
    const fullContent = $.text().slice(0, 3000)

    // Bedrooms, bathrooms
    const bedMatch = fullContent.match(/(\d+)\s*(?:bed|br|bedroom)/gi)
    const bathMatch = fullContent.match(/(\d+)\s*(?:bath|bathroom)/gi)
    const sleepsMatch = fullContent.match(/(?:sleeps?|accommodates?)\s*(\d+)/gi)

    if (bedMatch) details.push(`Bedrooms: ${bedMatch.join(', ')}`)
    if (bathMatch) details.push(`Bathrooms: ${bathMatch.join(', ')}`)
    if (sleepsMatch) details.push(`Capacity: ${sleepsMatch.join(', ')}`)

    // Amenities - multiple strategies
    const amenities = new Set<string>()

    // Strategy 1: List items under amenities sections
    $('[class*="amenities"] li, [class*="features"] li, [class*="amenity"]').each((_, elem) => {
      const text = $(elem).text().trim()
      if (text && text.length > 2 && text.length < 100) amenities.add(text)
    })

    // Strategy 2: Look for checkmarks or feature indicators
    $('[class*="feature"], [class*="perk"], [class*="include"]').each((_, elem) => {
      const text = $(elem).text().trim()
      if (text && text.length > 2 && text.length < 100) amenities.add(text)
    })

    // Strategy 3: Extract from paragraphs mentioning "includes" or "features"
    $('p').each((_, elem) => {
      const text = $(elem).text()
      if (text.toLowerCase().includes('include') || text.toLowerCase().includes('feature')) {
        const items = text.split(/[,;]/).filter(item => item.length > 3 && item.length < 100)
        items.forEach(item => amenities.add(item.trim()))
      }
    })

    if (amenities.size > 0) {
      const amenitiesList = Array.from(amenities).slice(0, 10).join(', ')
      details.push(`Amenities: ${amenitiesList}`)
    }

    // Price info - be thorough
    const prices = new Set<string>()
    const priceMatch = bodyText.match(/\$\d+(?:,\d{3})?(?:\.\d{2})?(?:\s*(?:per|\/|\||night|week|month))?/g)
    if (priceMatch) {
      priceMatch.slice(0, 5).forEach(p => prices.add(p))
    }
    if (prices.size > 0) details.push(`Pricing: ${Array.from(prices).join(', ')}`)

    // Description - get longer content
    const desc = $('[class*="description"]').first().text().trim() ||
                 $('main p').first().text().trim() ||
                 $('article p').first().text().trim()
    if (desc && desc.length > 20) {
      details.push(`Description: ${desc.slice(0, 300)}...`)
    }

    // Extract any section headers and their content
    $('h2, h3').each((_, elem) => {
      const heading = $(elem).text().trim()
      const content = $(elem).next('p, ul').text().trim().slice(0, 200)
      if (heading && content && heading.length < 50) {
        details.push(`${heading}: ${content}`)
      }
    })

    return details.join('\n')
  } catch (error) {
    console.log(`⚠️ Could not scrape ${url}:`, error instanceof Error ? error.message : 'Unknown error')
    return ''
  }
}

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
        headers: BROWSER_HEADERS,
        signal: controller.signal,
        redirect: 'follow',
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
      console.error(`❌ Fetch error for ${fullUrl}: ${errorMsg}`)
      // Return minimal data instead of throwing — let demo still be created
      const domain = new URL(fullUrl).hostname.replace('www.', '')
      return {
        title: domain,
        description: '',
        headings: [],
        contactPhone: undefined,
        contactEmail: undefined,
        address: undefined,
        bodyText: `Business website: ${fullUrl}`,
      }
    }

    clearTimeout(timeoutId)

    console.log(`📊 Got response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} for ${fullUrl}`)
      const domain = new URL(fullUrl).hostname.replace('www.', '')
      return {
        title: domain,
        description: '',
        headings: [],
        contactPhone: undefined,
        contactEmail: undefined,
        address: undefined,
        bodyText: `Business website: ${fullUrl}`,
      }
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

    // Extract and scrape property pages for more detailed info
    console.log('🔗 Looking for property pages to scrape...')
    let propertyDetails = ''
    try {
      const propertyLinks = await extractPropertyLinks(fullUrl, html)
      console.log(`📄 Found ${propertyLinks.length} property pages`)

      if (propertyLinks.length > 0) {
        console.log('🔍 Scraping property details...')
        const propertyData: string[] = []

        // Scrape up to 5 property pages for details
        for (const link of propertyLinks.slice(0, 5)) {
          console.log(`  Scraping: ${link}`)
          const details = await scrapePropertyDetails(link)
          if (details) propertyData.push(details)
        }

        propertyDetails = propertyData.join('\n---\n')
      }
    } catch (error) {
      console.log('⚠️ Property scraping failed, continuing with main page data')
    }

    return {
      title,
      description,
      headings,
      contactPhone,
      contactEmail,
      address,
      bodyText: `${bodyText}\n\n## PROPERTY DETAILS ##\n${propertyDetails}`,
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(`❌ Scrape error: ${errMsg}`)
    throw new Error(errMsg)
  }
}
