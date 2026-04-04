import React, { useEffect, useState } from 'react';
import api from '../services/api';

const RightSidebar = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString('default', { month: 'short' });
  const year = currentDate.getFullYear();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/users/sidebar-summary');
        if (!cancelled) setSummary(res.data);
      } catch {
        if (!cancelled) setSummary(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const daysInCurrentMonth = getDaysInMonth(currentDate.getMonth() + 1, year);
  const streak = summary?.calendar?.streakDays ?? 0;

  const weekly = summary?.weekly;
  const pct = weekly && weekly.total > 0
    ? Math.round((weekly.solved / weekly.total) * 100)
    : 0;

  let endsLabel = '—';
  if (weekly?.endsAt) {
    const ms = new Date(weekly.endsAt).getTime() - Date.now();
    const d = Math.max(0, Math.ceil(ms / (86400000)));
    endsLabel = d === 0 ? 'Ends today' : `${d} day${d !== 1 ? 's' : ''} left`;
  }

  return (
    <div className="right-sidebar">
      <div className="widget-card calendar-widget">
        <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className="cal-month">{month} {year}</span>
          <span style={{ fontSize: '12px', color: 'var(--lc-text-secondary)' }}>
            Streak: <strong style={{ color: 'var(--lc-accent)' }}>{streak} day{streak !== 1 ? 's' : ''}</strong>
          </span>
        </div>
        <div className="calendar-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '10px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--lc-text-secondary)' }}>{d}</div>
            ))}
            {Array.from({ length: new Date(year, currentDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const currentDay = i + 1;
              const isToday = currentDay === day;
              return (
                <div
                  key={currentDay}
                  title={`${month} ${currentDay}, ${year}`}
                  style={{
                    aspectRatio: '1/1',
                    background: isToday ? 'var(--lc-accent)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: isToday ? '#000' : 'var(--lc-text-secondary)',
                    fontWeight: isToday ? 'bold' : 'normal'
                  }}
                >
                  {currentDay}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="widget-card weekly-challenge-widget">
        <h3 className="widget-title">Weekly challenge</h3>
        <p className="widget-subtitle">
          {weekly?.title || 'No active contest right now — browse scheduled events.'}
        </p>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
          <span style={{ color: 'var(--lc-accent)' }}>
            {weekly ? `${weekly.solved} / ${weekly.total} solved` : '—'}
          </span>
          <span style={{ color: 'var(--lc-text-secondary)' }}>{endsLabel}</span>
        </div>
      </div>

      <div className="widget-card trending-companies">
        <h3 className="widget-title">Trending companies</h3>
        <div className="companies-list">
          {(summary?.trendingCompanies?.length ? summary.trendingCompanies : [
            { name: 'Google', count: 0 },
            { name: 'Amazon', count: 0 },
            { name: 'Meta', count: 0 },
            { name: 'Microsoft', count: 0 },
            { name: 'Apple', count: 0 }
          ]).map((c) => (
            <div className="company-item" key={c.name}>
              <span className="company-name">{c.name}</span>
              <span className="company-count">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
