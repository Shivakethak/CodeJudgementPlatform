import React, { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react';
import api, { authHeaders } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Discuss = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');

  const load = async (p = 1) => {
    const res = await api.get(`/discuss?page=${p}&limit=12`);
    setPosts(res.data.posts || []);
    setTotalPages(res.data.totalPages || 1);
    setPage(res.data.page || 1);
  };

  useEffect(() => {
    load(1).catch(() => setPosts([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!user?.token) {
      setErr('Sign in to post.');
      return;
    }
    try {
      await api.post('/discuss', { title, body }, { headers: authHeaders(user.token) });
      setTitle('');
      setBody('');
      await load(1);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Could not create post');
    }
  };

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <MessageSquare size={32} color="var(--lc-accent)" />
          <div>
            <h1 style={{ color: 'var(--lc-text-primary)' }}>Discuss</h1>
            <p className="lc-muted" style={{ fontSize: '13px' }}>Community guides, contest reviews, and hints</p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>New thread</h3>
        {err && <div className="lc-banner lc-banner--error" style={{ marginBottom: '12px' }}>{err}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            className="lc-select"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '10px 12px' }}
          />
          <textarea
            className="lc-select"
            placeholder="Write your post (markdown-style plain text is fine)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            style={{ padding: '10px 12px', resize: 'vertical' }}
          />
          <button type="submit" className="lc-btn lc-btn--accent" style={{ alignSelf: 'flex-start' }} disabled={!title.trim() || !body.trim()}>
            Publish
          </button>
        </form>
      </div>

      <div className="panel" style={{ padding: '0' }}>
        <table className="problemset-table">
          <thead>
            <tr>
              <th style={{ padding: '15px 20px' }}>Topic</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Votes</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Replies</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post._id}>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--lc-text-primary)', marginBottom: '6px' }}>{post.title}</div>
                  <p className="lc-muted" style={{ fontSize: '13px', marginBottom: '8px', lineHeight: 1.45 }}>
                    {(post.body || '').slice(0, 220)}{(post.body || '').length > 220 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--lc-text-secondary)' }}>by {post.authorLabel}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {(post.tags || []).map(tag => (
                        <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', color: 'var(--lc-text-secondary)' }}>
                  <ThumbsUp size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                  {post.votes ?? 0}
                </td>
                <td style={{ textAlign: 'center', color: 'var(--lc-text-secondary)' }}>
                  <MessageCircle size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                  {post.replyCount ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '16px' }}>
          <button type="button" className="lc-btn lc-btn--ghost lc-btn--sm" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
          <span className="lc-muted" style={{ fontSize: '13px' }}>Page {page} / {totalPages}</span>
          <button type="button" className="lc-btn lc-btn--ghost lc-btn--sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Discuss;
