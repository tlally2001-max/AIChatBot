'use client'

import { useState } from 'react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm Emma, your AI receptionist. How can I help you today?",
      sender: 'emma',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }
    const question = inputValue
    setMessages([...messages, userMessage])
    setInputValue('')

    try {
      // Get Emma's response from the API
      const response = await fetch('/api/chat-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()
      const emmaResponse = data.response || "Thanks for your question!"

      // Add Emma's response
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: emmaResponse,
          sender: 'emma',
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('Error getting response:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Sorry, I had trouble understanding. Can you rephrase that?",
          sender: 'emma',
          timestamp: new Date(),
        },
      ])
    }
  }

  if (!isOpen) {
    return (
      <div className="absolute bottom-6 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group"
        >
          {/* Pulse animation rings */}
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-75"></div>
          </div>
          <div className="absolute inset-0">
            <div className="absolute inset-2 bg-green-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.2s'}}></div>
          </div>

          {/* Main button */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 border-4 border-white hover:shadow-green-500/50 hover:shadow-2xl">
            <span className="text-white text-3xl font-bold">💬</span>
          </div>

          {/* Badge */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-bounce">
            1
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="absolute bottom-4 right-3 w-64 bg-white rounded-xl shadow-2xl flex flex-col h-80 z-40 overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between shadow-md">
        <div>
          <h3 className="font-bold text-lg">Emma</h3>
          <p className="text-sm opacity-90">AI Receptionist • Always Here</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Emma anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-3 transition text-lg font-semibold shadow-md hover:shadow-lg"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
