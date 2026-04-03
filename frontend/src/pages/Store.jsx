import React from 'react';
import { ShoppingCart, Award, Zap } from 'lucide-react';

const Store = () => {
  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <ShoppingCart size={32} color="var(--lc-brand)" />
        <h1 style={{ color: 'var(--lc-text-primary)' }}>Store</h1>
      </div>

      <div style={{ textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, rgba(255,161,22,0.1), rgba(0,0,0,0.5))', borderRadius: '12px', marginBottom: '30px', border: '1px solid var(--lc-border)' }}>
        <h2 style={{ color: 'var(--lc-accent)', fontSize: '28px', marginBottom: '10px' }}>Premium Subscription</h2>
        <p style={{ color: 'var(--lc-text-secondary)', marginBottom: '20px' }}>Unlock editorials, premium-only problems, and advanced debugging.</p>
        <button className="btn btn-primary" style={{ padding: '10px 30px', fontSize: '16px' }}>Upgrade Now</button>
      </div>

      <h3>Redeem Tokens</h3>
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
        <div className="panel" style={{ flex: 1, textAlign: 'center' }}>
          <Award size={48} color="var(--lc-blue)" style={{ margin: '0 auto 15px' }} />
          <h4>CodeJudge T-Shirt</h4>
          <p style={{ color: 'var(--lc-accent)', marginTop: '10px', fontWeight: 'bold' }}>6000 Tokens</p>
          <button className="btn btn-outline" style={{ marginTop: '15px', width: '100%' }}>Redeem</button>
        </div>
        <div className="panel" style={{ flex: 1, textAlign: 'center' }}>
          <Zap size={48} color="var(--lc-yellow)" style={{ margin: '0 auto 15px' }} />
          <h4>1 Month Premium</h4>
          <p style={{ color: 'var(--lc-accent)', marginTop: '10px', fontWeight: 'bold' }}>2000 Tokens</p>
          <button className="btn btn-outline" style={{ marginTop: '15px', width: '100%' }}>Redeem</button>
        </div>
      </div>
    </div>
  );
};

export default Store;
