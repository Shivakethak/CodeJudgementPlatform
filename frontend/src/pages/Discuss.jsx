import React from 'react';
import { MessageSquare, ThumbsUp, Eye } from 'lucide-react';

const Discuss = () => {
  const posts = [
    { id: 1, title: 'How to approach Dynamic Programming systematically?', author: 'user123', views: 432, likes: 89, tags: ['DP', 'Tutorial'] },
    { id: 2, title: 'Google Interview Experience 2026 (SDE II)', author: 'codeMaster', views: 1205, likes: 312, tags: ['Interview', 'Google'] },
    { id: 3, title: 'Explanation for Problem "Two Sum" using HashMaps', author: 'newbie_coder', views: 250, likes: 45, tags: ['Solution', 'Easy'] }
  ];

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <MessageSquare size={32} color="var(--lc-brand)" />
          <h1 style={{ color: 'var(--lc-text-primary)' }}>Discuss</h1>
        </div>
        <button className="btn btn-primary">New Post</button>
      </div>

      <div className="panel" style={{ padding: '0' }}>
        <table className="problemset-table">
          <thead>
            <tr>
              <th style={{ padding: '15px 20px' }}>Topic</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Views</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Likes</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--lc-text-primary)', marginBottom: '5px' }}>{post.title}</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--lc-text-secondary)' }}>by {post.author}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {post.tags.map(tag => (
                        <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: 'var(--lc-text-primary)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', color: 'var(--lc-text-secondary)' }}>
                  <Eye size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                  {post.views}
                </td>
                <td style={{ textAlign: 'center', color: 'var(--lc-text-secondary)' }}>
                  <ThumbsUp size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                  {post.likes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Discuss;
