import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import RightSidebar from '../components/RightSidebar';
import { Layers, ListChecks, Hash, Star } from 'lucide-react';

function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { user } = useAuth();
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/problems?page=${currentPage}&limit=20&difficulty=${difficultyFilter}&search=${search}&topic=${topicFilter}`);
        setProblems(res.data.problems);
        setTotalPages(res.data.totalPages);
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
  }, [currentPage, difficultyFilter, topicFilter, search]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('codejudge_favorites')) || [];
    setFavoriteIds(stored);
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
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = user ? user.token : null;
        if (token) {
          const res = await axios.get(`${API_URL}/users/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchStats();
  }, [user]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div className="content-area">
        <div className="deck-cards">
          <Link to="/challenges" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="topic-card" style={{ background: 'linear-gradient(to right, #ff9900, #ffb84d)' }}>
              <h3 style={{ color: '#000' }}>JavaScript Challenge</h3>
              <Layers className="card-bg-icon" style={{ color: '#000' }} />
            </div>
          </Link>
          <Link to="/interview" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="topic-card" style={{ background: 'linear-gradient(to right, #2cbb5d, #4ade80)' }}>
              <h3 style={{ color: '#000' }}>Interview Questions</h3>
              <ListChecks className="card-bg-icon" style={{ color: '#000' }} />
            </div>
          </Link>
          <Link to="/study" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="topic-card" style={{ background: 'linear-gradient(to right, #007aff, #60a5fa)' }}>
              <h3 style={{ color: '#000' }}>Crash Course</h3>
              <Hash className="card-bg-icon" style={{ color: '#000' }} />
            </div>
          </Link>
        </div>

        {/* User Dashboard */}
      {stats && (
        <div className="stats-dashboard">
          <div className="stat-item">
            <span className="stat-label">Solved Problems</span>
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
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search problems..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lc-select"
          style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--lc-border)' }}
        />
        <select 
          value={difficultyFilter} 
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="lc-select"
          style={{ padding: '8px 12px' }}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select 
          value={topicFilter} 
          onChange={(e) => setTopicFilter(e.target.value)}
          className="lc-select"
          style={{ padding: '8px 12px' }}
        >
          <option value="All">All Tags</option>
          <option value="Array">Array</option>
          <option value="String">String</option>
          <option value="Dynamic Programming">DP</option>
          <option value="Graph">Graph</option>
        </select>
      </div>

      <div className="panel">
        <table className="problemset-table" style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>⭐</th>
              <th style={{ width: '40px' }}>Status</th>
              <th>Title</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
            ) : problems.map(p => (
              <tr key={p._id}>
                <td>
                  <Star 
                    size={16} 
                    color={favoriteIds.includes(p._id) ? "var(--lc-yellow)" : "var(--lc-text-secondary)"} 
                    fill={favoriteIds.includes(p._id) ? "var(--lc-yellow)" : "none"}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFavorite(p._id)}
                  />
                </td>
                <td>
                  {stats && stats.stats.totalSolved > 0 ? '-' : ''}
                </td>
                <td>
                  <Link to={`/problem/${p._id}`} style={{ textDecoration: 'none', color: 'var(--lc-text-primary)' }}>
                    {p.title}
                  </Link>
                  {p.isPremium && <span className="premium-tag">Premium</span>}
                </td>
                <td className={`difficulty-${p.difficulty}`}>
                  {p.difficulty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
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
      <RightSidebar />
    </div>
  );
}

export default ProblemList;
