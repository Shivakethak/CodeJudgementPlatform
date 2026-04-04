import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Tag, Building2, Lightbulb, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { authHeaders } from '../services/api';
import { getSocket } from '../services/socket';

const LS_WS_LEFT = 'codejudge_ws_left_pct';
const LS_WS_EDITOR = 'codejudge_ws_editor_frac';

function readSplit(key, fallback) {
  const n = parseFloat(localStorage.getItem(key) || '');
  return Number.isFinite(n) ? n : fallback;
}

const LANGS = [
  { id: 'python', label: 'Python 3', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'c', label: 'C', monaco: 'c' },
  { id: 'sql', label: 'SQL', monaco: 'sql' },
];

const EMPTY_MAP = () => ({
  python: '',
  java: '',
  cpp: '',
  c: '',
  javascript: '',
  sql: ''
});

function pickSolutionText(problem, lang) {
  const code = problem?.solution?.code;
  if (!code || typeof code !== 'object') return '// No editorial for this problem yet.';
  const raw = code[lang];
  if (typeof raw === 'string' && raw.trim()) return raw;
  const fallbackOrder = ['python', 'javascript', 'java', 'cpp', 'c', 'sql'];
  for (const k of fallbackOrder) {
    if (typeof code[k] === 'string' && code[k].trim()) {
      return `// ${lang.toUpperCase()} editorial uses the same approach as ${k}.\n\n${code[k]}`;
    }
  }
  return '// Editorial not available.';
}

