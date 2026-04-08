import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './IntroPage.css';

export default function IntroPage() {
  const navigate = useNavigate();
  const { hasCompletedMbti } = useAuth();

  if (hasCompletedMbti) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="container">
      <nav>
        <div className="logo">
          <span className="logo-mark">N</span>
          Nomie
        </div>
        <span className="nav-label">Travel Soul Quiz</span>
      </nav>

      <div className="intro-screen">
        <span className="intro-eyebrow">Your Journey Starts Here</span>
        <h1 className="intro-title">
          Discover Your<br /><em>Travel Soul</em>
        </h1>
        <p className="intro-sub">
          Five quick questions to reveal your travel personality,
          matched with a companion who gets your vibe.
        </p>
        <button className="btn-start" onClick={() => navigate('/quiz')}>
          Begin <span className="arrow">&#8594;</span>
        </button>
        <div className="intro-footer">
          <span>5 questions</span>
          <span className="dot" />
          <span>About 90 seconds</span>
        </div>
      </div>
    </div>
  );
}
