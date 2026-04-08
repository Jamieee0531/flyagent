import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanggraph } from '../hooks/useLanggraph';
import { listTravelPlans, getTravelPlan, createTravelPlan } from '../api/gateway';
import { travelTypes } from '../data/travelTypes.js';
import { getPersonaSvg, getAnimalSvg } from '../data/avatarSvg.js';
import './DashboardV2.css';

/* ── Dimension config (label + color) ── */
const DIM_CONFIG = [
  { key: 'escape', label: 'Escape', color: '#c4593a' },
  { key: 'pace', label: 'Pace', color: '#b8873c' },
  { key: 'nature', label: 'Nature', color: '#4a6b5a' },
  { key: 'solitude', label: 'Solitude', color: '#3a6b8a' },
  { key: 'quality', label: 'Quality', color: '#7c5cbf' },
];

/* ── Transport icon helper ── */
function transportIcon(t) {
  const map = {
    taxi: '🚕', 'tuk-tuk': '🛺', drive: '🚗', subway: '🚇',
    bus: '🚌', boat: '⛵', walk: '🚶', bike: '🚲', songthaew: '🚐',
  };
  return map[t] || '🚶';
}

/* ── Quick reply + chip labels ── */
const QUICK_REPLIES = ['Why we picked this', 'Add a day trip', 'Swap hotel'];
const ACTION_CHIPS = ['Swap destination', 'Adjust budget', 'Add spot', 'Check flights'];

/* ── Stop colors (cycling) ── */
const STOP_COLORS = ['#c4593a', '#3a6b8a', '#b8873c', '#4a6b5a', '#7c5cbf', '#a32d2d', '#185fa5', '#d4537e'];

