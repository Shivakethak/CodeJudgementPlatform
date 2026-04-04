import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { authHeaders } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { Layers, ListChecks, Hash, Star } from 'lucide-react';

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'];

function ProblemList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || 'All');
  const [topicFilter, setTopicFilter] = useState(searchParams.get('topic') || 'All');
  const [companyFilter, setCompanyFilter] = useState(searchParams.get('company') || 'All');
  const [favoriteSet, setFavoriteSet] = useState(() => new Set());
  const { user } = useAuth();

  useEffect(() => {
    const d = searchParams.get('difficulty');
    const t = searchParams.get('topic');
    const co = searchParams.get('company');
    if (d && DIFFICULTY_OPTIONS.includes(d)) setDifficultyFilter(d);
    else if (!d) setDifficultyFilter('All');
    if (t) setTopicFilter(t);
    if (co) setCompanyFilter(co);
  }, [searchParams]);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/problems?page=${currentPage}&limit=20&difficulty=${difficultyFilter}&search=${encodeURIComponent(search)}&topic=${topicFilter}&company=${encodeURIComponent(companyFilter)}`
        );
        setProblems(res.data.problems);
        setTotalPages(res.data.totalPages);
        setTotalProblems(res.data.totalProblems ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProblems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, difficultyFilter, topicFilter, companyFilter, search]);

  useEffect(() => {
    const loadFav = async () => {
      if (!user?.token) {
        const stored = JSON.parse(localStorage.getItem('codejudge_favorites') || '[]');
        setFavoriteSet(new Set(stored));
        return;
      }
      try {
        const res = await api.get('/users/favorites', { headers: authHeaders(user.token) });
        const ids = (res.data || []).map((p) => p._id);
        setFavoriteSet(new Set(ids));
        localStorage.setItem('codejudge_favorites', JSON.stringify(ids));
      } catch {
        const stored = JSON.parse(localStorage.getItem('codejudge_favorites') || '[]');
        setFavoriteSet(new Set(stored));
      }
    };
    loadFav();
  }, [user?.token]);

  const setDifficulty = (value) => {
    setDifficultyFilter(value);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'All') next.delete('difficulty');
      else next.set('difficulty', value);
      return next;
    }, { replace: true });
  };

  const toggleFavorite = async (id) => {
    const next = new Set(favoriteSet);
    const on = next.has(id);
    if (on) next.delete(id);
    else next.add(id);
    setFavoriteSet(next);
    const arr = [...next];
    localStorage.setItem('codejudge_favorites', JSON.stringify(arr));

    if (user?.token) {
      try {
        if (on) {
          await api.delete(`/users/favorites/${id}`, { headers: authHeaders(user.token) });
        } else {
          await api.post(`/users/favorites/${id}`, {}, { headers: authHeaders(user.token) });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.token) {
          const res = await api.get('/users/stats');
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const solvedSet = stats?.solvedProblemIds
    ? new Set(stats.solvedProblemIds.map(String))
    : new Set();

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100%' }}>
      <div className="content-area" style={{ flex: 1, minWidth: 0 }}>
        <section className="lc-hero">
          <div className="lc-hero__inner">
            <div>
              <p className="lc-hero__eyebrow">AlgoArena</p>
              <h1 className="lc-hero__title">Prepare for your next technical interview</h1>
              <div className="lc-hero__cta">
                <Link to="/challenges" className="lc-btn lc-btn--accent">Contest hub</Link>
                <Link to="/mock-interview" className="lc-btn lc-btn--ghost">Mock interview</Link>
              </div>
            </div>
            <div className="lc-hero__card">
              <div className="lc-hero-stat">
                <span className="lc-hero-stat__val">{totalProblems || '—'}</span>
                <span className="lc-hero-stat__label">Problems indexed</span>
              </div>
              <div className="lc-hero-stat">
                <span className="lc-hero-stat__val">Live</span>
                <span className="lc-hero-stat__label">Redis queue · WebSockets</span>
              </div>
            </div>
          </div>
        </section>

        <div className="deck-cards">
          <Link to="/challenges" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="topic-card term-topic-card--accent">
              <h3>Contest</h3>
              <Layers className="card-bg-icon" style={{ color: 'var(--term-accent)', opacity: 0.35 }} />
            </div>
          </Link>
          <Link to="/interview" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="topic-card term-topic-card--green">
              <h3>Company interview tracks</h3>
              <ListChecks className="card-bg-icon" style={{ color: 'var(--lc-green)', opacity: 0.35 }} />
            </div>
          </Link>
          <Link to="/study" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="topic-card term-topic-card--blue">
              <h3>Structured study plans</h3>
              <Hash className="card-bg-icon" style={{ color: 'var(--lc-blue)', opacity: 0.35 }} />
            </div>
          </Link>
        </div>

        {stats && (
          <div className="stats-dashboard">
            <div className="stat-item">
              <span className="stat-label">Solved</span>
              <span className="stat-value">{stats.stats.totalSolved} / {stats.totals.all}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label" style={{ color: 'var(--lc-green)' }}>Easy</span>
              <span className="stat-value">{stats.stats.easy} / {stats.totals.easy}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label" style={{ color: 'var(--lc-yellow)' }}>Medium</span>
              <span className="stat-value">{stats.stats.medium} / {stats.totals.medium}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label" style={{ color: 'var(--lc-red)' }}>Hard</span>
              <span className="stat-value">{stats.stats.hard} / {stats.totals.hard}</span>
            </div>
          </div>
        )}

        <h2>Problemset</h2>

        <div className="problem-filters-row">
          <input
            type="text"
            placeholder="Search problems…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lc-select problem-filters-search"
          />
          <div className="difficulty-bubbles" role="group" aria-label="Filter by difficulty">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={`difficulty-bubble difficulty-bubble--${d.toLowerCase()}${difficultyFilter === d ? ' difficulty-bubble--active' : ''}`}
                onClick={() => setDifficulty(d)}
                aria-pressed={difficultyFilter === d}
              >
                <span className="difficulty-bubble__glow" aria-hidden />
                <span className="difficulty-bubble__label">{d === 'All' ? 'All problems' : d}</span>
              </button>
            ))}
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="lc-select"
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All tags</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Hash Table">Hash Table</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="SQL">SQL</option>
            <option value="Graph">Graph</option>
          </select>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="lc-select"
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All companies</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Meta">Meta</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Apple">Apple</option>
            <option value="Bloomberg">Bloomberg</option>
          </select>
        </div>

        <div className="panel">
          <table className="problemset-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }} aria-label="favorite">⭐</th>
                <th style={{ width: '48px' }}>#</th>
                <th style={{ width: '56px' }}>✓</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th style={{ width: '100px' }}>Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading…</td></tr>
              ) : problems.map(p => (
                <tr key={p._id}>
                  <td>
                    <Star
                      size={16}
                      color={favoriteSet.has(p._id) ? 'var(--term-accent)' : 'var(--term-text-muted)'}
                      fill={favoriteSet.has(p._id) ? 'var(--term-accent)' : 'none'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleFavorite(p._id)}
                    />
                  </td>
                  <td className="lc-muted">{p.index ?? '—'}</td>
                  <td className="lc-muted">{solvedSet.has(String(p._id)) ? '✓' : ''}</td>
                  <td>
                    <Link to={`/problem/${p._id}`} className="problem-title-link">
                      {p.title}
                    </Link>
                    {p.isPremium && <span className="premium-tag">Premium</span>}
                  </td>
                  <td className={`difficulty-${p.difficulty}`}>
                    {p.difficulty}
                  </td>
                  <td className="lc-muted">{p.acceptanceRate != null ? `${p.acceptanceRate}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--lc-border)', gap: '10px' }}>
            <button
              className="btn btn-primary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Prev
            </button>
            <span style={{ color: 'var(--lc-text-secondary)', fontSize: '13px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-primary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemList;
