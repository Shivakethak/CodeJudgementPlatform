import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Code2, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const TopNavbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="top-navbar lc-topnav">
      <Link to="/" className="navbar-brand lc-brand">
        <span className="lc-brand-icon"><Code2 size={22} strokeWidth={2.2} /></span>
        <span className="lc-brand-text">
          <span className="lc-brand-name">CodeJudge</span>
          <span className="lc-brand-tag">Judge</span>
        </span>
      </Link>

      <div className="navbar-links-center lc-topnav-links">
        <NavLink to="/explore" className={({ isActive }) => (isActive ? 'active' : '')}>
          Explore
        </NavLink>
        <NavLink to="/problems" className={({ isActive }) => (isActive ? 'active' : '')}>
          Problems
        </NavLink>
        <NavLink to="/challenges" className={({ isActive }) => (isActive ? 'active' : '')}>
          Contest
        </NavLink>
        <NavLink to="/discuss" className={({ isActive }) => (isActive ? 'active' : '')}>
          Discuss
        </NavLink>
        <NavLink to="/interview" className={({ isActive }) => (isActive ? 'active' : '')}>
          Interview
        </NavLink>
        <NavLink to="/store" className={({ isActive }) => `premium-text ${isActive ? 'active' : ''}`}>
          Store
        </NavLink>
      </div>

      <div className="navbar-right lc-topnav-right">
        {user ? (
          <>
            <Link to="/profile" className="user-profile-badge" style={{ textDecoration: 'none' }} title={user.tagline ? `${user.displayName || ''} — ${user.tagline}` : (user.email || '')}>
              <span className="user-avatar-initials" aria-hidden>
                {(user.displayName || (user.email || 'U').split('@')[0]).slice(0, 2).toUpperCase()}
              </span>
              <span className="user-email">
                <span className="user-display-name">{user.displayName || (user.email || 'User').split('@')[0]}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="lc-icon-btn"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" className="lc-btn lc-btn--accent lc-btn--sm">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default TopNavbar;
