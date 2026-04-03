import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span style={{color: 'var(--lc-accent)', fontSize: '20px'}}>&lt;/&gt;</span>
        CodeJudge
      </Link>
      
      <div className="nav-links">
        <Link to="/">Problems</Link>
        {user ? (
          <>
            {user.isPremiumStatus ? (
              <span className="premium-tag">Premium Member</span>
            ) : (
              <a href="#" className="premium-text">Premium</a>
            )}
            <span style={{ color: 'var(--lc-text-tertiary)', marginLeft: '10px' }}>
              {user.email.split('@')[0]}
            </span>
            <button onClick={handleLogout} className="btn btn-primary" style={{ marginLeft: '10px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="premium-text" style={{ fontWeight: 600 }}>Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
