import { useState } from 'react'
import './Chat.css'

const MOCK_MESSAGES = [
  { id: '1', role: 'agent', text: 'Hi there! Tell me about your trip — where to, when, and how many people?' },
]

function Chat({ phase, onStartAgents, onStopAgents, compressed }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { id: Date.now().toString(), role: 'user', text: input }
    const newMessages = [...messages, userMsg]
    setInput('')

    // Simulate agent response
    const agentReply = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      text: getAgentReply(newMessages.length),
    }
    const withReply = [...newMessages, agentReply]
    setMessages(withReply)

    // After enough messages, simulate "ready to search"
    if (newMessages.filter(m => m.role === 'user').length >= 3) {
      setTimeout(() => {
        const readyMsg = {
          id: (Date.now() + 2).toString(),
          role: 'agent',
          text: 'Got it! Let me start searching for you now 🚀',
        }
        setMessages(prev => [...prev, readyMsg])
        setTimeout(() => onStartAgents(), 1000)
      }, 1500)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`chat-container ${compressed ? 'compressed' : ''}`}>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === 'agent' && <span className="message-avatar">🤖</span>}
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        {phase === 'executing' ? (
          <button className="stop-btn" onClick={onStopAgents}>
            🛑 Stop Search
          </button>
        ) : (
          <div className="input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={compressed ? 'Message...' : 'Describe your travel plans... (Enter to send)'}
              rows={1}
            />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function getAgentReply(msgCount) {
  const replies = [
    'Sounds great! Which city are you departing from?',
    'Got it! Any accommodation preferences — hotel or Airbnb? Budget range?',
    'Nice! Any must-see attractions or activities in mind?',
    'Almost there, let me confirm the details...',
  ]
  const idx = Math.min(Math.floor(msgCount / 2), replies.length - 1)
  return replies[idx]
}

export default Chat
