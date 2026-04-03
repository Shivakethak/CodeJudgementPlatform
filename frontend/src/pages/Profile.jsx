import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Calendar as CalendarIcon, Code2, Award } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        
        {/* Left Column: User Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ background: 'var(--lc-bg-layer-2)', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={40} color="var(--lc-text-secondary)" />
            </div>
            <h2 style={{ marginTop: '15px' }}>{user.email.split('@')[0]}</h2>
            <p style={{ color: 'var(--lc-text-secondary)', fontSize: '14px', marginTop: '5px' }}>Rank: ~154,231</p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Edit Profile</button>
          </div>
          
          <div className="panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--lc-border)' }}>
              <Award size={18} /> Badges
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
              <span style={{ padding: '20px', background: 'var(--lc-bg-layer-2)', borderRadius: '50%', color: 'var(--lc-brand)' }} title="100 Days Badge">💯</span>
              <span style={{ padding: '20px', background: 'var(--lc-bg-layer-2)', borderRadius: '50%', color: 'var(--lc-yellow)' }} title="Knight">🛡️</span>
              <span style={{ padding: '20px', background: 'var(--lc-bg-layer-2)', borderRadius: '50%', color: 'var(--lc-blue)' }} title="December Challenge">❄️</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stats and Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stats Bar */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>47</div>
              <div style={{ color: 'var(--lc-text-secondary)', fontSize: '13px' }}>Problems Solved</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--lc-green)' }}>12</div>
              <div style={{ color: 'var(--lc-text-secondary)', fontSize: '13px' }}>Easy</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--lc-yellow)' }}>28</div>
              <div style={{ color: 'var(--lc-text-secondary)', fontSize: '13px' }}>Medium</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--lc-red)' }}>7</div>
              <div style={{ color: 'var(--lc-text-secondary)', fontSize: '13px' }}>Hard</div>
            </div>
          </div>

          {/* Activity Graph (Mocked) */}
          <div className="panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px' }}>
              <CalendarIcon size={18} /> Submissions Canvas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: '4px' }}>
              {Array.from({ length: 156 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: Math.random() > 0.8 ? 'var(--lc-green)' : 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
              ))}
            </div>
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--lc-text-secondary)', textAlign: 'right' }}>153 submissions in the last year</p>
          </div>
          
          {/* Recent Submissions Wrapper */}
          <div className="panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px' }}>
              <Code2 size={18} /> Recent Submissions
            </h3>
            <div style={{ color: 'var(--lc-text-secondary)', textAlign: 'center', padding: '20px' }}>
              Navigate to a problem to see real submission histories.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
