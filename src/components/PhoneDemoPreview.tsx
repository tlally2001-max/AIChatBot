export async function PhoneDemoPreview() {
  return (
    <div className="flex justify-center lg:justify-end">
      {/* iPhone Mockup */}
      <div className="relative w-72 lg:w-64">
        <div className="relative bg-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-800" style={{ aspectRatio: '9/19.5' }}>

          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
            <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700"></div>
          </div>

          {/* Screen */}
          <div className="absolute inset-1 rounded-[2.5rem] overflow-hidden flex flex-col bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <span className="text-xs font-bold text-white">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 h-1 bg-white rounded-sm"></div>
                  <div className="w-0.5 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-0.5 h-2 bg-white rounded-sm"></div>
                  <div className="w-0.5 h-3 bg-white rounded-sm"></div>
                </div>
                <div className="flex items-center gap-0.5 ml-1">
                  <div className="w-5 h-2.5 rounded-sm border border-white/60 p-0.5">
                    <div className="w-full h-full bg-white rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call label */}
            <div className="text-center mt-4">
              <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase">AI Receptionist</p>
              <p className="text-white text-2xl font-bold mt-1">Emma</p>
              <p className="text-green-400 text-sm mt-1 flex items-center justify-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Speaking…
              </p>
            </div>

            {/* Avatar with ring animation */}
            <div className="flex justify-center mt-6 relative">
              {/* Outer pulse rings */}
              <div className="absolute w-32 h-32 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute w-28 h-28 rounded-full bg-blue-500/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }}></div>
              <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.8s' }}></div>
              {/* Avatar */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 z-10">
                <span className="text-4xl">🤖</span>
              </div>
            </div>

            {/* Waveform */}
            <div className="flex items-center justify-center gap-1 mt-8 h-10">
              {[3, 6, 9, 12, 8, 14, 10, 6, 11, 7, 13, 9, 5, 10, 7].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400 rounded-full animate-bounce opacity-80"
                  style={{
                    height: `${h * 2}px`,
                    animationDuration: `${0.6 + (i % 4) * 0.15}s`,
                    animationDelay: `${(i * 0.07) % 0.5}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* Transcript bubble */}
            <div className="mx-4 mt-6 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <p className="text-white/90 text-xs leading-relaxed text-center italic">
                &ldquo;Hi! I&apos;m Emma. How can I help you today?&rdquo;
              </p>
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-8 mt-auto mb-6 px-6">
              {/* Mute */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/60 text-xs">Mute</span>
              </div>

              {/* End Call */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                  <svg className="w-6 h-6 text-white rotate-135" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                </div>
                <span className="text-white/60 text-xs">End</span>
              </div>

              {/* Speaker */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/60 text-xs">Speaker</span>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="pb-2 flex justify-center">
              <div className="w-24 h-1 bg-white/30 rounded-full"></div>
            </div>

          </div>
        </div>

        {/* Glow */}
        <div className="absolute inset-0 rounded-[3rem] bg-blue-500/15 blur-2xl -z-10 scale-95"></div>
      </div>
    </div>
  )
}
