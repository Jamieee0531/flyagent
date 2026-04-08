import { useState } from 'react';

export default function TipsSummary({ tips }) {
  const [expanded, setExpanded] = useState({});

  if (!tips) return null;

  // Normalize tips data — agent returns { categories: [{ category, tips: [] }] }
  let sections = [];
  if (Array.isArray(tips)) {
    sections = tips.map((s) => ({
      label: s.category || s.label || s.title || '',
      text: Array.isArray(s.tips) ? s.tips.join('\n• ') : (s.text || s.content || ''),
    }));
  } else if (tips.categories && Array.isArray(tips.categories)) {
    sections = tips.categories.map((s) => ({
      label: s.category || '',
      text: Array.isArray(s.tips) ? s.tips.join('\n• ') : '',
    }));
  } else {
    sections = Object.entries(tips).map(([key, val]) => ({
      label: key,
      text: typeof val === 'string' ? val : Array.isArray(val) ? val.join('\n• ') : JSON.stringify(val),
    }));
  }

  const toggle = (i) => {
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="result-section">
      <span className="rs-label">Travel Tips</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map((s, i) => {
          const isOpen = expanded[i] ?? false;
          return (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--warm)',
              borderRadius: '12px',
              cursor: 'pointer',
            }}>
              <div
                onClick={() => toggle(i)}
                style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ fontSize: '12px' }}>{isOpen ? '\u25BE' : '\u25B8'}</span>
                {s.label || s.category || ''}
              </div>
              {isOpen && (
                <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--ink)', marginTop: '6px', whiteSpace: 'pre-line' }}>
                  {s.text ? `• ${s.text}` : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
