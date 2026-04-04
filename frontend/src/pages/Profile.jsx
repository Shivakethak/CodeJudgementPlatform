import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Code2, Award } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import api, { authHeaders } from '../services/api';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [data, setData] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    let c = false;
    (async () => {
      try {
        const res = await api.get('/users/profile', { headers: authHeaders(user.token) });
        if (!c) {
          setData(res.data);
          const u = res.data?.user;
          setDisplayName(u?.displayName || (u?.email || '').split('@')[0] || '');
          setTagline(u?.tagline || '');
        }
      } catch {
        if (!c) setData(null);
      }
    })();
    return () => { c = true; };
  }, [user?.token]);

  const handleSavePersona = async (e) => {
    e.preventDefault();
    if (!user?.token) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await api.patch('/users/profile', { displayName, tagline }, { headers: authHeaders(user.token) });
      const res = await api.get('/users/profile', { headers: authHeaders(user.token) });
      setData(res.data);
      await refreshProfile?.();
      setSaveMsg('Saved.');
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const u = data?.user || user;
  const streak = u?.streak?.count ?? user.streakDays ?? 0;
  const subs = data?.recentSubmissions || [];
  const solved = data?.solvedCount ?? 0;
  const initials = (displayName || (u.email || 'U').split('@')[0]).slice(0, 2).toUpperCase();

  return (
    <div className="container profile-page">
      <div className="profile-grid">
        <div className="profile-col profile-col--aside">
          <div className="panel profile-persona">
            <div className="profile-persona-header">
              <span className="profile-avatar-lg" aria-hidden>{initials}</span>
              <div className="profile-persona-titles">
                <h1 className="profile-heading">{displayName || (u.email || '').split('@')[0]}</h1>
                <p className="profile-email">{u.email || user.email}</p>
              </div>
            </div>

            <form className="profile-persona-form" onSubmit={handleSavePersona}>
              <label className="profile-label" htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                className="profile-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="How you appear in the app"
                autoComplete="nickname"
              />
              <label className="profile-label" htmlFor="tagline">One-line bio</label>
              <textarea
                id="tagline"
                className="profile-input profile-textarea"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={160}
                rows={2}
                placeholder="e.g. CS undergrad · Python & algorithms"
              />
              <div className="profile-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
                {saveMsg ? <span className="lc-muted" style={{ fontSize: '13px' }}>{saveMsg}</span> : null}
              </div>
            </form>

            <p className="profile-streak-line">Streak: <strong>{streak}</strong> day{streak !== 1 ? 's' : ''}</p>
            <p className="lc-muted profile-tokens">Tokens: {u.tokens ?? user.tokens ?? 0}</p>
            <Link to="/store" className="btn btn-primary profile-store-btn">Store</Link>
          </div>

          <div className="panel">
            <h3 className="profile-section-title">
              <Award size={18} /> Milestones
            </h3>
            <ul className="profile-milestones">
              <li>Real Docker sandboxes + Redis queue</li>
              <li>Verdicts from compiled/running your code (not string-matched to stored answers)</li>
              <li>Multi-language + SQL track</li>
            </ul>
          </div>
        </div>

        <div className="profile-col profile-col--main">
          <div className="panel profile-stats-row">
            <div className="profile-stat">
              <div className="profile-stat-value">{solved}</div>
              <div className="profile-stat-label">Accepted problems</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{subs.length}</div>
              <div className="profile-stat-label">Recent submissions</div>
            </div>
            <div className="profile-stat">
              <div className={`profile-stat-value ${u.isPremiumStatus ? 'profile-stat-value--accent' : ''}`}>
                {u.isPremiumStatus ? 'Pro' : 'Free'}
              </div>
              <div className="profile-stat-label">Plan</div>
            </div>
          </div>

          <div className="panel">
            <h3 className="profile-section-title">
              <CalendarIcon size={18} /> Activity (aggregated)
            </h3>
            <p className="lc-muted profile-section-desc">
              Submission counts grouped by calendar day (sample heat strip).
            </p>
            <div className="profile-heat">
              {(data?.activityByDay || []).slice(0, 52).map((row, i) => (
                <div
                  key={i}
                  title={`${row._id?.y}-${row._id?.m}-${row._id?.d}`}
                  className={`profile-heat-cell ${row.count > 2 ? 'hot' : row.count > 0 ? 'warm' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="profile-section-title">
              <Code2 size={18} /> Recent submissions
            </h3>
            {!subs.length ? (
              <p className="lc-muted profile-empty">Solve a problem to populate this feed.</p>
            ) : (
              <table className="problemset-table profile-table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Verdict</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <Link to={`/problem/${s.problemId?._id || s.problemId}`} className="lc-table-link">
                          {s.problemId?.title || 'Problem'}
                        </Link>
                      </td>
                      <td className={`status-${(s.verdict || 'Pending').split(/[\s.]/)[0]}`}>{s.verdict}</td>
                      <td className="lc-muted">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
