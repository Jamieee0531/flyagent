import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { travelTypes } from '../data/travelTypes.js';
import { getPersonaSvg, getAnimalSvg } from '../data/avatarSvg.js';
import './ResultPage.css';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveProfile } = useAuth();
  const [saved, setSaved] = useState(false);

  const { typeKey, dims: quizDims } = location.state || {};
  const typeData = travelTypes?.[typeKey];
  // Quiz accumulates dims with different keys (escape, restful, slow, urban, etc.)
  // Use the canonical dims from travelTypes which have the correct display keys
  const dims = typeData?.dims || quizDims || {};

  useEffect(() => {
    if (!typeKey || !typeData || saved) return;
    saveProfile({
      mbtiType: typeKey,
      mbtiTitle: typeData.type,
      mbtiSubtitle: typeData.subtitle,
      dimensions: dims,
      pet: typeData.pet ? {
        name: typeData.pet.name,
        type: typeData.pet.type,
        traits: typeData.pet.traits,
      } : undefined,
    }).then(() => setSaved(true)).catch(() => {});
  }, [typeKey, typeData, dims, saveProfile, saved]);

  if (!typeKey || !typeData) {
    return (
      <div className="container">
        <div className="result-screen">
          <p>No quiz result found. <button className="btn-ghost" onClick={() => navigate('/quiz')}>Take quiz</button></p>
        </div>
      </div>
    );
  }

  const dimLabels = [
    { key: 'escape', label: 'Escape', color: 'var(--accent)' },
    { key: 'pace', label: 'Pace', color: 'var(--accent2)' },
    { key: 'nature', label: 'Nature', color: 'var(--sage)' },
    { key: 'solitude', label: 'Solitude', color: 'var(--gold)' },
    { key: 'quality', label: 'Quality', color: 'var(--muted)' },
  ];

  return (
    <div className="container">
      <nav>
        <div className="logo">
          <span className="logo-mark">N</span>
          Nomie
        </div>
        <span className="nav-label">Your Result</span>
      </nav>

      <div className="result-screen">
        <span className="result-eyebrow">Your Travel Soul</span>
        <h1 className="result-type">
          <em>{typeData.type}</em>
        </h1>
        <p className="result-subtitle">{typeData.subtitle}</p>
        <p className="result-desc">{typeData.desc}</p>

        <div className="avatar-duo">
          <div className="avatar-duo-you">
            <div className="avatar-duo-img" dangerouslySetInnerHTML={{ __html: getPersonaSvg(typeKey) }} />
            <span className="avatar-duo-label">YOU</span>
          </div>
          <div className="avatar-duo-meets">&amp;</div>
          <div className="avatar-duo-companion">
            <div className="avatar-duo-img" dangerouslySetInnerHTML={{ __html: getAnimalSvg(typeKey) }} />
            <span className="avatar-duo-label">{typeData.pet?.name?.toUpperCase()}</span>
          </div>
        </div>

        {typeData.pet && (
          <div className="pet-section">
            <div className="pet-info">
              <span className="pet-info-title">Travel Companion</span>
              <span className="pet-name">{typeData.pet.name}</span>
              <span className="pet-type">{typeData.pet.type}</span>
              <div className="pet-traits">
                {typeData.pet.traits?.map((t, i) => (
                  <span key={i} className="pet-trait" style={{
                    background: `rgba(196,89,58,${0.08 + i * 0.04})`,
                    color: 'var(--accent)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="dims-section">
          <span className="dims-title">Your Dimensions</span>
          {dimLabels.map(({ key, label, color }) => (
            <div key={key} className="dim-row">
              <span className="dim-label">{label}</span>
              <div className="dim-track">
                <div className="dim-fill" style={{ width: `${dims?.[key] || 0}%`, background: color }} />
              </div>
              <span className="dim-val">{dims?.[key] || 0}</span>
            </div>
          ))}
        </div>

        <div className="result-cta">
          <button className="btn-primary" onClick={() => navigate('/quickpick', { state: { typeKey, dims } })}>
            Find my trip <span>&#8594;</span>
          </button>
          <button className="btn-ghost" onClick={() => navigate('/quiz')}>
            Retake quiz
          </button>
        </div>
      </div>
    </div>
  );
}
