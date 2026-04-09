import { getPersonaSvg } from '../../data/avatarSvg.js';
import './ProfilePanel.css';

const dimLabels = [
  { key: 'escape', label: 'Escape', color: 'var(--accent)' },
  { key: 'pace', label: 'Pace', color: 'var(--accent2)' },
  { key: 'nature', label: 'Nature', color: 'var(--sage)' },
  { key: 'solitude', label: 'Solitude', color: 'var(--gold)' },
  { key: 'quality', label: 'Quality', color: 'var(--muted)' },
];

export default function ProfilePanel({ profile }) {
  if (!profile) return null;
  const dims = profile.dimensions || {};
  const qp = profile.quickPick || {};

  return (
    <>
      <div className="profile-hero">
        <div className="persona-row">
          <div className="persona-avatar" dangerouslySetInnerHTML={{ __html: getPersonaSvg(profile.mbtiType) || '' }} />
          <div>
            <div className="persona-name">{profile.mbtiTitle || profile.mbtiType || 'Traveler'}</div>
            <div className="persona-subtitle">{profile.mbtiSubtitle || ''}</div>
          </div>
        </div>

        <div className="mbti-badge">
          <span className="mbti-label">Travel Personality</span>
          <span className="mbti-type">{profile.mbtiTitle || profile.mbtiType}</span>
          <span className="mbti-sub">{profile.mbtiSubtitle || ''}</span>
        </div>

        <div className="dim-bars">
          {dimLabels.map(({ key, label, color }) => (
            <div key={key} className="dim-row-sm">
              <span className="dim-label-sm">{label}</span>
              <div className="dim-track-sm">
                <div className="dim-fill-sm" style={{ width: `${dims[key] || 0}%`, background: color }} />
              </div>
              <span className="dim-val-sm">{dims[key] || 0}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <span className="ps-label">Trip Constraints</span>
        {qp.departure && <div className="constraint-item"><span className="ci-key">From</span><span className="ci-val">{qp.departure}</span></div>}
        {qp.companion && <div className="constraint-item"><span className="ci-key">With</span><span className="ci-val">{qp.companion}</span></div>}
        {qp.budget && <div className="constraint-item"><span className="ci-key">Budget</span><span className="ci-val">{qp.budget}</span></div>}
        {qp.timeWindow && <div className="constraint-item"><span className="ci-key">When</span><span className="ci-val">{qp.timeWindow}</span></div>}
      </div>
    </>
  );
}
