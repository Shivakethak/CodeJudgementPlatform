import React from 'react';
import { Briefcase, Building, Layers } from 'lucide-react';

const Interview = () => {
  const companies = [
    { name: 'Google', count: 124, icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Amazon', count: 89, icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Meta', count: 76, icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Microsoft', count: 54, icon: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
  ];

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Briefcase size={32} color="var(--lc-brand)" />
        <h1 style={{ color: 'var(--lc-text-primary)' }}>Interview Preparation</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Building color="var(--lc-blue)" /> Top Companies</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px', marginBottom: '15px' }}>Practice questions asked in recent interviews.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {companies.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--lc-bg-layer-2)', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{c.name}</span>
                <span className="lc-select" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px' }}>{c.count} questions</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Layers color="var(--lc-green)" /> Assessment Mock</h2>
           <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Take a 90-minute mock assessment replicating real interview conditions.</p>
           <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>Start Mock Assessment</button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
