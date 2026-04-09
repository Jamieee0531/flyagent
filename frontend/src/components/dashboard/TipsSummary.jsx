import { useState } from 'react';
import './TipsSummary.css';

const CATEGORY_ICONS = {
  visa: '🛂', weather: '🌤', transport: '🚇', currency: '💱',
  connectivity: '📶', safety: '🛡', food: '🍜', culture: '🏛',
  health: '🏥', accommodation: '🏨', shopping: '🛍', tips: '💡',
};

function getCategoryIcon(label) {
  if (!label) return '💡';
  const key = label.toLowerCase().split(/[\s_/]/)[0];
  return CATEGORY_ICONS[key] || '💡';
}

export default function TipsSummary({ tips }) {
  const [expanded, setExpanded] = useState({});

  if (!tips) return null;

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

  const toggle = (i) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="result-section">
      <span className="rs-label">Travel Tips</span>
      <div className="tips-list">
        {sections.map((s, i) => {
          const isOpen = expanded[i] ?? false;
          return (
            <div key={i} className="tips-item" onClick={() => toggle(i)}>
              <div className="tips-header">
                <span>{getCategoryIcon(s.label)}</span>
                <span className="tips-label">{s.label}</span>
                <span className={`tips-chevron ${isOpen ? 'open' : ''}`}>▸</span>
              </div>
              {isOpen && (
                <div className="tips-body">
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
