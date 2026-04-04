import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { authHeaders } from '../services/api';
import { getSocket } from '../services/socket';
import { Trophy, Clock, Users, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function formatRemain(ms) {
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function ContestRoom() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [remainingMs, setRemainingMs] = useState(0);
  const [contestStatus, setContestStatus] = useState('running');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinOk, setJoinOk] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchChallengeData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setJoinError('');
    try {
      const res = await api.get(`/challenges/${id}`);
      setChallenge(res.data);
      setRemainingMs(Math.max(new Date(res.data.endDate).getTime() - Date.now(), 0));
      const lbRes = await api.get(`/challenges/${id}/leaderboard`);
      setLeaderboard(lbRes.data);
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const handleJoin = async () => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    if (!challenge?._id) return;
    setJoining(true);
    setJoinError('');
    setJoinOk(false);
    try {
      await api.post(`/challenges/${challenge._id}/join`, {}, {
        headers: authHeaders(user.token),
      });
      setJoinOk(true);
      const lbRes = await api.get(`/challenges/${challenge._id}/leaderboard`);
      setLeaderboard(lbRes.data);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Could not join challenge. Try signing in again.');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    if (!challenge?._id) return undefined;
    const token = user?.token;
    const socket = getSocket(token);
    const cid = challenge._id;
    socket.emit('challenge:subscribe', cid);

    const onLeaderboard = (payload) => {
      if (payload.challengeId === cid) setLeaderboard(payload.leaderboard || []);
    };
    const onTimer = (payload) => {
      if (payload.challengeId === cid) setRemainingMs(payload.remainingMs ?? 0);
    };
    const onStatus = (payload) => {
      if (payload.challengeId === cid) setContestStatus(payload.status || 'running');
    };

    socket.on('leaderboard:updated', onLeaderboard);
    socket.on('contest:timer', onTimer);
    socket.on('contest:status', onStatus);
    return () => {
      socket.emit('challenge:unsubscribe', cid);
      socket.off('leaderboard:updated', onLeaderboard);
      socket.off('contest:timer', onTimer);
      socket.off('contest:status', onStatus);
    };
  }, [challenge?._id, user?.token]);

  if (loading) {
    return (
      <div className="lc-page lc-page--center">
        <div className="lc-skeleton lc-skeleton--hero" />
        <p className="lc-muted">Loading contest…</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="lc-page lc-page--center">
        <div className="lc-empty-card">
          <Trophy size={40} className="lc-empty-icon" />
          <h2>Contest not found</h2>
          <p className="lc-muted">This id may be invalid or the contest was removed.</p>
          <Link to="/challenges" className="lc-btn lc-btn--primary">All contests</Link>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return (
    <div className="lc-page lc-contest">
      <div className="lc-contest-hero">
        <div className="lc-contest-hero__badge">
          <Trophy size={18} /> {challenge.kind === 'contest' ? 'Contest' : 'Weekly contest'}
        </div>
        <h1 className="lc-contest-title">{challenge.title}</h1>
        <p className="lc-muted" style={{ maxWidth: '720px' }}>{challenge.description}</p>
        <div className="lc-contest-meta">
          <span className="lc-pill lc-pill--timer">
            <Clock size={14} />
            {formatRemain(remainingMs)}
            <small className="lc-pill-hint">server synced</small>
          </span>
          <span className={`lc-pill lc-pill--status lc-pill--${contestStatus}`}>
            {contestStatus === 'running' ? 'Live' : contestStatus}
          </span>
          {daysLeft > 0 && contestStatus === 'running' && (
            <span className="lc-muted lc-contest-days">~{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
          )}
        </div>

        {joinError && (
          <div className="lc-banner lc-banner--error">
            <AlertCircle size={18} />
            <span>{joinError}</span>
            {!user?.token && (
              <button type="button" className="lc-link-btn" onClick={() => navigate('/login')}>Sign in</button>
            )}
          </div>
        )}
        {joinOk && (
          <div className="lc-banner lc-banner--ok">
            <CheckCircle2 size={18} />
            <span>You’re registered. Solve problems below to climb the leaderboard.</span>
          </div>
        )}

        <div className="lc-hero-actions">
          {user ? (
            <button
              type="button"
              className="lc-btn lc-btn--accent"
              onClick={handleJoin}
              disabled={joining || contestStatus !== 'running'}
            >
              {joining ? 'Joining…' : 'Register for contest'}
            </button>
          ) : (
            <button type="button" className="lc-btn lc-btn--accent" onClick={() => navigate('/login')}>
              Sign in to register
            </button>
          )}
          <Link to="/challenges" className="lc-btn lc-btn--ghost">All contests</Link>
          <Link to="/problems" className="lc-btn lc-btn--ghost">Problem set</Link>
        </div>
      </div>

      <div className="lc-contest-grid">
        <section className="lc-panel">
          <div className="lc-panel__head">
            <h2>Contest problems</h2>
            <span className="lc-muted">{challenge.problems?.length || 0} problems · +1 / solve · penalty {challenge.penaltyPerWrong ?? 1} / wrong</span>
          </div>
          {!challenge.problems?.length ? (
            <p className="lc-panel__empty lc-muted">No problems linked to this contest.</p>
          ) : (
            <div className="lc-table-wrap">
              <table className="lc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {challenge.problems.map((p, i) => (
                    <tr key={p._id}>
                      <td className="lc-muted">{i + 1}</td>
                      <td>
                        <Link to={`/problem/${p._id}?contest=${challenge._id}`} className="lc-table-link">
                          {p.title}
                        </Link>
                        {p.isPremium && <span className="premium-tag">Premium</span>}
                      </td>
                      <td><span className={`difficulty-${p.difficulty}`}>{p.difficulty}</span></td>
                      <td className="lc-table-chev">
                        <Link to={`/problem/${p._id}?contest=${challenge._id}`}><ChevronRight size={18} /></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="lc-panel lc-panel--side">
          <div className="lc-panel__head">
            <h2><Users size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Leaderboard</h2>
          </div>
          {!leaderboard.length ? (
            <p className="lc-panel__empty lc-muted">No participants yet. Be the first.</p>
          ) : (
            <div className="lc-table-wrap">
              <table className="lc-table lc-table--compact">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Score</th>
                    <th>Wrong</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((lb, index) => (
                    <tr key={lb._id} className={index === 0 ? 'lc-row-gold' : ''}>
                      <td>
                        <span className={index < 3 ? 'lc-rank lc-rank--top' : 'lc-rank'}>#{index + 1}</span>
                      </td>
                      <td title={lb.userId?.email || ''}>
                        {(lb.userId?.email || 'User').split('@')[0]}
                      </td>
                      <td><strong>{lb.score}</strong></td>
                      <td className="lc-muted">{lb.wrongAttempts ?? 0}</td>
                      <td className="lc-muted">{lb.timeTaken} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ContestRoom;
