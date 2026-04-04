import React, { useEffect, useState } from 'react';
import { Briefcase, Building, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Interview = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await api.get('/problems/interview/companies');
        if (!c) setCompanies(res.data || []);
      } catch {
        if (!c) setCompanies([]);
      }
    })();
    return () => { c = true; };
  }, []);

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Briefcase size={32} color="var(--lc-accent)" />
        <div>
          <h1 style={{ color: 'var(--lc-text-primary)' }}>Interview</h1>
          <p className="lc-muted" style={{ marginTop: '6px' }}>Filter the shared problem bank by company tag</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Building color="var(--lc-blue)" /> Companies</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px', marginBottom: '15px' }}>Counts reflect tagged problems in the database.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {companies.length === 0 ? (
              <p className="lc-muted">Loading or no company tags yet.</p>
            ) : companies.map(c => (
              <Link
                key={c.name}
                to={`/problems?company=${encodeURIComponent(c.name)}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--lc-bg-layer-2)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <span className="lc-select" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px' }}>{c.count} problems</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Layers color="var(--lc-green)" /> Mock interview</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Five random problems, single timer, instant score from acceptance rate.</p>
          <Link to="/mock-interview" className="btn btn-primary" style={{ marginTop: '20px', width: '100%', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
            Start mock
          </Link>
          <Link to="/study" className="lc-btn lc-btn--ghost" style={{ marginTop: '12px', width: '100%', display: 'inline-block', textAlign: 'center' }}>
            Study plans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Interview;
