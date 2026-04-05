import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Typing animation hook ─────────────────────────────── */
const useTypingEffect = (text, speed = 80, delay = 300) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout;

    const startTyping = () => {
      timeout = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(timeout);
          setDone(true);
        }
      }, speed);
    };

    const delayTimer = setTimeout(startTyping, delay);
    return () => {
      clearTimeout(delayTimer);
      clearInterval(timeout);
    };
  }, [text, speed, delay]);

  return { displayed, done };
};

/* ── Framer Motion variants ─────────────────────────────── */
const panelLeft = {
  hidden: { x: -60, opacity: 0, filter: 'blur(6px)' },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const panelRight = {
  hidden: { x: 60, opacity: 0, filter: 'blur(6px)' },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const formStagger = {
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
  },
};

const formChild = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

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

  const { displayed: logoText, done: typingDone } = useTypingEffect('CodeJudge', 160, 300);

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
      {/* ── Background glow ── */}
      <div className="auth-glow auth-glow--1" />
      <div className="auth-glow auth-glow--2" />

      {/* ── Left panel ── */}
      <motion.div
        className="lc-auth-panel lc-auth-panel--aside"
        variants={panelLeft}
        initial="hidden"
        animate="visible"
      >
        <div className="lc-auth-aside-inner">
          <div className="lc-brand lc-brand--large">
            <motion.span
              className="lc-brand-icon"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Code2 size={28} />
            </motion.span>
            <span className="lc-brand-name auth-typing-logo">
              {logoText}
              <span className={`auth-cursor ${typingDone ? 'auth-cursor--blink' : ''}`}>_</span>
            </span>
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
      </motion.div>

      {/* ── Right panel ── */}
      <motion.div
        className="lc-auth-panel lc-auth-panel--form"
        variants={panelRight}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="lc-auth-form-card auth-glass"
          variants={formStagger}
          initial="hidden"
          animate="visible"
        >
          {reason === 'session' && (
            <motion.div className="lc-banner lc-banner--warn" variants={formChild}>
              Your session expired. Please sign in again.
            </motion.div>
          )}
          <motion.h1 className="lc-auth-title" variants={formChild}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </motion.h1>
          <motion.p className="lc-muted lc-auth-sub" variants={formChild}>
            {isLogin ? 'Sign in to register for contests and sync submissions.' : 'Join thousands of practice sessions (demo).'}
          </motion.p>

          {error && (
            <motion.div
              className="lc-banner lc-banner--error"
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="lc-auth-form">
            <motion.label className="lc-label" variants={formChild}>Email</motion.label>
            <motion.input
              type="email"
              required
              className="lc-input auth-input-enhanced"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              variants={formChild}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            <motion.label className="lc-label" variants={formChild}>Password</motion.label>
            <motion.input
              type="password"
              required
              className="lc-input auth-input-enhanced"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              variants={formChild}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            <motion.button
              type="submit"
              className="lc-btn lc-btn--accent lc-btn--block"
              disabled={loading}
              variants={formChild}
              whileHover={{ scale: 1.03, filter: 'brightness(1.15)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {loading ? <span className="spinner" /> : isLogin ? 'Sign in' : 'Sign up'}
            </motion.button>
          </form>

          <motion.p className="lc-auth-switch" variants={formChild}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="lc-link-btn"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </motion.p>
          <motion.div variants={formChild}>
            <Link to="/" className="lc-auth-back">← Back to problems</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
