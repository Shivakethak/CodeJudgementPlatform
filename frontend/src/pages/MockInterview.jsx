import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Timer, Play, Flag, CheckCircle2 } from 'lucide-react';

function MockInterview() {
  const [pack, setPack] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [remain, setRemain] = useState(0);
  const [checked, setChecked] = useState({});
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const start = async () => {
    const res = await api.get('/mock-interview/pack');
    setPack(res.data);
    const mins = res.data.durationMinutes || 45;
    setRemain(mins * 60);
    setChecked({});
    setPhase('running');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('done');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('done');
  };

  const toggle = (id) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  };

  const problems = pack?.problems || [];
  const solvedCount = problems.filter((p) => checked[p._id]).length;
  const score = problems.length ? Math.round((solvedCount / problems.length) * 100) : 0;

  const mm = String(Math.floor(remain / 60)).padStart(2, '0');
  const ss = String(remain % 60).padStart(2, '0');

  return (
    <div className="container" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>Mock interview</h1>
      <p className="lc-muted" style={{ marginBottom: '24px' }}>
        Five problems sampled from the public bank. Timer mirrors a 45-minute screen. Check each item after you hit “Accepted” in the judge.
      </p>

      {phase === 'idle' && (
        <div className="panel" style={{ padding: '24px' }}>
          <p style={{ marginBottom: '16px' }}>Ready when you are — no login required to preview the pack; submitting solutions still needs an account.</p>
          <button type="button" className="lc-btn lc-btn--accent" onClick={start}>
            <Play size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Start session
          </button>
        </div>
      )}

      {(phase === 'running' || phase === 'done') && pack && (
        <>
          <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Timer size={22} color="var(--lc-accent)" />
              <span style={{ fontSize: '22px', fontFamily: 'Menlo, monospace' }}>{mm}:{ss}</span>
              {phase === 'running' && (
                <button type="button" className="lc-btn lc-btn--ghost lc-btn--sm" onClick={finish}>
                  <Flag size={14} style={{ marginRight: 6 }} />
                  End early
                </button>
              )}
            </div>
            <div>
              Score: <strong>{score}%</strong> ({solvedCount}/{problems.length} self-reported)
            </div>
          </div>

          <div className="panel" style={{ padding: 0 }}>
            <table className="lc-table">
              <thead>
                <tr>
                  <th>Done</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <button type="button" className="lc-icon-btn" onClick={() => toggle(p._id)} aria-label="toggle solved">
                        {checked[p._id] ? <CheckCircle2 color="var(--lc-green)" /> : <CheckCircle2 color="var(--lc-text-secondary)" />}
                      </button>
                    </td>
                    <td>{p.title}</td>
                    <td><span className={`difficulty-${p.difficulty}`}>{p.difficulty}</span></td>
                    <td>
                      <Link to={`/problem/${p._id}`} className="lc-btn lc-btn--primary lc-btn--sm">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {phase === 'done' && (
            <div style={{ marginTop: '24px' }}>
              <button type="button" className="lc-btn lc-btn--ghost" onClick={() => { setPhase('idle'); setPack(null); }}>
                New session
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MockInterview;
