'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'How does setup work?',
    answer: 'We scrape your website to understand your business, products, and services. Then you embed a single line of code on your site, and Emma is live immediately. No complex integrations or API calls needed.'
  },
  {
    question: 'What businesses is this for?',
    answer: 'Emma works for any B2B or B2C business that wants to capture leads 24/7. Perfect for agencies, SaaS companies, consultancies, services providers, and e-commerce brands.'
  },
  {
    question: 'How is Emma trained on my data?',
    answer: 'Our scraper extracts your website content, pricing, FAQs, services, and contact info. Emma uses this to answer questions accurately and qualify leads based on your business context.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. No contracts, no lock-in. Cancel in your dashboard anytime. Your leads and data remain yours.'
  },
  {
    question: 'What happens after the trial?',
    answer: 'After your 14-day free trial, your account converts to $399/month if you don\'t cancel. You\'ll see your ROI within the first week of leads captured.'
  }
]

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-5xl md:text-6xl font-black text-center mb-4">Questions?</h2>
        <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">We've got answers. Read what others are asking.</p>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-colors bg-white">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-8 py-5 hover:bg-blue-50 flex justify-between items-center transition-colors"
              >
                <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                <span className="text-blue-600 font-bold text-2xl flex-shrink-0 ml-4">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-8 py-6 bg-blue-50 border-t-2 border-gray-200 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
