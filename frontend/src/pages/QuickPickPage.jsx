import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './QuickPickPage.css';

const STEPS = [
  {
    key: 'departure',
    label: 'Step 1 of 4',
    question: 'Where are you flying from?',
    options: ['Singapore', 'Tokyo', 'Shanghai', 'Seoul', 'Bangkok', 'Kuala Lumpur', 'Hong Kong', 'Taipei', 'Other'],
  },
  {
    key: 'companion',
    label: 'Step 2 of 4',
    question: 'Who are you traveling with?',
    options: ['Solo', 'Partner', 'Friends', 'Kids', 'Parents'],
  },
  {
    key: 'budget',
    label: 'Step 3 of 4',
    question: 'What\'s your budget per person?',
    options: ['Under $500', '$500 - $1,000', '$1,000 - $2,000', '$2,000+'],
  },
  {
    key: 'timeWindow',
    label: 'Step 4 of 4',
    question: 'When do you want to go?',
    options: ['Next week', 'This month', 'In 1-2 months', 'Not sure yet'],
  },
];

export default function QuickPickPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});

  const current = STEPS[step];

  const handleSelect = async (value) => {
    const updated = { ...selections, [current.key]: value };
    setSelections(updated);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // All steps done — save to Gateway
      try {
        await saveProfile({ quickPick: updated });
      } catch { /* continue anyway */ }
      navigate('/dashboard');
    }
  };

  return (
    <div className="container">
      <nav>
        <div className="logo">
          <span className="logo-mark">N</span>
          Nomie
        </div>
        <span className="nav-label">Quick Setup</span>
      </nav>

      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <span className="progress-label">{step + 1} / {STEPS.length}</span>
      </div>

      <div className="qp-screen" key={step}>
        <div className="qp-header">
          <span className="qp-step">{current.label}</span>
          <h2 className="qp-question">{current.question}</h2>
        </div>
        <div className="qp-options">
          {current.options.map((opt) => (
            <button
              key={opt}
              className={`qp-option ${selections[current.key] === opt ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
