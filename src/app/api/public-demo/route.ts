import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { scrapeWebsite } from '@/lib/scraper'
import { buildBusinessProfile } from '@/lib/knowledge-base'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`

    // Scrape the website
    console.log(`🌐 Public demo scrape: ${fullUrl}`)
    const scrapedData = await scrapeWebsite(fullUrl)
    const businessProfile = buildBusinessProfile(scrapedData)
    console.log(`✅ Business profile built: ${businessProfile.businessName}`)

    // Use secret key to bypass RLS for public demo inserts
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        url: fullUrl,
        business_name: businessProfile.businessName,
        business_profile: businessProfile,
        status: 'scraped',
        prospect_email: null,
      })
      .select('demo_token, business_name')
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save demo' }, { status: 500 })
    }

    console.log(`✅ Public demo created: ${lead.demo_token}`)
    return NextResponse.json({
      demoToken: lead.demo_token,
      businessName: lead.business_name,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Public demo error:', errorMessage)
    return NextResponse.json({ error: `Failed to create demo: ${errorMessage}` }, { status: 500 })
  }
}
