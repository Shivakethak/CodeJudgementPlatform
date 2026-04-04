import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Code2,
  Award,
  Eye,
  BookOpen,
  MessageCircle,
  Star,
  MapPin,
  Trophy,
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import api, { authHeaders } from '../services/api';

function SolvedDonut({ solved, total }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const p = total > 0 ? Math.min(1, solved / total) : 0;
  const offset = c * (1 - p);
  return (
    <svg className="profile-donut" viewBox="0 0 120 120" aria-hidden>
      <circle className="profile-donut__track" cx="60" cy="60" r={r} fill="none" strokeWidth="9" />
      <circle
        className="profile-donut__arc"
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
}

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [submissionTab, setSubmissionTab] = useState('recent');

  useEffect(() => {
    if (!user?.token) return;
    let c = false;
    (async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/users/profile', { headers: authHeaders(user.token) }),
          api.get('/users/stats').catch(() => ({ data: null })),
        ]);
        if (!c) {
          setData(profileRes.data);
          setStats(statsRes.data);
          const u = profileRes.data?.user;
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

  const activitySeries = useMemo(() => {
    const rows = [...(data?.activityByDay || [])].reverse().slice(-14);
    const max = Math.max(1, ...rows.map((x) => x.count || 0));
    return rows.map((x) => ({ ...x, n: (x.count || 0) / max }));
  }, [data?.activityByDay]);

  if (!user) return <Navigate to="/login" replace />;

  const u = data?.user || user;
  const streak = u?.streak?.count ?? user.streakDays ?? 0;
  const subs = data?.recentSubmissions || [];
  const solvedProfile = data?.solvedCount ?? 0;

  const totals = stats?.totals;
  const st = stats?.stats;
  const totalAll = totals?.all ?? 0;
  const solvedTotal = st?.totalSolved ?? solvedProfile;
  const easyS = st?.easy ?? 0;
  const medS = st?.medium ?? 0;
  const hardS = st?.hard ?? 0;
  const easyT = totals?.easy ?? 0;
  const medT = totals?.medium ?? 0;
  const hardT = totals?.hard ?? 0;

  const initials = (displayName || (u.email || 'U').split('@')[0]).slice(0, 2).toUpperCase();
  const handleSlug = (displayName || (u.email || 'user').split('@')[0]).toLowerCase().replace(/\s+/g, '_');

  const filteredSubs = submissionTab === 'ac'
    ? subs.filter((s) => s.verdict === 'Accepted')
    : subs;

  return (
    <div className="container profile-page profile-page--lc">
      <div className="profile-lc-grid">
        <aside className="profile-lc-aside">
          <div className="panel profile-lc-persona">
            <div className="profile-lc-avatar-wrap">
              <span className="profile-avatar-lc-square" aria-hidden>{initials}</span>
            </div>
            <h1 className="profile-lc-username">{displayName || (u.email || '').split('@')[0]}</h1>
            <p className="profile-lc-handle">@{handleSlug}</p>
            <p className="profile-lc-rank-line">
              <span className="profile-lc-rank-label">Solved</span>
              <span className="profile-lc-rank-val">{solvedTotal}</span>
              <span className="profile-lc-rank-sep">·</span>
              <span className="profile-lc-rank-muted">{totalAll ? `${totalAll} in bank` : 'problem bank'}</span>
            </p>

            <p className="profile-lc-bio">{tagline || <span className="profile-lc-bio-placeholder">Add a short bio in the form below.</span>}</p>

            <div className="profile-lc-follow-row">
              <span><strong>0</strong> Following</span>
              <span><strong>0</strong> Followers</span>
            </div>

            <button type="submit" form="profile-persona-form" className="profile-lc-edit-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>

            <div className="profile-lc-location">
              <MapPin size={14} aria-hidden />
              <span>Profile</span>
            </div>

            <form id="profile-persona-form" className="profile-lc-form" onSubmit={handleSavePersona}>
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
                {saveMsg ? <span className="lc-muted" style={{ fontSize: '13px' }}>{saveMsg}</span> : null}
              </div>
            </form>

            <ul className="profile-lc-community">
              <li><Eye size={16} aria-hidden /><span>Views</span><strong>—</strong></li>
              <li><BookOpen size={16} aria-hidden /><span>Solution</span><strong>{solvedTotal}</strong></li>
              <li><MessageCircle size={16} aria-hidden /><span>Discuss</span><strong>0</strong></li>
              <li><Star size={16} aria-hidden /><span>Reputation</span><strong>{u.tokens ?? user.tokens ?? 0}</strong></li>
            </ul>

            <p className="profile-streak-line profile-lc-streak">Streak: <strong>{streak}</strong> day{streak !== 1 ? 's' : ''}</p>
            <p className="lc-muted profile-tokens">Tokens: {u.tokens ?? user.tokens ?? 0}</p>
            <Link to="/store" className="btn btn-primary profile-store-btn">Store</Link>
          </div>
        </aside>

        <div className="profile-lc-main">
          <section className="panel profile-lc-card profile-lc-contest">
            <div className="profile-lc-contest-head">
              <Trophy size={18} aria-hidden />
              <h2>Activity overview</h2>
            </div>
            <div className="profile-lc-contest-stats">
              <div>
                <span className="profile-lc-contest-label">Recent submissions</span>
                <span className="profile-lc-contest-num">{subs.length}</span>
              </div>
              <div>
                <span className="profile-lc-contest-label">Accepted</span>
                <span className="profile-lc-contest-num">{solvedTotal}</span>
              </div>
              <div>
                <span className="profile-lc-contest-label">Plan</span>
                <span className={`profile-lc-contest-num ${u.isPremiumStatus ? 'profile-lc-contest-num--accent' : ''}`}>
                  {u.isPremiumStatus ? 'Pro' : 'Free'}
                </span>
              </div>
            </div>
            <div className="profile-lc-sparkline" role="img" aria-label="Submission activity trend">
              <svg viewBox="0 0 200 48" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="rgba(255,161,22,0.85)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={activitySeries.length
                    ? activitySeries.map((pt, i) => {
                        const x = (i / Math.max(activitySeries.length - 1, 1)) * 196 + 2;
                        const y = 44 - pt.n * 36;
                        return `${x},${y}`;
                      }).join(' ')
                    : '2,24 198,24'}
                />
              </svg>
            </div>
          </section>

          <div className="profile-lc-mid-row">
            <section className="panel profile-lc-card profile-lc-solved-card">
              <h2 className="profile-lc-card-title">Solved problems</h2>
              <div className="profile-lc-solved-inner">
                <div className="profile-lc-donut-wrap">
                  <SolvedDonut solved={solvedTotal} total={totalAll} />
                  <div className="profile-lc-donut-center">
                    <span className="profile-lc-donut-solved">{solvedTotal}</span>
                    <span className="profile-lc-donut-total">/ {totalAll || '—'}</span>
                    <span className="profile-lc-donut-caption">Solved</span>
                  </div>
                </div>
                <div className="profile-lc-diff-bubbles">
                  <div className="profile-diff-bubble profile-diff-bubble--easy" title={`Easy: ${easyS} solved of ${easyT}`}>
                    <span className="profile-diff-bubble__label">Easy</span>
                    <span className="profile-diff-bubble__nums">{easyS}<span className="profile-diff-bubble__sep">/</span>{easyT}</span>
                  </div>
                  <div className="profile-diff-bubble profile-diff-bubble--medium" title={`Medium: ${medS} solved of ${medT}`}>
                    <span className="profile-diff-bubble__label">Med.</span>
                    <span className="profile-diff-bubble__nums">{medS}<span className="profile-diff-bubble__sep">/</span>{medT}</span>
                  </div>
                  <div className="profile-diff-bubble profile-diff-bubble--hard" title={`Hard: ${hardS} solved of ${hardT}`}>
                    <span className="profile-diff-bubble__label">Hard</span>
                    <span className="profile-diff-bubble__nums">{hardS}<span className="profile-diff-bubble__sep">/</span>{hardT}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel profile-lc-card profile-lc-badges-card">
              <h2 className="profile-lc-card-title">Milestones</h2>
              <div className="profile-lc-badge-hero">
                <Award size={40} strokeWidth={1.25} className="profile-lc-badge-icon" aria-hidden />
                <div>
                  <span className="profile-lc-badge-count">Platform</span>
                  <p className="profile-lc-badge-title">CodeJudge feature set</p>
                </div>
              </div>
              <ul className="profile-milestones profile-milestones--compact">
                <li>Real Docker sandboxes + Redis queue</li>
                <li>Verdicts from running your code</li>
                <li>Multi-language + SQL track</li>
              </ul>
            </section>
          </div>

          <section className="panel profile-lc-card profile-lc-activity-wide">
            <h3 className="profile-section-title profile-section-title--flat">
              <CalendarIcon size={18} /> Submission activity
            </h3>
            <p className="lc-muted profile-section-desc">
              Counts grouped by calendar day (heatmap strip).
            </p>
            <div className="profile-heat profile-heat--wide">
              {(data?.activityByDay || []).slice(0, 52).map((row, i) => (
                <div
                  key={i}
                  title={`${row._id?.y}-${row._id?.m}-${row._id?.d}`}
                  className={`profile-heat-cell ${row.count > 2 ? 'hot' : row.count > 0 ? 'warm' : ''}`}
                />
              ))}
            </div>

            <div className="profile-lc-tabs">
              <button
                type="button"
                className={`profile-lc-tab ${submissionTab === 'ac' ? 'profile-lc-tab--active' : ''}`}
                onClick={() => setSubmissionTab('ac')}
              >
                Recent AC
              </button>
              <button
                type="button"
                className={`profile-lc-tab ${submissionTab === 'recent' ? 'profile-lc-tab--active' : ''}`}
                onClick={() => setSubmissionTab('recent')}
              >
                All recent
              </button>
              <button type="button" className="profile-lc-tab profile-lc-tab--disabled" disabled>List</button>
              <button type="button" className="profile-lc-tab profile-lc-tab--disabled" disabled>Solutions</button>
            </div>

            <h3 className="profile-section-title profile-section-title--flat profile-lc-subhead">
              <Code2 size={18} /> Submissions
            </h3>
            {!filteredSubs.length ? (
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
                  {filteredSubs.map((s) => (
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
