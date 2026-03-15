import { ChatWidget } from './ChatWidget'

export async function PhoneDemoPreview() {
  let websiteUrl = null
  let businessName = 'Your Business'

  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/demo-business`, {
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      console.log('API Response:', data)
      websiteUrl = data.url
      businessName = data.businessName

      // Ensure URL has protocol
      if (websiteUrl && !websiteUrl.startsWith('http')) {
        websiteUrl = 'https://' + websiteUrl
      }

      console.log(`✅ Website URL:`, websiteUrl)
      console.log(`✅ Business Name:`, businessName)
    }
  } catch (error) {
    console.error('Error fetching demo business data:', error)
  }

  return (
    <div className="flex justify-center lg:justify-end">
      {/* iPhone 14 Pro Mockup */}
      <div className="relative w-80 lg:w-72">
        {/* Outer Phone Body */}
        <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden" style={{ aspectRatio: '9/19' }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-44 h-8 bg-black rounded-b-3xl z-50 flex items-center justify-center gap-1">
            <span className="text-gray-600 text-xs">📶</span>
            <span className="text-gray-600 text-xs">📡</span>
            <span className="text-gray-600 text-xs flex-grow"></span>
            <span className="text-gray-600 text-xs">🔋</span>
          </div>

          {/* Screen Content */}
          <div className="bg-white h-full pt-8 overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="bg-white h-6 flex items-center justify-between px-6 text-xs font-semibold text-gray-800 border-b border-gray-100">
              <span>6:37</span>
              <span>Safari</span>
            </div>

            {/* URL Bar */}
            <div className="bg-gray-100 px-3 py-2 mx-2 mt-2 rounded-lg text-xs text-gray-600 truncate border border-gray-200">
              {websiteUrl ? websiteUrl.replace('https://', '').replace('http://', '') : 'yourwebsite.com'}
            </div>

            {/* Website Content - using iframe */}
            <div className="flex-1 overflow-hidden relative bg-white">
              {websiteUrl ? (
                <>
                  <iframe
                    key={websiteUrl}
                    src={websiteUrl}
                    className="w-full h-full border-0"
                    title="Website Demo"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                    style={{ pointerEvents: 'auto' }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌐</div>
                    <p className="text-xs text-gray-600">Loading...</p>
                    <p className="text-xs text-gray-500 mt-2">No website in database yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Widget - Interactive */}
            <ChatWidget />
          </div>
        </div>

        {/* Bottom bezel / home indicator */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}
