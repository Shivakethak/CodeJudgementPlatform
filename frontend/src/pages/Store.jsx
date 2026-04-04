import React from 'react';
import { ShoppingCart, Award, Zap, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Store = () => {
  const { user, refreshProfile } = useAuth();
  const tokens = user?.tokens ?? 0;

  const redeem = (label) => {
    alert(`${label}: redemption is simulated — earn more tokens by solving problems (+3 per accepted submission).`);
    refreshProfile?.();
  };

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ShoppingCart size={32} color="var(--lc-accent)" />
          <h1 style={{ color: 'var(--lc-text-primary)' }}>Store</h1>
        </div>
        {user && (
          <div className="lc-pill lc-pill--timer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Coins size={16} /> {tokens} tokens
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, rgba(255,161,22,0.12), rgba(0,0,0,0.4))', borderRadius: '12px', marginBottom: '30px', border: '1px solid var(--lc-border)' }}>
        <h2 style={{ color: 'var(--lc-accent)', fontSize: '28px', marginBottom: '10px' }}>Premium</h2>
        <p style={{ color: 'var(--lc-text-secondary)', marginBottom: '20px' }}>Unlock premium-only problems, editorials, and extended contests.</p>
        <button type="button" className="btn btn-primary" style={{ padding: '10px 30px', fontSize: '16px' }} onClick={() => redeem('Premium upgrade')}>
          Upgrade (demo)
        </button>
      </div>

      <h3>Redeem</h3>
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
        <div className="panel" style={{ flex: '1 1 260px', textAlign: 'center' }}>
          <Award size={48} color="var(--lc-blue)" style={{ margin: '0 auto 15px' }} />
          <h4>CodeJudge tee</h4>
          <p style={{ color: 'var(--lc-accent)', marginTop: '10px', fontWeight: 'bold' }}>6000 tokens</p>
          <button type="button" className="btn btn-outline" style={{ marginTop: '15px', width: '100%' }} onClick={() => redeem('T-shirt')}>Redeem</button>
        </div>
        <div className="panel" style={{ flex: '1 1 260px', textAlign: 'center' }}>
          <Zap size={48} color="var(--lc-yellow)" style={{ margin: '0 auto 15px' }} />
          <h4>30-day premium</h4>
          <p style={{ color: 'var(--lc-accent)', marginTop: '10px', fontWeight: 'bold' }}>2000 tokens</p>
          <button type="button" className="btn btn-outline" style={{ marginTop: '15px', width: '100%' }} onClick={() => redeem('Premium')}>Redeem</button>
        </div>
      </div>
    </div>
  );
};

export default Store;
