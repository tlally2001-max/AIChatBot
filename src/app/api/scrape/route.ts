import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeWebsite } from '@/lib/scraper'
import { buildBusinessProfile } from '@/lib/knowledge-base'
import { sendDemoEmail } from '@/lib/email'
import { triggerDemoEmailAfterScrape } from '@/lib/email-automation'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Scrape API called')

    const supabase = await createClient()
    console.log('✅ Supabase client created')

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('❌ User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`✅ User authenticated: ${user.id}`)

    const { url, prospectEmail } = await request.json()
    console.log(`📝 Request: url=${url}, email=${prospectEmail}`)

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Scrape the website
    console.log(`🌐 Starting scrape of ${url}`)
    const scrapedData = await scrapeWebsite(url)
    console.log(`✅ Scrape completed`, { headings: scrapedData.headings.length })

    // Build business profile
    console.log(`📊 Building business profile`)
    const businessProfile = buildBusinessProfile(scrapedData)
    console.log(`✅ Business profile built: ${businessProfile.businessName}`)

    // Create lead in database
    console.log(`💾 Inserting lead into database`)
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
      console.error('❌ Database error:', dbError)
      return NextResponse.json({ error: `Failed to save lead: ${dbError.message}` }, { status: 500 })
    }
    console.log(`✅ Lead created: ${lead.id}`)

    // Send email if prospect email provided
    if (prospectEmail && lead) {
      try {
        console.log(`📧 Sending email to ${prospectEmail}`)
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
          console.log(`✅ Email sent: ${emailResult.emailId}`)
          // Update lead status to demo_sent
          await supabase
            .from('leads')
            .update({
              status: 'demo_sent',
              updated_at: new Date().toISOString(),
            })
            .eq('id', lead.id)

          lead.status = 'demo_sent'
        } else {
          console.warn(`⚠️ Email not sent: ${emailResult.error}`)
        }
      } catch (emailError) {
        console.error('❌ Email send failed:', emailError)
        // Don't fail the request, just note it in logs
      }
    }

    console.log(`✅ Scrape API completed successfully`)
    return NextResponse.json(lead)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Scrape error:', errorMessage, error)
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    )
  }
}
