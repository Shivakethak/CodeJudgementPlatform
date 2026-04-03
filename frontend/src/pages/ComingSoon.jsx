import React from 'react';
import { Layers } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      color: 'var(--lc-text-secondary)',
      padding: '2rem'
    }}>
      <Layers size={64} style={{ marginBottom: '1rem', color: 'var(--lc-border)' }} />
      <h1 style={{ color: 'var(--lc-text-primary)', marginBottom: '0.5rem' }}>{title}</h1>
      <p>This page is currently under construction. Please check back later!</p>
    </div>
  );
};

export default ComingSoon;