function Workspace() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contest');

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [codeMap, setCodeMap] = useState(EMPTY_MAP);

  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [bottomTab, setBottomTab] = useState('testcases');
  const [leftTab, setLeftTab] = useState('description');
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [detailCaseIdx, setDetailCaseIdx] = useState(null);

  const { user } = useAuth();
  const latestSubmissionId = useRef(null);

  const workspaceRef = useRef(null);
  const rightColRef = useRef(null);
  const dragRef = useRef(null);
  const [leftPct, setLeftPct] = useState(() => Math.min(72, Math.max(22, readSplit(LS_WS_LEFT, 42))));
  const [editorFrac, setEditorFrac] = useState(() => Math.min(0.88, Math.max(0.15, readSplit(LS_WS_EDITOR, 0.58))));
  const [dragAxis, setDragAxis] = useState(null);
  const leftPctRef = useRef(leftPct);
  const editorFracRef = useRef(editorFrac);
  leftPctRef.current = leftPct;
  editorFracRef.current = editorFrac;

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.type === 'v' && workspaceRef.current) {
        const w = workspaceRef.current.getBoundingClientRect().width;
        const delta = ((e.clientX - d.startX) / w) * 100;
        setLeftPct(Math.min(72, Math.max(22, d.startLeft + delta)));
      }
      if (d.type === 'h' && rightColRef.current) {
        const h = rightColRef.current.getBoundingClientRect().height;
        if (h < 80) return;
        const delta = (e.clientY - d.startY) / h;
        setEditorFrac(Math.min(0.88, Math.max(0.15, d.startFrac - delta)));
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        localStorage.setItem(LS_WS_LEFT, String(Math.round(leftPctRef.current * 10) / 10));
        localStorage.setItem(LS_WS_EDITOR, String(Math.round(editorFracRef.current * 1000) / 1000));
      }
      dragRef.current = null;
      setDragAxis(null);
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('blur', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('blur', onUp);
    };
  }, []);

  const onResizeVerticalDown = (e) => {
    e.preventDefault();
    dragRef.current = { type: 'v', startX: e.clientX, startLeft: leftPct };
    setDragAxis('v');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const onResizeHorizontalDown = (e) => {
    e.preventDefault();
    dragRef.current = { type: 'h', startY: e.clientY, startFrac: editorFrac };
    setDragAxis('h');
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
        const tmpl = res.data.templates || {};
        setCodeMap({
          ...EMPTY_MAP(),
          ...tmpl
        });
        setLeftTab('description');
        setBottomTab('testcases');
        setOutput(null);
        setStatus('Idle');
        setDetailCaseIdx(null);
        latestSubmissionId.current = null;

        const pref = ['python', 'javascript', 'java', 'cpp', 'c', 'sql'].find(
          (l) => tmpl[l] && String(tmpl[l]).trim().length > 0 && !String(tmpl[l]).trim().startsWith('-- N/A')
        );
        if (pref) setLanguage(pref);
        else if ((res.data.topics || []).includes('SQL')) setLanguage('sql');
        else setLanguage('python');
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [id]);

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/submissions/history?problemId=${id}`, {
        headers: authHeaders(user.token)
      });
      setSubmissionHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user, id]);

  useEffect(() => {
    if (leftTab === 'submissions') fetchSubmissions();
  }, [leftTab, fetchSubmissions]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleCodeChange = (newVal) => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: newVal ?? ''
    }));
  };

  const code = codeMap[language] ?? '';
  const monacoLang = LANGS.find((l) => l.id === language)?.monaco || 'python';
  const editorialText = problem ? pickSolutionText(problem, language) : '';

  const testResults = output?.testCaseResults;
  const passedCount = testResults ? testResults.filter((r) => r.passed).length : 0;
  const totalCases = testResults?.length ?? 0;
  const passPct = totalCases ? Math.round((passedCount / totalCases) * 100) : 0;

  const handleRun = async () => {
    if (!user) return alert('Please login to run code');
    setStatus('Running…');
    setOutput(null);
    try {
      const token = user.token;
      const res = await api.post('/submissions/run', {
        problemId: id,
        code,
        language
      }, {
        headers: authHeaders(token)
      });
      setOutput(res.data);
      setStatus(res.data.verdict);
    } catch (err) {
      setOutput(err.response?.data || { error: 'Execution failed' });
      setStatus('Compiler Error');
    }
    setBottomTab('output');
  };

  const handleSubmit = async () => {
    if (!user) return alert('Please login to submit code');
    setStatus('Pending…');
    setOutput(null);
    try {
      const token = user.token;
      const res = await api.post('/submissions/submit', {
        problemId: id,
        code,
        language
      }, {
        headers: authHeaders(token)
      });

      const jobId = res.data.jobId;
      latestSubmissionId.current = jobId;
      setStatus('Running…');
    } catch (err) {
      console.error('Submit Error:', err.response?.data || err.message);
      setStatus(err.response?.data?.message || err.message || 'Submission Error');
    }
    setBottomTab('output');
  };

  useEffect(() => {
    if (!user?.token) return undefined;

    const socket = getSocket(user.token);
    const onRunning = ({ submissionId, status: runningStatus }) => {
      const cur = latestSubmissionId.current?.toString?.() ?? latestSubmissionId.current;
      const sid = submissionId?.toString?.() ?? submissionId;
      if (cur && sid === cur) {
        setStatus(runningStatus || 'Running');
      }
    };
    const onCompleted = ({ submissionId, submission }) => {
      const cur = latestSubmissionId.current?.toString?.() ?? latestSubmissionId.current;
      const sid = submissionId?.toString?.() ?? submissionId;
      if (cur && sid === cur) {
        setOutput(submission);
        setStatus(submission.verdict || submission.status);
        if (leftTab === 'submissions') fetchSubmissions();
      }
    };

    socket.on('submission:running', onRunning);
    socket.on('submission:completed', onCompleted);
    return () => {
      socket.off('submission:running', onRunning);
      socket.off('submission:completed', onCompleted);
    };
  }, [user, leftTab, fetchSubmissions]);

  if (!problem) return <div style={{ padding: '2rem' }}>Loading…</div>;

  const isPremiumLocked = problem.isPremium && (!user || !user.isPremiumStatus);

  const topicsPreview = (problem.topics || []).slice(0, 2).join(', ') || 'General';
  const companiesPreview = (problem.companies || []).slice(0, 2).join(', ') || '—';

  return (
    <div className="workspace workspace--seamless">
      <header className="workspace-ide-bar">
        <Link to="/problems" className="workspace-ide-back">← Problem list</Link>
      </header>
      <div className="workspace-ide-row" ref={workspaceRef}>
      <div
        className="workspace-col workspace-col--left pane"
        style={{ width: `${leftPct}%` }}
      >
        {contestId && (
          <div className="lc-banner lc-banner--ok" style={{ padding: '8px 14px', flexShrink: 0, borderBottom: '1px solid var(--lc-border)', margin: 0, borderRadius: 0 }}>
            Contest mode — submissions count toward leaderboard
            {' '}
            <Link to={`/challenges/${contestId}`} className="lc-table-link">Back to room</Link>
          </div>
        )}

        <div className="pane-tabs" style={{ flexShrink: 0 }}>
          <button type="button" className={`pane-tab ${leftTab === 'description' ? 'active' : ''}`} onClick={() => setLeftTab('description')}>Description</button>
          <button type="button" className={`pane-tab ${leftTab === 'submissions' ? 'active' : ''}`} onClick={() => setLeftTab('submissions')}>Submissions</button>
          <button type="button" className={`pane-tab ${leftTab === 'solutions' ? 'active' : ''}`} onClick={() => setLeftTab('solutions')}>Solution</button>
        </div>

        <div className="pane-content" style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
          {leftTab === 'description' && (
            <div>
              <h1 className="problem-title">{problem.title}</h1>
              <div className="workspace-meta-bubbles">
                <span className={`workspace-meta-bubble workspace-meta-bubble--${String(problem.difficulty || 'easy').toLowerCase()}`}>
                  {problem.difficulty}
                </span>
                <button type="button" className="workspace-meta-bubble workspace-meta-bubble--topics" title={topicsPreview}>
                  <Tag size={14} aria-hidden />
                  Topics
                </button>
                <button
                  type="button"
                  className={`workspace-meta-bubble workspace-meta-bubble--topics ${problem.isPremium ? 'workspace-meta-bubble--locked' : ''}`}
                  title={companiesPreview}
                >
                  {problem.isPremium ? <Lock size={14} aria-hidden /> : <Building2 size={14} aria-hidden />}
                  Companies
                </button>
                <button type="button" className="workspace-meta-bubble workspace-meta-bubble--topics" title="Use samples below as a starting point">
                  <Lightbulb size={14} aria-hidden />
                  Hint
                </button>
                {problem.isPremium && <span className="premium-tag" style={{ marginLeft: 4 }}>Premium</span>}
              </div>
              <div className="problem-desc" style={{ whiteSpace: 'pre-wrap' }}>
                {problem.description}
              </div>
              <div style={{ marginTop: '24px' }}>
                {problem.examples?.map((ex, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <strong>Example {idx + 1}:</strong>
                    <div className="example-box">
                      <strong>Input:</strong> {ex.input}<br />
                      <strong>Output:</strong> {ex.output}<br />
                      {ex.explanation && <><strong>Explanation:</strong> {ex.explanation}</>}
                    </div>
                  </div>
                ))}
              </div>
              {problem.hints?.length > 0 && (
                <div className="problem-hints" style={{ marginTop: '20px' }}>
                  <strong>Hints:</strong>
                  <ol style={{ marginLeft: '20px', marginTop: '10px', lineHeight: 1.55 }}>
                    {problem.hints.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ol>
                </div>
              )}
              <div style={{ marginTop: '20px' }}>
                <strong>Constraints:</strong>
                <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                  {problem.constraints?.map((c, idx) => (
                    <li key={idx}><code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{c}</code></li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {leftTab === 'submissions' && (
            <div>
              <h3 style={{ marginBottom: '12px' }}>Your submissions</h3>
              {!user ? (
                <p style={{ color: 'var(--lc-text-secondary)' }}>Sign in to view history.</p>
              ) : submissionHistory.length === 0 ? (
                <p style={{ color: 'var(--lc-text-secondary)' }}>No submissions yet.</p>
              ) : (
                <table className="problemset-table" style={{ borderSpacing: 0, width: '100%', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--term-border)' }}>Time</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--term-border)' }}>Verdict</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--term-border)' }}>Runtime</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--term-border)' }}>Lang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionHistory.map((sub) => (
                      <tr key={sub._id}>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--term-border)' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--term-border)' }} className={`status-${(sub.verdict || sub.status || 'Pending').split(/[\s.]/)[0]}`}>{sub.verdict || sub.status}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--term-border)' }}>{sub.executionTime != null ? `${sub.executionTime} ms` : '—'}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--term-border)' }}>{sub.language}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {leftTab === 'solutions' && (
            <div className={isPremiumLocked ? 'premium-blur-container' : ''} style={{ height: '100%' }}>
              {isPremiumLocked && (
                <div className="premium-blur-overlay">
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--lc-accent)' }}>Premium</span>
                  <p style={{ marginTop: '10px', color: 'var(--term-text-secondary)' }}>Unlock reference solutions and complexity notes.</p>
                  <Link to="/store" className="btn btn-submit" style={{ marginTop: '16px', display: 'inline-block' }}>View store</Link>
                </div>
              )}
              <div style={{ filter: isPremiumLocked ? 'blur(4px)' : 'none' }}>
                <p className="lc-muted" style={{ marginBottom: '12px', fontSize: '13px' }}>
                  Editorial tracks the language selected in the editor (
                  <strong>{LANGS.find((l) => l.id === language)?.label || language}</strong>
                  ).
                </p>
                <p style={{ lineHeight: 1.55 }}>{problem.solution?.explanation || 'Editorial coming soon.'}</p>
                <div style={{ marginTop: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                  <span><strong>Time:</strong> <code style={{ color: 'var(--lc-accent)' }}>{problem.solution?.timeComplexity || '—'}</code></span>
                  <span><strong>Space:</strong> <code style={{ color: 'var(--lc-accent)' }}>{problem.solution?.spaceComplexity || '—'}</code></span>
                </div>
                <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--lc-border)', minHeight: '180px' }}>
                  <Editor
                    key={`sol-${language}-${id}`}
                    height="240px"
                    language={monacoLang}
                    theme="vs-dark"
                    value={editorialText}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize problem panel"
        tabIndex={0}
        className={`workspace-resizer workspace-resizer--vertical${dragAxis === 'v' ? ' workspace-resizer--dragging' : ''}`}
        onMouseDown={onResizeVerticalDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setLeftPct((p) => Math.min(72, Math.max(22, p - 1)));
          if (e.key === 'ArrowRight') setLeftPct((p) => Math.min(72, Math.max(22, p + 1)));
        }}
      />

      <div className="workspace-col workspace-col--right" ref={rightColRef}>
        <div
          className="pane workspace-pane"
          style={{
            flex: `${editorFrac} 1 0`,
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div className="editor-toolbar">
            <select value={language} onChange={handleLanguageChange} className="lc-select">
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="workspace-editor-mount">
            <Editor
              key={`ed-${language}-${id}`}
              height="100%"
              language={monacoLang}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
          <div className="workspace-editor-actions">
            <span className="workspace-status">
              Status: <span className={`status-${(status || 'Idle').split(/[\s.]/)[0]}`}>{status || 'Idle'}</span>
            </span>
            <div className="workspace-run-group">
              <button type="button" onClick={handleRun} className="btn btn-primary">Run</button>
              <button type="button" onClick={handleSubmit} className="btn btn-submit">Submit</button>
            </div>
          </div>
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize editor and output"
          tabIndex={0}
          className={`workspace-resizer workspace-resizer--horizontal${dragAxis === 'h' ? ' workspace-resizer--dragging' : ''}`}
          onMouseDown={onResizeHorizontalDown}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') setEditorFrac((f) => Math.min(0.88, Math.max(0.15, f + 0.02)));
            if (e.key === 'ArrowDown') setEditorFrac((f) => Math.min(0.88, Math.max(0.15, f - 0.02)));
          }}
        />

        <div
          className="pane workspace-pane"
          style={{
            flex: `${1 - editorFrac} 1 0`,
            minHeight: 120,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="pane-tabs">
            <button type="button" className={`pane-tab ${bottomTab === 'output' ? 'active' : ''}`} onClick={() => setBottomTab('output')}>Output</button>
            <button type="button" className={`pane-tab ${bottomTab === 'testcases' ? 'active' : ''}`} onClick={() => setBottomTab('testcases')}>Test cases</button>
          </div>
          <div className="pane-content" style={{ background: 'var(--lc-bg-layer-1)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: 'none' }}>
            {bottomTab === 'testcases' && (
              <div>
                <p className="lc-muted" style={{ fontSize: '13px', marginBottom: '12px' }}>
                  Sample I/O shown here. Submit runs your code against the full hidden suite (typically 24–31 cases per problem).
                </p>
                <h3 style={{ marginBottom: '10px', fontSize: '15px' }}>Visible samples</h3>
                {problem.testCases?.filter((tc) => !tc.isHidden).map((tc, idx) => (
                  <div key={idx} className="tc-detail" style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>Sample {idx + 1}</div>
                    <div><strong>Input</strong><pre>{tc.input}</pre></div>
                    <div style={{ marginTop: '8px' }}><strong>Expected</strong><pre>{tc.output}</pre></div>
                  </div>
                ))}
              </div>
            )}

            {bottomTab === 'output' && (
              <div className="workspace-output-panel" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {status === 'Running…' || status === 'Pending…' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner" /> Judging all test cases in the sandbox…
                  </div>
                ) : output ? (
                  <div>
                    {totalCases > 0 && (
                      <div className="workspace-verdict-bar">
                        <strong className={`status-${(status || '').split(/[\s.]/)[0]}`}>{status}</strong>
                        <span style={{ fontSize: '13px', color: 'var(--lc-text-secondary)' }}>
                          {passedCount} / {totalCases} passed ({passPct}%)
                        </span>
                        <div className="tc-progress" title={`${passedCount} of ${totalCases}`}>
                          <div className="tc-progress-fill" style={{ width: `${passPct}%` }} />
                        </div>
                      </div>
                    )}
                    {!totalCases && (
                      <h3 className={`status-${(status || '').split(/[\s.]/)[0]}`} style={{ marginBottom: '12px' }}>{status}</h3>
                    )}
                    {output.executionTime != null && (
                      <div style={{ marginBottom: '10px', fontSize: '13px' }}><strong>Total runtime (sum of cases):</strong> {output.executionTime} ms</div>
                    )}
                    {output.error && (
                      <div className="example-box" style={{ color: 'var(--lc-red)', marginBottom: '12px' }}>{output.error}</div>
                    )}
                    {testResults && testResults.length > 0 && (
                      <>
                        <div style={{ fontSize: '12px', color: 'var(--lc-text-secondary)', marginBottom: '6px' }}>Click a case to expand details.</div>
                        <div className="tc-chip-grid">
                          {testResults.map((res, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`tc-chip ${res.passed ? 'tc-chip--pass' : 'tc-chip--fail'}`}
                              onClick={() => setDetailCaseIdx(detailCaseIdx === i ? null : i)}
                            >
                              #{i + 1} {res.passed ? '✓' : '✗'}
                            </button>
                          ))}
                        </div>
                        {detailCaseIdx != null && testResults[detailCaseIdx] && (
                          <div className="tc-detail">
                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                              Case {detailCaseIdx + 1}
                              {' '}
                              {testResults[detailCaseIdx].passed ? (
                                <span style={{ color: 'var(--lc-green)' }}>Passed</span>
                              ) : (
                                <span style={{ color: 'var(--lc-red)' }}>Failed</span>
                              )}
                            </div>
                            {testResults[detailCaseIdx].error && (
                              <div style={{ color: 'var(--lc-red)', marginBottom: '8px' }}>
                                <strong>Error</strong>
                                <pre>{testResults[detailCaseIdx].error}</pre>
                              </div>
                            )}
                            <div><strong>Input</strong><pre>{testResults[detailCaseIdx].input}</pre></div>
                            <div style={{ marginTop: '8px' }}><strong>Expected</strong><pre>{testResults[detailCaseIdx].expectedOutput}</pre></div>
                            {!testResults[detailCaseIdx].passed && (
                              <div style={{ marginTop: '8px' }}><strong>Your output</strong><pre>{testResults[detailCaseIdx].actualOutput || '—'}</pre></div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : <div style={{ color: 'var(--lc-text-secondary)' }}>Run or submit code to see results.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Workspace;
