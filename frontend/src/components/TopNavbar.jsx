import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Code2, LogOut, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const TopNavbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="top-navbar">
      <Link to="/" className="navbar-brand">
        <Code2 style={{ display: 'inline', marginRight: '8px' }} />
        CodeJudge
      </Link>
      
      <div className="navbar-links-center">
        <NavLink to="/explore" className={({isActive}) => isActive ? "active" : ""}>Explore</NavLink>
        <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Problems</NavLink>
        <NavLink to="/challenges" className={({isActive}) => isActive ? "active" : ""}>Contest</NavLink>
        <NavLink to="/discuss" className={({isActive}) => isActive ? "active" : ""}>Discuss</NavLink>
        <NavLink to="/interview" className={({isActive}) => isActive ? "active" : ""}>Interview</NavLink>
        <NavLink to="/store" className={({isActive}) => isActive ? "active premium-text" : "premium-text"}>Store</NavLink>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/profile" className="user-profile-badge" style={{ textDecoration: 'none' }}>
              <UserIcon size={18} />
              <span className="user-email">{(user.email || 'User').split('@')[0]}</span>
            </Link>
            <button onClick={logout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--lc-bg-layer-2)', color: 'var(--lc-text-secondary)', border: '1px solid var(--lc-border)' }}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '6px 14px', background: 'var(--lc-bg-layer-2)', color: '#fff', border: '1px solid var(--lc-border)' }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default TopNavbar;
