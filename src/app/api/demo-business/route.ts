import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch ANY lead, regardless of business_profile status
    const { data: leads, error } = await supabase
      .from('leads')
      .select('business_profile, business_name, url')
      .limit(1)

    if (error) {
      console.error('Database error:', error)
    }

    console.log('Fetched leads:', leads)

    if (leads && leads.length > 0) {
      const lead = leads[0]
      console.log('Lead data:', JSON.stringify(lead, null, 2))

      // Try to use business_profile if available
      if (lead.business_profile && typeof lead.business_profile === 'object') {
        return NextResponse.json({
          businessName: lead.business_profile.businessName || lead.business_name || 'Your Business',
          description: lead.business_profile.description || 'Welcome to our website',
          contactPhone: lead.business_profile.contactPhone || '(555) 123-4567',
          services: lead.business_profile.services || ['Service 1', 'Service 2'],
          url: lead.url,
          source: 'database_profile',
        })
      }

      // Fall back to using the URL and business_name
      if (lead.url || lead.business_name) {
        return NextResponse.json({
          businessName: lead.business_name || new URL(lead.url).hostname || 'Your Business',
          description: 'Scrape any website to train Emma on your business',
          contactPhone: '(555) 123-4567',
          services: ['Chat Support', 'Lead Capture', 'Booking Integration'],
          url: lead.url,
          source: 'database_url',
        })
      }
    }

    // No data found - return demo
    console.log('No leads found, using default demo')
    return NextResponse.json({
      businessName: 'Demo Business',
      description: 'Add your website URL to see how Emma works',
      contactPhone: '(555) 123-4567',
      services: ['Scrape Any Website', 'Train Emma On Your Business', 'Deploy Chat Widget'],
      source: 'default',
    })
  } catch (error) {
    console.error('Demo API error:', error)
    return NextResponse.json({
      businessName: 'Emma AI Agent',
      description: 'Your 24/7 AI receptionist',
      contactPhone: '(555) 123-4567',
      services: ['Chat Agent', 'Voice Agent', 'Lead Pipeline'],
      source: 'error',
    })
  }
}