export default function DashboardV2() {
  /* ── Auth + profile ── */
  const { profile, token, logout } = useAuth();
  const typeKey = profile?.mbtiType || '';
  const typeData = travelTypes[typeKey] || null;
  const dims = typeData?.dims || profile?.dimensions || {};
  const pet = typeData?.pet || profile?.pet || {};
  const qp = profile?.quickPick || {};

  /* ── LangGraph chat + results ── */
  const { messages, sendMessage, isSending, results } = useLanggraph();
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const profileSentRef = useRef(false);

  /* ── Planner state ── */
  const [activeTab, setActiveTab] = useState('overview');
  const [savedPlans, setSavedPlans] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);

  /* ── Derived data from results ── */
  const flights = results?.flights || [];
  const hotels = results?.hotels || [];
  const itinerary = results?.itinerary || [];
  const tips = results?.tips || [];

  /* ── Scroll chat to bottom ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Load saved plans on mount ── */
  useEffect(() => {
    if (!token) return;
    listTravelPlans(token)
      .then((data) => setSavedPlans(data?.plans || data || []))
      .catch(() => {});
  }, [token]);

  /* ── Profile context builder (sent once with first user msg) ── */
  const buildProfileContext = useCallback(() => {
    if (!profile?.mbtiType) return '';
    return [
      '[Travel Profile]',
      `Personality: ${profile.mbtiTitle || profile.mbtiType} (${profile.mbtiSubtitle || ''})`,
      `Dimensions: Escape ${dims.escape || 0}, Pace ${dims.pace || 0}, Nature ${dims.nature || 0}, Solitude ${dims.solitude || 0}, Quality ${dims.quality || 0}`,
      qp.departure ? `From: ${qp.departure}` : '',
      qp.companion ? `With: ${qp.companion}` : '',
      qp.budget ? `Budget: ${qp.budget}` : '',
      qp.timeWindow ? `When: ${qp.timeWindow}` : '',
    ].filter(Boolean).join('\n');
  }, [profile, dims, qp]);

  const sendWithContext = useCallback((text) => {
    if (!profileSentRef.current && profile?.mbtiType) {
      profileSentRef.current = true;
      const ctx = buildProfileContext();
      sendMessage(`${ctx}\n\n${text}`);
    } else {
      sendMessage(text);
    }
  }, [profile, buildProfileContext, sendMessage]);

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    setChatInput('');
    sendWithContext(text);
  };

  const handleChip = (text) => {
    if (isSending) return;
    sendWithContext(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  };

  /* ── Save plan ── */
  const handleSavePlan = async () => {
    if (!token || savingPlan) return;
    setSavingPlan(true);
    try {
      const plan = {
        name: qp.departure ? `Trip from ${qp.departure}` : 'My Trip',
        selectedFlight: flights[0] || null,
        selectedHotel: hotels[0] || null,
        itinerary,
        tips,
      };
      await createTravelPlan(token, plan);
      const data = await listTravelPlans(token);
      setSavedPlans(data?.plans || data || []);
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setSavingPlan(false);
    }
  };

  /* ── Load saved plan details ── */
  const handleSelectPlan = async (planId) => {
    // This would load results into the planner -- for now just switch to overview
    setActiveTab('overview');
  };

  /* ── Persona SVG (memoish) ── */
  const personaSvg = typeKey ? getPersonaSvg(typeKey) : '';
  const animalSvg = typeKey ? getAnimalSvg(typeKey) : '';
  const animalSvgSmall = animalSvg
    ? animalSvg.replace(/viewBox="0 0 140 140"/, 'viewBox="0 0 140 140" width="28" height="28"')
    : '';
  const animalSvgChat = animalSvg
    ? animalSvg.replace(/viewBox="0 0 140 140"/, 'viewBox="0 0 140 140" width="24" height="24"')
    : '';

  /* ── Build day tabs from itinerary ── */
  const dayTabs = itinerary.length > 0
    ? [{ key: 'overview', label: 'Overview' }, ...itinerary.map((d, i) => ({ key: `day${i + 1}`, label: `Day ${d.day || i + 1}` }))]
    : [{ key: 'overview', label: 'Overview' }];

  /* ── Render helper: overview tab ── */
  const renderOverview = () => {
    const hasContent = flights.length > 0 || hotels.length > 0 || tips.length > 0;
    if (!hasContent) {
      return (
        <div className="planner-empty">
          <div className="planner-empty-icon">🗺</div>
          <div className="planner-empty-text">
            Start a conversation with your travel buddy to get flight, hotel, and itinerary recommendations.
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Flights */}
        {flights.map((f, i) => (
          <div key={`flight-${i}`}>
            <div className="wx-banner">
              <span style={{ fontSize: '14px' }}>✈️</span>
              <span>Flight {i + 1} {f.airline ? `· ${f.airline}` : ''}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: '.7' }}>{f.price || f.total_amount || ''}</span>
            </div>
            <div className="trip-card">
              <div className="tc-left">
                <div className="tc-num" style={{ background: '#c4593a' }}>✈</div>
              </div>
              <div className="tc-inner">
                <div className="tc-body">
                  <div className="tc-type-row">
                    <div className="tc-type-dot" style={{ background: '#c4593a' }} />
                    <span className="tc-type-label">{f.stops === 0 || f.stops === '0' ? 'Non-stop' : f.stops ? `${f.stops} stop(s)` : 'Outbound flight'}</span>
                    <span className="tc-time" style={{ marginLeft: 'auto' }}>{f.duration || ''}</span>
                  </div>
                  <div className="tc-name">{f.airline || ''} {f.flight_number || ''}</div>
                  <div className="tc-meta">
                    <span>{f.departure_time || f.depart || ''} → {f.arrival_time || f.arrive || ''}</span>
                  </div>
                  {(f.stops === 0 || f.stops === '0') && (
                    <span className="tc-tag" style={{ background: '#fde8de', color: '#a03a20' }}>Non-stop</span>
                  )}
                </div>
                <div className="tc-img" style={{ background: '#fde8de' }}>✈️</div>
              </div>
            </div>
          </div>
        ))}

        {/* Hotels */}
        {hotels.map((h, i) => (
          <div key={`hotel-${i}`}>
            <div className="wx-banner">
              <span style={{ fontSize: '14px' }}>🏨</span>
              <span>Hotel · {h.name || 'Hotel'}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: '.7' }}>{h.price || h.rate || ''}</span>
            </div>
            <div className="trip-card">
              <div className="tc-left">
                <div className="tc-num" style={{ background: '#3a6b8a' }}>★</div>
              </div>
              <div className="tc-inner">
                <div className="tc-body">
                  <div className="tc-type-row">
                    <div className="tc-type-dot" style={{ background: '#3a6b8a' }} />
                    <span className="tc-type-label">{h.type || h.neighborhood || 'Hotel'}</span>
                    <span className="tc-time" style={{ marginLeft: 'auto' }}>
                      {h.rating ? `★ ${h.rating}` : ''}
                    </span>
                  </div>
                  <div className="tc-name">{h.name || 'Hotel'}</div>
                  <div className="tc-meta">
                    <span>{h.price || h.rate || ''} {h.address ? `· ${h.address}` : ''}</span>
                  </div>
                </div>
                <div className="tc-img" style={{ background: '#e6f1fb' }}>🏨</div>
              </div>
            </div>
          </div>
        ))}

        {/* Tips */}
        {tips.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div className="wx-banner">
              <span style={{ fontSize: '14px' }}>💡</span>
              <span>Travel Tips</span>
            </div>
            {tips.map((tip, i) => {
              const title = typeof tip === 'string' ? tip : (tip.category || tip.title || `Tip ${i + 1}`);
              const items = (typeof tip === 'object' && tip.tips) ? tip.tips : [];
              return (
                <div key={`tip-${i}`} className="trip-card">
                  <div className="tc-left">
                    <div className="tc-num" style={{ background: '#b8873c' }}>{i + 1}</div>
                  </div>
                  <div className="tc-inner">
                    <div className="tc-body">
                      <div className="tc-name">{title}</div>
                      {items.map((item, j) => (
                        <div key={j} className="tc-meta" style={{ marginTop: 2 }}>
                          <span>• {typeof item === 'string' ? item : item.tip || item.text || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  /* ── Render helper: day tab ── */
  const renderDay = (dayIndex) => {
    const day = itinerary[dayIndex];
    if (!day || !day.stops || day.stops.length === 0) {
      return (
        <div className="planner-empty">
          <div className="planner-empty-icon">📋</div>
          <div className="planner-empty-text">No stops planned for this day yet.</div>
        </div>
      );
    }

    return (
      <>
        {day.stops.map((s, i) => {
          const isLast = i === day.stops.length - 1;
          const color = STOP_COLORS[i % STOP_COLORS.length];
          const tIcon = s.transport ? transportIcon(s.transport) : '🚶';
          const tLabel = s.transport || 'Walk';

          return (
            <div key={i}>
              <div className="trip-card">
                <div className="tc-left">
                  <div className="tc-num" style={{ background: color }}>{i + 1}</div>
                  {!isLast && <div className="tc-thread" />}
                </div>
                <div className="tc-inner">
                  <div className="tc-body">
                    <div className="tc-type-row">
                      <div className="tc-type-dot" style={{ background: color }} />
                      <span className="tc-type-label">{s.time || ''}</span>
                    </div>
                    <div className="tc-name">{s.name || ''}</div>
                    <div className="tc-meta"><span>{s.description || ''}</span></div>
                  </div>
                </div>
              </div>
              {!isLast && (
                <div className="transport-line">
                  <div className="tl-line" />
                  <div className="tl-info">
                    <span>{tIcon}</span>
                    <span>{tLabel}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  /* ── Render planner content based on active tab ── */
  const renderPlannerContent = () => {
    if (activeTab === 'overview') return renderOverview();
    const match = activeTab.match(/^day(\d+)$/);
    if (match) {
      const dayIdx = parseInt(match[1], 10) - 1;
      return renderDay(dayIdx);
    }
    return renderOverview();
  };

  /* ════════ JSX ════════ */
  return (
    <div className="dv2">

      {/* ── TOPNAV ── */}
      <nav className="topnav">
        <div className="logo">
          <div className="logo-mark">✦</div>
          Nomie
        </div>
        <div className="nav-divider" />
        <div>
          <div className="nav-trip-name">
            {qp.departure ? `From ${qp.departure}` : 'New Trip'}
            {qp.timeWindow ? ` · ${qp.timeWindow}` : ''}
          </div>
          <div className="nav-trip-sub">
            {isSending ? 'Agent working...' : (results ? 'Results ready' : 'Pending')}
          </div>
        </div>
        <div className="nav-right">
          <div className="agent-status">
            <div className="pulse-dot" />
            {isSending ? 'Agent working' : 'Agent monitoring'}
          </div>
          <button className="nav-btn" onClick={handleSavePlan} disabled={savingPlan}>
            {savingPlan ? 'Saving...' : 'Save plan'}
          </button>
          <button className="nav-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ── APP BODY ── */}
      <div className="app-body">

        {/* ── LEFT SIDEBAR: PROFILE ── */}
        <aside className="sidebar">

          {/* Persona + MBTI */}
          <div className="profile-hero">
            <div className="pet-row">
              <div
                className="persona-avatar-wrap"
                dangerouslySetInnerHTML={{ __html: personaSvg || '<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" width="52" height="52"><rect width="52" height="52" fill="#e8e2d6"/><circle cx="26" cy="19" r="10" fill="#9b9488" opacity=".5"/><ellipse cx="26" cy="42" rx="16" ry="11" fill="#9b9488" opacity=".35"/></svg>' }}
              />
              <div>
                <div className="pet-info-name">{typeData?.type || 'Traveler'}</div>
                <div className="pet-info-type">{typeData?.subtitle || 'Complete the quiz to unlock'}</div>
              </div>
            </div>

            <div className="mbti-badge">
              <div style={{ flex: 1 }}>
                <div className="mbti-label">Travel Personality</div>
                <div className="mbti-type">{typeData?.type || '—'}</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{typeData?.subtitle || ''}</span>
            </div>

            <div className="dim-bars">
              {DIM_CONFIG.map((d) => {
                const val = dims[d.key] ?? 0;
                return (
                  <div className="dim-row" key={d.key}>
                    <div className="dim-label">{d.label}</div>
                    <div className="dim-track">
                      <div
                        className="dim-fill"
                        style={{ width: `${val}%`, background: d.color, transition: 'width 1s cubic-bezier(.16,1,.3,1)' }}
                      />
                    </div>
                    <div className="dim-val">{val}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Constraints */}
          <div className="profile-section">
            <div className="ps-label">Trip Constraints</div>
            <div className="constraint-item">
              <div className="ci-key">Origin</div>
              <div className="ci-val">{qp.departure || '—'}</div>
            </div>
            <div className="constraint-item">
              <div className="ci-key">Group</div>
              <div className="ci-val">{qp.companion || '—'}</div>
            </div>
            <div className="constraint-item">
              <div className="ci-key">Budget</div>
              <div className="ci-val">{qp.budget || '—'}</div>
            </div>
            <div className="constraint-item">
              <div className="ci-key">Departure</div>
              <div className="ci-val">{qp.timeWindow || '—'}</div>
            </div>
          </div>

          {/* Saved Plans / Wishlist */}
          <div className="profile-section">
            <div className="ps-label">Saved Plans</div>
            {savedPlans.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--muted)', padding: '4px 0', opacity: '.5' }}>
                No saved plans yet
              </div>
            )}
            {savedPlans.map((plan) => (
              <div
                key={plan._id || plan.id}
                className="wishlist-item"
                onClick={() => handleSelectPlan(plan._id || plan.id)}
              >
                <div className="wi-swatch" style={{ background: 'rgba(196,89,58,0.1)' }}>📋</div>
                <div className="wi-name">{plan.name || 'Untitled Plan'}</div>
                <span className="wi-status ws-monitor">Saved</span>
              </div>
            ))}
            <button className="add-dest-btn" onClick={handleSavePlan} disabled={savingPlan}>
              {savingPlan ? 'Saving...' : '+ Save current plan'}
            </button>
          </div>

        </aside>

        {/* ── CENTER: PLANNER ── */}
        <main className="planner">

          {/* Day tabs */}
          <div className="day-tabs-bar">
            <div className="day-tabs">
              {dayTabs.map((tab) => (
                <div
                  key={tab.key}
                  className={`day-tab${tab.key === 'overview' ? ' tab-overview' : ''}${activeTab === tab.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary content */}
          <div className="itinerary">
            {renderPlannerContent()}
          </div>
        </main>

        {/* ── RIGHT: CHATBOT ── */}
        <aside className="chatpanel">

          <div className="chat-header">
            <div className="ch-top">
              <div className="ch-avatar">
                {animalSvgSmall ? (
                  <span dangerouslySetInnerHTML={{ __html: animalSvgSmall }} />
                ) : (
                  <span>🐾</span>
                )}
              </div>
              <div>
                <div className="ch-name">{pet.name || 'Travel Buddy'}</div>
                <div className="ch-status">{isSending ? 'Thinking...' : 'Online · Planning live'}</div>
              </div>
            </div>
            <div className="ch-chips">
              {ACTION_CHIPS.map((chip) => (
                <div key={chip} className="ch-chip" onClick={() => handleChip(chip)}>{chip}</div>
              ))}
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="msg user">
                    <div className="msg-avatar user">ME</div>
                    <div className="msg-bubble user">{msg.text}</div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="msg">
                  <div className="msg-avatar agent">
                    {animalSvgChat ? (
                      <span dangerouslySetInnerHTML={{ __html: animalSvgChat }} />
                    ) : (
                      <span style={{ fontSize: '10px' }}>✦</span>
                    )}
                  </div>
                  <div className={`msg-bubble agent${msg.isStreaming ? ' streaming-cursor' : ''}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isSending && messages[messages.length - 1]?.role !== 'agent' && (
              <div className="typing">
                <div className="msg-avatar agent">
                  {animalSvgChat ? (
                    <span dangerouslySetInnerHTML={{ __html: animalSvgChat }} />
                  ) : (
                    <span style={{ fontSize: '10px' }}>✦</span>
                  )}
                </div>
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <div className="chat-quick-replies">
              {QUICK_REPLIES.map((qr) => (
                <button key={qr} className="quick-reply" onClick={() => handleChip(qr)}>{qr}</button>
              ))}
            </div>
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                placeholder="Tell me what you think..."
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  autoResize(e.target);
                }}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={handleSend}>→</button>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
