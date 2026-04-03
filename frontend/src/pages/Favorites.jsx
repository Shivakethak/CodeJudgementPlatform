import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Load favorites from local storage
    const stored = JSON.parse(localStorage.getItem('codejudge_favorites')) || [];
    setFavoriteIds(stored);

    const fetchAllAndFilter = async () => {
      try {
        // Fetch a bit generously, assuming favorites wouldn't exceed 100 on this mock layout
        const res = await axios.get(`${API_URL}/problems?limit=100`);
        const allProbs = res.data.problems;
        
        // Filter those whose IDs are in local storage array
        const favs = allProbs.filter(p => stored.includes(p._id));
        setProblems(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (stored.length > 0) {
      fetchAllAndFilter();
    } else {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = (id) => {
    let stored = JSON.parse(localStorage.getItem('codejudge_favorites')) || [];
    if (stored.includes(id)) {
      stored = stored.filter(fid => fid !== id);
    } else {
      stored.push(id);
    }
    localStorage.setItem('codejudge_favorites', JSON.stringify(stored));
    setFavoriteIds(stored);
    setProblems(problems.filter(p => stored.includes(p._id)));
  };

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Star size={32} color="var(--lc-yellow)" />
        <h1 style={{ color: 'var(--lc-text-primary)' }}>My Favorites</h1>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading favorites...</div>
        ) : problems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--lc-text-secondary)' }}>
            <Star size={48} color="var(--lc-border)" style={{ margin: '0 auto 15px' }} />
            <p>You haven't favored any problems yet.</p>
            <Link to="/problems" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px' }}>Explore Problems</Link>
          </div>
        ) : (
          <table className="problemset-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>⭐</th>
                <th>Title</th>
                <th>Difficulty</th>
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
                      onClick={() => toggleFavorite(p._id)}
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
