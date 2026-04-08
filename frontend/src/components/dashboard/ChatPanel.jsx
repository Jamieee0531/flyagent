import { useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { getAnimalSvg } from '../../data/avatarSvg.js';
import './ChatPanel.css';

const ACTION_CHIPS = [
  'Check flights',
  'Adjust budget',
  'Add a spot',
  'Swap destination',
];

export default function ChatPanel({ profile, messages, isSending, onSend, onStop }) {
  const messagesEndRef = useRef(null);
  const animalSvg = getAnimalSvg(profile?.mbtiType || '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback((text) => {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if (!trimmed || isSending) return;
    onSend(trimmed);
  }, [isSending, onSend]);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="ch-avatar agent">
          <span dangerouslySetInnerHTML={{ __html: animalSvg || '🐾' }} />
        </div>
        <div>
          <div className="ch-name">{profile?.pet?.name || 'Companion'}</div>
          <div className="ch-status">{isSending ? 'Thinking...' : 'Online'}</div>
        </div>
        {isSending && onStop && (
          <button className="stop-btn" onClick={onStop}>Stop</button>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            {msg.role === 'agent' && (
              <div className="msg-avatar agent">
                <span dangerouslySetInnerHTML={{ __html: animalSvg || '🐾' }} />
              </div>
            )}
            <div className={`msg-bubble ${msg.role}`}>
              {msg.role === 'agent'
                ? msg.isStreaming
                  ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}▌</span>
                  : <ReactMarkdown>{msg.text}</ReactMarkdown>
                : <>{msg.text}{msg.isStreaming && <span className="msg-cursor">|</span>}</>}
            </div>
          </div>
        ))}
        {isSending && messages[messages.length - 1]?.role !== 'agent' && (
          <div className="chat-msg agent">
            <div className="msg-avatar agent">
              <span dangerouslySetInnerHTML={{ __html: animalSvg || '🐾' }} />
            </div>
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-chips">
        {ACTION_CHIPS.map((chip) => (
          <button
            key={chip}
            className="action-chip"
            onClick={() => handleSend(chip)}
            disabled={isSending}
          >
            {chip}
          </button>
        ))}
      </div>

      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}

function ChatInput({ onSend, disabled }) {
  const inputRef = useRef(null);

  const submit = () => {
    const val = inputRef.current?.value.trim();
    if (!val) return;
    inputRef.current.value = '';
    onSend(val);
  };

  return (
    <div className="chat-input-bar">
      <input
        ref={inputRef}
        className="chat-input"
        placeholder="Message your travel companion..."
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        className="chat-send-btn"
        onClick={submit}
        disabled={disabled}
      >
        &#8593;
      </button>
    </div>
  );
}
