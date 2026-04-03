import React from 'react';
import { Compass, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Compass size={32} color="var(--lc-brand)" />
        <h1 style={{ color: 'var(--lc-text-primary)' }}>Explore</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        <div className="panel" style={{ padding: '24px', transition: 'transform 0.2s', cursor: 'pointer' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp color="var(--lc-green)" /> Trending Topics</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Discover what other developers are currently practicing.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <span className="lc-select" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '13px' }}>Dynamic Programming</span>
            <span className="lc-select" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '13px' }}>Graphs</span>
            <span className="lc-select" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '13px' }}>Trees</span>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen color="var(--lc-blue)" /> Featured Study Plans</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Structured learning modules to master data structures.</p>
          <Link to="/study" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>View Plans</Link>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock color="var(--lc-yellow)" /> Recent Contests</h2>
          <p style={{ color: 'var(--lc-text-secondary)', marginTop: '10px' }}>Missed a weekend contest? Practice the problems here.</p>
          <Link to="/challenges" className="btn btn-outline" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>Go to Quests</Link>
        </div>

      </div>
    </div>
  );
};

export default Explore;
