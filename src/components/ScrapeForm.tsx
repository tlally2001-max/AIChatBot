'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ScrapeForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [prospectEmail, setProspectEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prospectEmail: prospectEmail || undefined }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to scrape')
      }

      setUrl('')
      setProspectEmail('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Enter Business URL</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prospect Email (optional)
        </label>
        <input
          type="email"
          value={prospectEmail}
          onChange={(e) => setProspectEmail(e.target.value)}
          placeholder="prospect@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Leave empty if you'll send the demo link later
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Scraping...' : 'Scrape & Analyze'}
      </button>
    </form>
  )
}
