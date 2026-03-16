import { ChatWidget } from './ChatWidget'

export async function PhoneDemoPreview() {
  return (
    <div className="flex justify-center lg:justify-end">
      {/* iPhone Mockup */}
      <div className="relative w-72 lg:w-64">
        {/* Phone Body */}
        <div className="relative bg-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-800" style={{ aspectRatio: '9/19.5' }}>

          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
            <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700"></div>
          </div>

          {/* Screen */}
          <div className="absolute inset-1 bg-white rounded-[2.5rem] overflow-hidden flex flex-col">

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 bg-white">
              <span className="text-xs font-bold text-gray-900">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 h-1 bg-gray-900 rounded-sm"></div>
                  <div className="w-0.5 h-1.5 bg-gray-900 rounded-sm"></div>
                  <div className="w-0.5 h-2 bg-gray-900 rounded-sm"></div>
                  <div className="w-0.5 h-3 bg-gray-900 rounded-sm"></div>
                </div>
                <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" opacity="0.2"/>
                  <path d="M10 2c-1.5 0-2.9.4-4.1 1.1L10 10V2z"/>
                </svg>
                <div className="flex items-center gap-0.5">
                  <div className="w-5 h-2.5 rounded-sm border border-gray-900 p-0.5">
                    <div className="w-full h-full bg-gray-900 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat App Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Emma</p>
                <p className="text-blue-200 text-xs mt-0.5">AI Receptionist • Online</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-gray-50 px-3 py-3 flex flex-col gap-2 overflow-hidden">

              {/* Emma message */}
              <div className="flex items-end gap-1.5">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">E</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm max-w-[75%]">
                  <p className="text-gray-800 text-xs leading-relaxed">Hi! I&apos;m Emma 👋 How can I help you today?</p>
                </div>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]">
                  <p className="text-white text-xs leading-relaxed">What are your hours?</p>
                </div>
              </div>

              {/* Emma reply */}
              <div className="flex items-end gap-1.5">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">E</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm max-w-[80%]">
                  <p className="text-gray-800 text-xs leading-relaxed">We&apos;re open Mon–Fri 9am–6pm. I can also help you book an appointment right now! 📅</p>
                </div>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]">
                  <p className="text-white text-xs leading-relaxed">Can I get a quote?</p>
                </div>
              </div>

              {/* Emma typing */}
              <div className="flex items-end gap-1.5">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">E</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Input Bar */}
            <div className="bg-white border-t border-gray-100 px-3 py-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5">
                <p className="text-gray-400 text-xs">Message Emma...</p>
              </div>
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="bg-white py-2 flex justify-center">
              <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
            </div>

          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-[3rem] bg-blue-500/10 blur-2xl -z-10 scale-95"></div>
      </div>
    </div>
  )
}
