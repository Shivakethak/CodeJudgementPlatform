import React, { useEffect, useState } from 'react';
import { Compass, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Explore = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await api.get('/explore');
        if (!c) setData(res.data);
      } catch {
        if (!c) setData(null);
      }
    })();
    return () => { c = true; };
  }, []);

  const topics = data?.topics?.length ? data.topics : ['Array', 'Hash Table', 'String', 'SQL', 'Graph'];
  const counts = data?.counts || { easy: 0, medium: 0, hard: 0, total: 0 };

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Compass size={32} color="var(--lc-accent)" />
        <div>
          <h1 style={{ color: 'var(--lc-text-primary)' }}>Explore</h1>
          <p className="lc-muted" style={{ marginTop: '6px' }}>
            {counts.total} problems in catalog · {data?.discussThreads ?? 0} discuss threads
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp color="var(--lc-green)" /> Difficulty mix</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Easy {counts.easy} · Medium {counts.medium} · Hard {counts.hard}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <Link to="/problems?difficulty=Easy" className="lc-btn lc-btn--ghost lc-btn--sm">Easy set</Link>
            <Link to="/problems?difficulty=Medium" className="lc-btn lc-btn--ghost lc-btn--sm">Medium set</Link>
            <Link to="/problems?difficulty=Hard" className="lc-btn lc-btn--ghost lc-btn--sm">Hard set</Link>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen color="var(--lc-blue)" /> Topic tags</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Jump into a tag from the live index.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
            {topics.slice(0, 12).map((t) => (
              <Link key={t} to={`/problems?topic=${encodeURIComponent(t)}`} style={{ textDecoration: 'none' }}>
                <span className="lc-select" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '13px', display: 'inline-block' }}>{t}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock color="var(--lc-yellow)" /> Contests</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Timed rounds with penalty-aware scoring.</p>
          {(data?.upcomingContests || []).length === 0 ? (
            <p className="lc-muted" style={{ marginTop: '12px' }}>No future windows scheduled — join the live weekly cup.</p>
          ) : (
            <ul style={{ marginTop: '12px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.upcomingContests.map((u) => (
                <li key={u._id} style={{ fontSize: '13px' }}>
                  <strong>{u.title}</strong>
                  <span className="lc-muted"> — {new Date(u.startDate).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/challenges" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>Contest hub</Link>
        </div>
      </div>

      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Shortcuts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {(data?.cards || []).map((card) => (
          <Link key={`${card.href}-${card.title}`} to={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="panel lc-explore-card" style={{ padding: '20px', borderLeft: `4px solid ${card.accent}`, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, lineHeight: 1.25 }}>{card.title}</h3>
                {card.count != null && (
                  <span className="lc-explore-card-count" title="Problems in this track">
                    {card.count}
                  </span>
                )}
              </div>
              <p className="lc-muted" style={{ fontSize: '13px', margin: 0 }}>
                {card.count != null && (
                  <span style={{ color: 'var(--lc-accent)', fontWeight: 600, marginRight: '6px' }}>{card.count} problems</span>
                )}
                {card.blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Explore;
