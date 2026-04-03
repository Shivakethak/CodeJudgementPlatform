import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Challenges() {
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const res = await axios.get(`${API_URL}/challenges/current`);
        setChallenge(res.data);
        
        if (res.data) {
          const lbRes = await axios.get(`${API_URL}/challenges/${res.data._id}/leaderboard`);
          setLeaderboard(lbRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallengeData();
  }, []);

  const handleJoin = async () => {
    if (!user) return alert('Please login to join the challenge.');
    try {
      const token = user ? user.token : null;
      await axios.post(`${API_URL}/challenges/${challenge._id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Successfully joined the challenge!');
      // Refresh leaderboard to show empty score
      const lbRes = await axios.get(`${API_URL}/challenges/${challenge._id}/leaderboard`);
      setLeaderboard(lbRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining challenge');
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Challenge Data...</div>;
  if (!challenge) return <div style={{textAlign:'center', marginTop:'50px'}}>No Active Challenges currently.</div>;

  const endDate = new Date(challenge.endDate);
  const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="container" style={{ maxWidth: '1000px', display: 'flex', gap: '24px' }}>
      {/* Left Column: Details */}
      <div style={{ flex: 2 }}>
        <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--lc-brand)' }}>{challenge.title}</h2>
          <p style={{ marginTop: '8px', color: 'var(--lc-text-secondary)' }}>
            Closes in <strong style={{ color: 'var(--lc-red)' }}>{daysLeft} days</strong>
          </p>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={handleJoin}>Join Challenge</button>
          </div>
        </div>

        <h3>Challenge Problems</h3>
        <div className="panel" style={{ marginTop: '16px' }}>
          <table className="problemset-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {challenge.problems.map(p => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/problem/${p._id}`} style={{ color: 'var(--lc-text-primary)' }}>{p.title}</Link>
                    {p.isPremium && <span className="premium-tag" style={{ marginLeft: '10px' }}>Premium</span>}
                  </td>
                  <td className={`difficulty-${p.difficulty}`}>{p.difficulty}</td>
                  <td>10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Leaderboard */}
      <div style={{ flex: 1 }}>
        <h3>Leaderboard</h3>
        <div className="panel" style={{ marginTop: '16px', padding: '0' }}>
          {leaderboard.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--lc-text-secondary)' }}>No participants yet.</div>
          ) : (
            <table className="problemset-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((lb, index) => (
                  <tr key={lb._id} style={{ background: index === 0 ? 'rgba(255,161,22,0.1)' : 'transparent' }}>
                    <td><strong style={{ color: index === 0 ? 'var(--lc-brand)' : 'inherit' }}>#{index + 1}</strong></td>
                    <td title={lb.userId?.email || 'Unknown User'}>
                      {(lb.userId?.email || 'User').split('@')[0]}
                    </td>
                    <td>{lb.score}</td>
                    <td>{lb.timeTaken}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Challenges;
