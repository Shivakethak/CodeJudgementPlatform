import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { authHeaders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Circle } from 'lucide-react';

const StudyPlanDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [solvedSet, setSolvedSet] = useState(new Set());

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await api.get(`/study-plans/${slug}`);
        if (!c) setPlan(res.data);
      } catch {
        if (!c) setPlan(null);
      }
    })();
    return () => { c = true; };
  }, [slug]);

  useEffect(() => {
    if (!user?.token) return;
    let c = false;
    (async () => {
      try {
        const res = await api.get('/users/stats');
        const ids = (res.data.solvedProblemIds || []).map(String);
        if (!c) setSolvedSet(new Set(ids));
      } catch {
        if (!c) setSolvedSet(new Set());
      }
    })();
    return () => { c = true; };
  }, [user?.token]);

  const setResume = async (problemId) => {
    if (!user?.token) return;
    try {
      await api.put(
        `/study-plans/${slug}/progress`,
        { lastProblemId: problemId },
        { headers: authHeaders(user.token) }
      );
    } catch {
      /* ignore */
    }
  };

  if (!plan) {
    return (
      <div className="lc-page lc-page--center">
        <p className="lc-muted">Loading plan…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '960px', margin: '0 auto' }}>
      <Link to="/study" className="lc-muted" style={{ fontSize: '13px', textDecoration: 'none' }}>← All plans</Link>
      <h1 style={{ marginTop: '12px' }}>{plan.title}</h1>
      <p style={{ marginTop: '10px', fontSize: '15px', color: 'var(--lc-text-secondary)' }}>
        <strong style={{ color: 'var(--lc-accent)' }}>{(plan.problems || []).length}</strong>
        {' '}
        problems in this list
        {plan.problems?.length ? ` · #1–#${plan.problems.length}` : ''}
      </p>
      <p className="lc-muted" style={{ marginTop: '8px', maxWidth: '720px' }}>{plan.description}</p>

      <div className="panel" style={{ marginTop: '24px', padding: 0 }}>
        <table className="lc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Status</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Acceptance</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(plan.problems || []).map((p, i) => {
              const done = solvedSet.has(String(p._id));
              return (
                <tr key={p._id}>
                  <td className="lc-muted">{i + 1}</td>
                  <td>
                    {done ? <CheckCircle2 size={18} color="var(--lc-green)" /> : <Circle size={18} color="var(--lc-text-secondary)" />}
                  </td>
                  <td>{p.title}</td>
                  <td><span className={`difficulty-${p.difficulty}`}>{p.difficulty}</span></td>
                  <td className="lc-muted">{p.acceptanceRate != null ? `${p.acceptanceRate}%` : '—'}</td>
                  <td>
                    <Link
                      to={`/problem/${p._id}`}
                      className="lc-btn lc-btn--accent lc-btn--sm"
                      onClick={() => setResume(p._id)}
                    >
                      Solve
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudyPlanDetail;
