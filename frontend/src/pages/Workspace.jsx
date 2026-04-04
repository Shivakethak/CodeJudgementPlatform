import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import api, { authHeaders } from '../services/api';
import { getSocket } from '../services/socket';

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

  return (
    <div className="workspace">
      <div className="pane" style={{ flex: 1.12, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {contestId && (
          <div className="lc-banner lc-banner--ok" style={{ marginBottom: '12px', padding: '10px 14px', flexShrink: 0 }}>
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
              <div className="problem-meta">
                <span className={`difficulty-${problem.difficulty}`}>{problem.difficulty}</span>
                {problem.isPremium && <span className="premium-tag" style={{ marginLeft: 0 }}>Premium</span>}
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
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Time</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Verdict</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Runtime</th>
                      <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Lang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionHistory.map((sub) => (
                      <tr key={sub._id}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #333' }} className={`status-${(sub.verdict || sub.status || 'Pending').split(/[\s.]/)[0]}`}>{sub.verdict || sub.status}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{sub.executionTime != null ? `${sub.executionTime} ms` : '—'}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{sub.language}</td>
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
                  <p style={{ marginTop: '10px', color: '#fff' }}>Unlock reference solutions and complexity notes.</p>
                  <Link to="/store" className="btn btn-submit" style={{ marginTop: '16px', background: 'var(--lc-accent)', color: '#000', display: 'inline-block' }}>View store</Link>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
        <div className="pane" style={{ flex: 1.5, minHeight: 0 }}>
          <div className="editor-toolbar">
            <select value={language} onChange={handleLanguageChange} className="lc-select">
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
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
          <div className="pane-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--lc-bg-layer-2)', borderTop: '1px solid var(--lc-border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--lc-text-secondary)', alignSelf: 'center' }}>
              Status: <span className={`status-${(status || 'Idle').split(/[\s.]/)[0]}`}>{status || 'Idle'}</span>
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleRun} className="btn btn-primary">Run</button>
              <button type="button" onClick={handleSubmit} className="btn btn-submit">Submit</button>
            </div>
          </div>
        </div>

        <div className="pane" style={{ flex: 0.85, overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
          <div className="pane-tabs">
            <button type="button" className={`pane-tab ${bottomTab === 'output' ? 'active' : ''}`} onClick={() => setBottomTab('output')}>Output</button>
            <button type="button" className={`pane-tab ${bottomTab === 'testcases' ? 'active' : ''}`} onClick={() => setBottomTab('testcases')}>Test cases</button>
          </div>
          <div className="pane-content" style={{ background: 'var(--lc-bg-layer-1)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
  );
}

export default Workspace;
