import { useEffect, useRef, useState } from 'react';
import { useLanggraph } from '../../hooks/useLanggraph';
import { getAnimalSvg } from '../../data/avatarSvg.js';
import './ChatPanel.css';

const ACTION_CHIPS = [
  'Check flights',
  'Adjust budget',
  'Add a spot',
  'Swap destination',
];

export default function ChatPanel({ token, profile }) {
  const { messages, sendMessage, isSending, results } = useLanggraph();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const profileSentRef = useRef(false);

  // Push results to center panel when they arrive
  useEffect(() => {
    if (!results) return;
    if (results.flights && window.__nomieSetFlights) window.__nomieSetFlights(results.flights);
    if (results.hotels && window.__nomieSetHotels) window.__nomieSetHotels(results.hotels);
    if (results.itinerary && window.__nomieSetItinerary) window.__nomieSetItinerary(results.itinerary);
    if (results.tips && window.__nomieSetTips) window.__nomieSetTips(results.tips);
  }, [results]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build profile context string (sent once with first message)
  const buildProfileContext = () => {
    if (!profile?.mbtiType) return '';
    const qp = profile.quickPick || {};
    const dims = profile.dimensions || {};
    return [
      `[Travel Profile]`,
      `Personality: ${profile.mbtiTitle || profile.mbtiType} (${profile.mbtiSubtitle || ''})`,
      `Dimensions: Escape ${dims.escape || 0}, Pace ${dims.pace || 0}, Nature ${dims.nature || 0}, Solitude ${dims.solitude || 0}, Quality ${dims.quality || 0}`,
      qp.departure ? `From: ${qp.departure}` : '',
      qp.companion ? `With: ${qp.companion}` : '',
      qp.budget ? `Budget: ${qp.budget}` : '',
      qp.timeWindow ? `When: ${qp.timeWindow}` : '',
    ].filter(Boolean).join('\n');
  };

  // Prepend profile context to the first message only
  const sendWithContext = (text) => {
    if (!profileSentRef.current && profile?.mbtiType) {
      profileSentRef.current = true;
      const ctx = buildProfileContext();
      sendMessage(`${ctx}\n\n${text}`);
    } else {
      sendMessage(text);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    sendWithContext(text);
  };

  const handleChip = (text) => {
    if (isSending) return;
    sendWithContext(text);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="ch-avatar agent">
          <span dangerouslySetInnerHTML={{ __html: getAnimalSvg(profile?.mbtiType || '') || '🐾' }} />
        </div>
        <div>
          <div className="ch-name">{profile?.pet?.name || 'Companion'}</div>
          <div className="ch-status">{isSending ? 'Thinking...' : 'Online'}</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            {msg.role === 'agent' && (
              <div className="msg-avatar agent">
                <span dangerouslySetInnerHTML={{ __html: getAnimalSvg(profile?.mbtiType || '') || '🐾' }} />
              </div>
            )}
            <div className={`msg-bubble ${msg.role}`}>
              {msg.text}
              {msg.isStreaming && <span className="msg-cursor">|</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-chips">
        {ACTION_CHIPS.map((chip) => (
          <button key={chip} className="action-chip" onClick={() => handleChip(chip)} disabled={isSending}>
            {chip}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message your travel companion..."
          disabled={isSending}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={isSending || !input.trim()}>
          &#8593;
        </button>
      </div>
    </div>
  );
}
