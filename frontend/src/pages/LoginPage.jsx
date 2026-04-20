import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const emailOk = isValidEmail(email);
  const passwordOk = password.length >= 8;

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });
    if (!emailOk || !passwordOk) return;

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, displayName);
        navigate('/intro');
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (reg) => {
    setIsRegister(reg);
    setError('');
    setTouched({ email: false, password: false });
  };

  const showEmailError = touched.email && !emailOk && email.length > 0;
  const showPwdHint = password.length > 0 || touched.password;
  const pwdStrength = Math.min(password.length / 8, 1);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-mark">N</span>
            Nomie
          </div>
          <p className="login-subtitle">Discover your travel soul</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${isRegister ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="displayName">Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              placeholder="your@email.com"
              className={showEmailError ? 'field-error' : ''}
            />
            {showEmailError && (
              <span className="field-hint error">Please enter a valid email address</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              placeholder="8+ characters"
              className={touched.password && !passwordOk ? 'field-error' : ''}
            />
            {showPwdHint && (
              <div className="pwd-hint-row">
                <div className="pwd-bar">
                  <div
                    className="pwd-bar-fill"
                    style={{
                      width: `${pwdStrength * 100}%`,
                      background: passwordOk ? 'var(--sage)' : 'var(--accent)',
                    }}
                  />
                </div>
                <span className={`field-hint ${passwordOk ? 'ok' : ''}`}>
                  {passwordOk ? '✓ Good' : `${password.length} / 8`}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary login-submit"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            {!submitting && <span className="arrow">&#8594;</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
