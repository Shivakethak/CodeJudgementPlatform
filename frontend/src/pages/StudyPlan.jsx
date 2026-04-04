import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

const StudyPlan = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await api.get('/study-plans');
        if (!c) setPlans(res.data || []);
      } catch {
        if (!c) setPlans([]);
      }
    })();
    return () => { c = true; };
  }, []);

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <BookOpen size={32} color="var(--lc-accent)" />
        <div>
          <h1 style={{ color: 'var(--lc-text-primary)' }}>Study plans</h1>
          <p className="lc-muted" style={{ fontSize: '13px' }}>Progress merges with your accepted submissions automatically</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {plans.map((plan, idx) => {
          const color = COLORS[idx % COLORS.length];
          const pct = plan.total > 0 ? Math.round((plan.solved / plan.total) * 100) : 0;
          const resumeTo = plan.lastProblemId ? `/problem/${plan.lastProblemId}` : `/study/${plan.slug}`;
          return (
            <div key={plan.slug} className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <h3 style={{ color, margin: 0, flex: 1 }}>{plan.title}</h3>
                <div style={{ textAlign: 'right' }}>
                  <div className="study-plan-count" style={{ color }}>{plan.total}</div>
                  <div className="study-plan-count-label">problems</div>
                </div>
              </div>
              <p style={{ color: 'var(--lc-text-secondary)', fontSize: '14px', flex: 1 }}>{plan.description}</p>
              <div style={{ background: 'var(--lc-bg-layer-2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--lc-text-secondary)' }}>
                  {plan.solved} / {plan.total} solved
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/study/${plan.slug}`} className="lc-btn lc-btn--ghost lc-btn--sm">Open list</Link>
                  <Link to={resumeTo} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '13px' }}>Resume</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyPlan;
