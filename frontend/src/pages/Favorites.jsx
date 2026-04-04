import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { authHeaders } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Favorites = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.token) {
      const stored = JSON.parse(localStorage.getItem('codejudge_favorites') || '[]');
      if (stored.length === 0) {
        setProblems([]);
        setLoading(false);
        return;
      }
      const res = await api.get(`/problems?limit=100`);
      const favs = res.data.problems.filter((p) => stored.includes(p._id));
      setProblems(favs);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/users/favorites', { headers: authHeaders(user.token) });
      setProblems(res.data || []);
    } catch {
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load().catch(() => { setProblems([]); setLoading(false); });
  }, [user?.token]);

  const remove = async (id) => {
    const next = problems.filter((p) => p._id !== id);
    setProblems(next);
    const ids = next.map((p) => p._id);
    localStorage.setItem('codejudge_favorites', JSON.stringify(ids));
    if (user?.token) {
      try {
        await api.delete(`/users/favorites/${id}`, { headers: authHeaders(user.token) });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Star size={32} color="var(--lc-yellow)" />
        <div>
          <h1 style={{ color: 'var(--lc-text-primary)' }}>Favorites</h1>
          <p className="lc-muted" style={{ fontSize: '13px' }}>Starred problems sync to your account when signed in</p>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading…</div>
        ) : problems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--lc-text-secondary)' }}>
            <Star size={48} color="var(--lc-border)" style={{ margin: '0 auto 15px' }} />
            <p>No favorites yet.</p>
            <Link to="/problems" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px' }}>Browse problems</Link>
          </div>
        ) : (
          <table className="problemset-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>⭐</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(p => (
                <tr key={p._id}>
                  <td>
                    <Star
                      size={18}
                      color="var(--lc-yellow)"
                      fill="var(--lc-yellow)"
                      style={{ cursor: 'pointer' }}
                      onClick={() => remove(p._id)}
                    />
                  </td>
                  <td>
                    <Link to={`/problem/${p._id}`} style={{ textDecoration: 'none', color: 'var(--lc-text-primary)' }}>
                      {p.title}
                    </Link>
                  </td>
                  <td className={`difficulty-${p.difficulty}`}>
                    {p.difficulty}
                  </td>
                  <td className="lc-muted">
                    {p.acceptanceRate != null ? `${p.acceptanceRate}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Favorites;
