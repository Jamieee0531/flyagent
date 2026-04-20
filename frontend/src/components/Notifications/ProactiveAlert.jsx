import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

function SlotList({ slots }) {
  return (
    <ul className="mb-0 ps-3 small">
      {slots.slice(0, 3).map((s, i) => {
        const start = new Date(s.start).toLocaleString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        return (
          <li key={i}>
            {start} · {s.duration_hours}h free
          </li>
        );
      })}
    </ul>
  );
}

const cardStyle = {
  background: 'var(--warm, #faf6f1)',
  border: '1px solid var(--border, #e8e0d8)',
  borderRadius: 14,
  padding: '16px 18px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
  position: 'relative',
  maxWidth: 340,
};

function NotifCard({ n, onDismiss, onAction }) {
  const isProactive = n.type === 'proactive_trip';
  const savings = isProactive && n.low_30d
    ? Math.round((1 - n.price / n.low_30d) * 100)
    : null;

  return (
    <div style={cardStyle}>
      <button
        onClick={() => onDismiss(n.id)}
        style={{
          position: 'absolute', top: 10, right: 12,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, color: 'var(--muted, #999)', lineHeight: 1,
        }}
      >×</button>

      {isProactive ? (
        <>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
            ✈ Trip opportunity · {n.season}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
            {n.destination}
            {savings > 0 && (
              <span style={{ marginLeft: 8, fontSize: 12, color: '#4a6b5a', fontFamily: 'inherit', fontWeight: 400 }}>
                −{savings}% vs 30-day avg
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text, #333)', lineHeight: 1.5, marginBottom: 10 }}>
            {n.message}
          </p>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            📅 {n.free_dates?.[0]} – {n.free_dates?.[n.free_dates.length - 1]} · {n.free_dates?.length} days free
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>You have free time this week!</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{n.message}</p>
          {n.slots?.length > 0 && <SlotList slots={n.slots} />}
        </>
      )}

      <button
        onClick={() => onAction(n.id)}
        style={{
          marginTop: 12, width: '100%', padding: '7px 0',
          background: 'none', border: '1px solid var(--accent, #c4593a)',
          color: 'var(--accent, #c4593a)', borderRadius: 8,
          fontSize: 12, cursor: 'pointer', letterSpacing: '0.3px',
        }}
      >
        Plan a trip →
      </button>
    </div>
  );
}

export default function ProactiveAlert() {
  const { notifications, dismiss } = useNotifications();
  const navigate = useNavigate();

  const alerts = notifications.filter((n) => n.type === 'free_time' || n.type === 'proactive_trip');
  if (alerts.length === 0) return null;

  const handleAction = (id) => { dismiss(id); navigate('/dashboard'); };

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {alerts.map((n) => (
        <NotifCard key={n.id} n={n} onDismiss={dismiss} onAction={handleAction} />
      ))}
    </div>
  );
}
