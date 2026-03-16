import { ScrapeForm } from '@/components/ScrapeForm'
import { LandingFAQ } from '@/components/LandingFAQ'
import { PhoneDemoPreview } from '@/components/PhoneDemoPreview'
import { PublicDemoForm } from '@/components/PublicDemoForm'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div>
        {/* Hero Section with Phone Mockup */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-white min-h-screen flex items-center relative overflow-hidden w-full">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

          <div className="w-full px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Copy */}
              <div>
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-full text-blue-300 text-sm font-semibold">
                    AI Receptionist Platform
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                  24/7 AI-Powered <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">Lead Capture</span>
                </h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
                  Never miss a customer inquiry again. Emma, your AI receptionist, handles chats and calls automatically while you focus on closing deals.
                </p>

                <ul className="space-y-3 mb-10 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold mt-1">✓</span>
                    <span>Responds to customer questions instantly, 24/7</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold mt-1">✓</span>
                    <span>Captures qualified leads automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold mt-1">✓</span>
                    <span>Trained on your business in minutes</span>
                  </li>
                </ul>

                <p className="text-sm text-gray-400 italic mb-6">
                  Enter your website URL and see Emma live in ~15 seconds — no signup required.
                </p>

                <PublicDemoForm />
              </div>

              {/* Right Side - Phone Mockup */}
              <div className="flex justify-center">
                <Suspense fallback={<div className="flex justify-center lg:justify-end"><div className="w-80 h-96 bg-gray-700 rounded-3xl animate-pulse"></div></div>}>
                  <PhoneDemoPreview />
                </Suspense>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 border-b-2 border-blue-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">40-60%</div>
                <p className="text-gray-700 mt-2 font-semibold text-lg">More Leads Captured</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">24/7</div>
                <p className="text-gray-700 mt-2 font-semibold text-lg">Availability — Never Misses a Lead</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">&lt;10 min</div>
                <p className="text-gray-700 mt-2 font-semibold text-lg">Live in Under 10 Minutes</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-32">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-black text-center mb-4">How It Works</h2>
            <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">Three simple steps to get Emma live on your site</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                  1️⃣
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Add Your Website</h3>
                <p className="text-gray-700 leading-relaxed">
                  Give us your website URL. We scrape it and train Emma on your business, products, and services instantly.
                </p>
              </div>
              <div className="text-center bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                  2️⃣
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Copy One Line</h3>
                <p className="text-gray-700 leading-relaxed">
                  We give you a single line of code. Paste it on your website. That's all you need to do.
                </p>
              </div>
              <div className="text-center bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                  3️⃣
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Start Capturing Leads</h3>
                <p className="text-gray-700 leading-relaxed">
                  Emma goes live immediately. She chats, qualifies prospects, and captures leads 24/7 automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-gradient-to-b from-blue-50 to-indigo-50 py-32">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-black text-center mb-4">Everything You Need</h2>
            <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">All the features included in your plan</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-5xl flex-shrink-0">💬</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Live Chat Agent</h3>
                  <p className="text-gray-700">
                    Emma answers questions instantly, day or night, using your business knowledge base.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-5xl flex-shrink-0">🎤</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Voice Call Agent</h3>
                  <p className="text-gray-700">
                    Incoming calls answered professionally with full lead qualification built-in.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-5xl flex-shrink-0">🧠</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Trained on Your Business</h3>
                  <p className="text-gray-700">
                    Automatically learns from your website to answer questions accurately and contextually.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-5xl flex-shrink-0">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Real-Time Slack Alerts</h3>
                  <p className="text-gray-700">
                    Get notified instantly when leads come in so you can follow up while they're hot.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-5xl flex-shrink-0">📊</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Lead Pipeline Dashboard</h3>
                  <p className="text-gray-700">
                    Track all leads in one place, manage follow-ups, and see exactly what's converting.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-5xl flex-shrink-0">🔗</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Personalized Demo Links</h3>
                  <p className="text-gray-700">
                    Send custom demo links to prospects and track opens, clicks, and engagement automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-32">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-black text-center mb-4 text-white">Simple, Transparent Pricing</h2>
            <p className="text-center text-gray-300 text-lg mb-16">One plan. Everything included.</p>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-center border-2 border-blue-400 relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm">
                BEST VALUE
              </div>
              <div className="text-7xl font-black mb-2 text-white">$399</div>
              <div className="text-xl text-blue-100 mb-8">/month</div>
              <p className="text-blue-50 mb-10 text-lg font-semibold">🎉 14-day free trial — no credit card required</p>

              <ul className="text-left space-y-4 mb-12 text-white">
                <li className="flex items-center text-lg">
                  <span className="text-green-300 mr-4 text-2xl">✓</span>
                  Live Chat Agent
                </li>
                <li className="flex items-center text-lg">
                  <span className="text-green-300 mr-4 text-2xl">✓</span>
                  Voice Call Agent
                </li>
                <li className="flex items-center text-lg">
                  <span className="text-green-300 mr-4 text-2xl">✓</span>
                  Website Scraping & Training
                </li>
                <li className="flex items-center text-lg">
                  <span className="text-green-300 mr-4 text-2xl">✓</span>
                  Real-Time Slack Alerts
                </li>
                <li className="flex items-center text-lg">
                  <span className="text-green-300 mr-4 text-2xl">✓</span>
                  Lead Pipeline Dashboard
                </li>
                <li className="flex items-center text-lg">
                  <span className="text-green-300 mr-4 text-2xl">✓</span>
                  Personalized Demo Links
                </li>
              </ul>

              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 font-black text-lg transform hover:scale-105 transition-all duration-200"
              >
                🎯 Start Free Trial Now
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <LandingFAQ />

        {/* Footer CTA */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to Stop Missing Leads?</h2>
            <p className="text-xl text-blue-100 mb-10">Join hundreds of businesses capturing leads with Emma.</p>
            <Link
              href="/login"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl hover:bg-yellow-300 font-black text-lg border-2 border-white transform hover:scale-105 transition-all duration-200 hover:shadow-2xl"
            >
              🚀 Get Started Free
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ScrapeForm />
    </div>
  )
}
