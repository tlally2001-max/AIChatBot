import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeWebsite } from '@/lib/scraper'
import { buildBusinessProfile } from '@/lib/knowledge-base'
import { sendDemoEmail } from '@/lib/email'
import { triggerDemoEmailAfterScrape } from '@/lib/email-automation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, prospectEmail } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Scrape the website
    const scrapedData = await scrapeWebsite(url)

    // Build business profile
    const businessProfile = buildBusinessProfile(scrapedData)

    // Create lead in database
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        url,
        business_name: businessProfile.businessName,
        business_profile: businessProfile,
        status: 'scraped',
        prospect_email: prospectEmail || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
    }

    // Send email if prospect email provided
    if (prospectEmail && lead) {
      try {
        // Use enhanced email automation with tracking
        const emailResult = await triggerDemoEmailAfterScrape({
          clientName: businessProfile.businessName,
          businessName: businessProfile.businessName,
          businessProfile,
          prospectEmail,
          demoToken: lead.demo_token,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        })

        if (emailResult.emailSent) {
          // Update lead status to demo_sent
          await supabase
            .from('leads')
            .update({
              status: 'demo_sent',
              updated_at: new Date().toISOString(),
            })
            .eq('id', lead.id)

          lead.status = 'demo_sent'
        }
      } catch (emailError) {
        console.error('Email send failed:', emailError)
        // Don't fail the request, just note it in logs
      }
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
