'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { DemoHeroPage } from '@/components/DemoHeroPage'
import { BusinessProfile } from '@/types'

export default function DemoPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const demoToken = params.token as string

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const prospectName = searchParams.get('name')
  const prospectEmail = searchParams.get('email')

  useEffect(() => {
    async function fetchLead() {
      try {
        const response = await fetch(`/api/lead/${demoToken}`)
        if (!response.ok) throw new Error('Lead not found')

        const lead = await response.json()
        setBusinessProfile(lead.business_profile)
        setWebsiteUrl(lead.url)

        // Log demo page view
        await fetch('/api/demo-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            demoToken,
            event: 'page_viewed',
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demo')
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [demoToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized demo...</p>
        </div>
      </div>
    )
  }

  if (error || !businessProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Demo Not Available</h1>
          <p className="text-gray-700 mb-6">{error || 'Could not load the demo. Please check your link.'}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  // Ensure website URL has protocol
  const fullWebsiteUrl = websiteUrl
    ? websiteUrl.startsWith('http')
      ? websiteUrl
      : `https://${websiteUrl}`
    : undefined

  return (
    <DemoHeroPage
      business={businessProfile}
      demoToken={demoToken}
      clientName={prospectName || undefined}
      websiteUrl={fullWebsiteUrl}
    />
  )
}
