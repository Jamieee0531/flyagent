import { useState } from 'react';
import './ItineraryDay.css';

const STOP_COLORS = [
  '#c4593a', '#3a6b8a', '#b8873c', '#4a6b5a', '#9b9488', '#7c5cbf',
];

function getStopColor(stop, idx) {
  if (stop.color) return stop.color;
  return STOP_COLORS[idx % STOP_COLORS.length];
}

function getTransportIcon(transport) {
  if (!transport) return '🚶';
  const t = transport.toLowerCase();
  if (t.includes('taxi') || t.includes('grab')) return '🚕';
  if (t.includes('tuk')) return '🛺';
  if (t.includes('drive') || t.includes('car')) return '🚗';
  if (t.includes('subway') || t.includes('mrt') || t.includes('bts') || t.includes('rail')) return '🚇';
  if (t.includes('bus')) return '🚌';
  if (t.includes('boat') || t.includes('ferry')) return '⛵';
  if (t.includes('bike') || t.includes('bicycle')) return '🚲';
  if (t.includes('walk')) return '🚶';
  return '🚶';
}

export default function ItineraryDay({ day, onUpdate }) {
  const [editIdx, setEditIdx] = useState(-1);
  const [editForm, setEditForm] = useState({});

  if (!day) return <div className="itin-empty">No itinerary data for this day.</div>;

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditForm({ ...day.stops[idx] });
  };

  const handleSave = () => {
    const updated = {
      ...day,
      stops: day.stops.map((s, i) => i === editIdx ? { ...editForm } : s),
    };
    onUpdate(updated);
    setEditIdx(-1);
  };

  const handleDelete = (idx) => {
    const updated = {
      ...day,
      stops: day.stops.filter((_, i) => i !== idx),
    };
    onUpdate(updated);
  };

  const handleAddStop = () => {
    const updated = {
      ...day,
      stops: [...(day.stops || []), { time: '', name: 'New Stop', description: '', transport: '' }],
    };
    onUpdate(updated);
  };

  const stops = day.stops || [];

  return (
    <div className="itin-day">
      {/* Day theme banner */}
      {day.theme && (
        <div className="wx-banner">
          <span className="wx-banner-icon">📍</span>
          <span className="wx-banner-label">Day {day.day} &middot; {day.theme}</span>
          <span className="wx-banner-count">{stops.length} stops</span>
        </div>
      )}

      {stops.map((stop, i) => {
        const color = getStopColor(stop, i);
        const isLast = i === stops.length - 1;
        const transIcon = getTransportIcon(stop.transport);
        const transLabel = stop.transport || 'Walk';

        return (
          <div key={i}>
            {/* Edit mode */}
            {editIdx === i ? (
              <div className="itin-stop-editing">
                <div className="stop-edit-form">
                  <input value={editForm.time || ''} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} placeholder="Time (e.g. 09:00-10:30)" className="stop-input" />
                  <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Place name" className="stop-input" />
                  <input value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="stop-input" />
                  <input value={editForm.transport || ''} onChange={(e) => setEditForm({ ...editForm, transport: e.target.value })} placeholder="Transport to next stop" className="stop-input" />
                  <div className="stop-edit-actions">
                    <button className="btn-primary stop-save-btn" onClick={handleSave}>Save</button>
                    <button className="btn-ghost stop-cancel-btn" onClick={() => setEditIdx(-1)}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              /* Trip card — matches prototype structure */
              <div className="trip-card">
                <div className="tc-left">
                  <div className="tc-num" style={{ background: color }}>{i + 1}</div>
                  {!isLast && <div className="tc-thread" />}
                </div>
                <div className="tc-inner">
                  <div className="tc-body">
                    <div className="tc-type-row">
                      <div className="tc-type-dot" style={{ background: color }} />
                      <span className="tc-type-label">{stop.category || stop.type || ''}</span>
                      <span className="tc-time">{stop.time || ''}</span>
                    </div>
                    <div className="tc-name">{stop.name}</div>
                    {stop.description && <div className="tc-meta"><span>{stop.description}</span></div>}
                  </div>
                  {stop.emoji && (
                    <div className="tc-img" style={{ background: `${color}22` }}>{stop.emoji}</div>
                  )}
                </div>
                <div className="stop-actions">
                  <button className="stop-action-btn stop-action-edit" onClick={() => handleEdit(i)} title="Edit">&#9998;</button>
                  <button className="stop-action-btn stop-action-del" onClick={() => handleDelete(i)} title="Remove">&times;</button>
                </div>
              </div>
            )}

            {/* Transport connector */}
            {!isLast && stop.transport && editIdx !== i && (
              <div className="transport-line">
                <div className="tl-line" />
                <div className="tl-info">
                  <span>{transIcon}</span>
                  <span>{transLabel}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button className="add-stop-bar-btn" onClick={handleAddStop}>
        <span className="add-stop-bar-icon">+</span> Add stop
      </button>
    </div>
  );
}
