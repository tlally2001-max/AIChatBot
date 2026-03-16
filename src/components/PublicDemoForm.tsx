'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PublicDemoForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/public-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create demo')
      }

      // Redirect straight to demo page
      router.push(`/demo/${data.demoToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your website URL..."
          required
          disabled={loading}
          className="flex-1 px-5 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold text-lg rounded-xl transition-all whitespace-nowrap"
        >
          {loading ? '⏳ Building Demo...' : '🚀 See Demo'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}
      {loading && (
        <p className="mt-3 text-blue-300 text-sm">
          Scraping your website and training Emma... this takes ~15 seconds
        </p>
      )}
    </form>
  )
}
