import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Clock, Users, ChevronRight, Radio } from 'lucide-react';

function Contests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/challenges');
        if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="lc-page lc-page--center">
        <p className="lc-muted">Loading contests…</p>
      </div>
    );
  }

  return (
    <div className="lc-page">
      <section className="lc-contest-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="lc-contest-hero__badge">
          <Trophy size={18} /> Contest hub
        </div>
        <h1 className="lc-contest-title">Live &amp; upcoming rounds</h1>
        <p className="lc-muted" style={{ maxWidth: '640px' }}>
          Join a timed event, solve the problem set, and climb a real-time leaderboard. Scoring: +1 per unique solve, penalty per wrong attempt before that solve.
        </p>
      </section>

      <div className="lc-panel">
        <div className="lc-panel__head">
          <h2>All contests</h2>
          <span className="lc-muted">{items.length} scheduled</span>
        </div>
        {!items.length ? (
          <p className="lc-panel__empty lc-muted">No contests in the catalog yet.</p>
        ) : (
          <div className="lc-table-wrap">
            <table className="lc-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Window</th>
                  <th>Problems</th>
                  <th>Players</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const live = c.isLive;
                  return (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.title}</strong>
                        <div className="lc-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                          {(c.description || '').slice(0, 90)}{(c.description || '').length > 90 ? '…' : ''}
                        </div>
                      </td>
                      <td className="lc-muted" style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                        {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td>{c.problemCount ?? c.problems?.length ?? 0}</td>
                      <td><Users size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{c.participantCount ?? 0}</td>
                      <td>
                        {live ? (
                          <span className="lc-pill lc-pill--status lc-pill--running">
                            <Radio size={12} style={{ marginRight: 4 }} /> Live
                          </span>
                        ) : (
                          <span className="lc-pill lc-pill--timer"><Clock size={12} style={{ marginRight: 4 }} /> Scheduled</span>
                        )}
                      </td>
                      <td className="lc-table-chev">
                        <Link to={`/challenges/${c._id}`} className="lc-btn lc-btn--ghost lc-btn--sm">Open <ChevronRight size={16} /></Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contests;
