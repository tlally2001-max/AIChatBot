'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PipelineBoard } from '@/components/PipelineBoard'
import { Lead } from '@/types'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads')

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch leads')
        }

        const data = await response.json()
        setLeads(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [router])

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Lead Pipeline</h1>
      <PipelineBoard initialLeads={leads} />
    </div>
  )
}
