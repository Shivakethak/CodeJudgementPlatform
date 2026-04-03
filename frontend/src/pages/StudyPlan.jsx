import React from 'react';
import { BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudyPlan = () => {
  const plans = [
    { title: 'Top Interview 150', desc: 'Must-do list for top tech companies', total: 150, completed: 15, color: '#f59e0b' },
    { title: 'LeetCode 75', desc: 'Ace Coding Interview with 75 Qs', total: 75, completed: 5, color: '#10b981' },
    { title: 'SQL 50', desc: 'Crack SQL Interview in 50 Qs', total: 50, completed: 0, color: '#3b82f6' }
  ];

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <BookOpen size={32} color="var(--lc-brand)" />
        <h1 style={{ color: 'var(--lc-text-primary)' }}>Study Plan</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {plans.map(plan => (
          <div key={plan.title} className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: plan.color }}>{plan.title}</h3>
            <p style={{ color: 'var(--lc-text-secondary)', fontSize: '14px', flex: 1 }}>{plan.desc}</p>
            
            <div style={{ background: 'var(--lc-bg-layer-2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(plan.completed / plan.total) * 100}%`, height: '100%', background: plan.color }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--lc-text-secondary)' }}>
                {plan.completed} / {plan.total} Solved
              </span>
              <Link to="/problems" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '13px' }}>Resume</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlan;
