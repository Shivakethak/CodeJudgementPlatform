import React, { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reason = params.get('reason');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lc-auth-page">
      <div className="lc-auth-panel lc-auth-panel--aside">
        <div className="lc-auth-aside-inner">
          <div className="lc-brand lc-brand--large">
            <span className="lc-brand-icon"><Code2 size={28} /></span>
            <span className="lc-brand-name">CodeJudge</span>
          </div>
          <h2 className="lc-auth-headline">Level up with a real judge</h2>
          <p className="lc-auth-copy">
            Docker-isolated runs, BullMQ queues, Socket.IO leaderboards, and a UI inspired by the platforms you already know.
          </p>
          <ul className="lc-auth-bullets">
            <li>Multi-language submissions</li>
            <li>Weekly contests &amp; live rankings</li>
            <li>Production-minded API &amp; worker split</li>
          </ul>
        </div>
      </div>

      <div className="lc-auth-panel lc-auth-panel--form">
        <div className="lc-auth-form-card">
          {reason === 'session' && (
            <div className="lc-banner lc-banner--warn">
              Your session expired. Please sign in again.
            </div>
          )}
          <h1 className="lc-auth-title">{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p className="lc-muted lc-auth-sub">
            {isLogin ? 'Sign in to register for contests and sync submissions.' : 'Join thousands of practice sessions (demo).'}
          </p>

          {error && (
            <div className="lc-banner lc-banner--error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lc-auth-form">
            <label className="lc-label">Email</label>
            <input
              type="email"
              required
              className="lc-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <label className="lc-label">Password</label>
            <input
              type="password"
              required
              className="lc-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button type="submit" className="lc-btn lc-btn--accent lc-btn--block" disabled={loading}>
              {loading ? <span className="spinner" /> : isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          <p className="lc-auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="lc-link-btn"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          <Link to="/" className="lc-auth-back">← Back to problems</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
