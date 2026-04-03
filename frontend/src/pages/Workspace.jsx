import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';

function Workspace() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  
  const [codeMap, setCodeMap] = useState({
    python: '',
    java: '',
    cpp: '',
    c: '',
    javascript: ''
  });
  
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [timer, setTimer] = useState(0);
  const [activeTab, setActiveTab] = useState('testcases');
  const [leftTab, setLeftTab] = useState('description');
  const [submissionHistory, setSubmissionHistory] = useState([]);
  
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  let pollingInterval = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/problems/${id}`);
        setProblem(res.data);
        
        if (res.data.templates) {
          setCodeMap(prev => ({
            ...prev,
            ...res.data.templates
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      const token = user.token;
      const res = await axios.get(`${API_URL}/submissions/history?problemId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissionHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (leftTab === 'submissions') {
      fetchSubmissions();
    }
  }, [leftTab]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleCodeChange = (newVal) => {
    setCodeMap(prev => ({
      ...prev,
      [language]: newVal
    }));
  };

  const code = codeMap[language] || '';

  const handleRun = async () => {
    if (!user) return alert('Please login to run code');
    setStatus('Running...');
    setOutput(null);
    try {
      const token = user.token;
      const res = await axios.post(`${API_URL}/submissions/run`, {
        problemId: id,
        code,
        language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOutput(res.data);
      setStatus(res.data.verdict);
    } catch (err) {
      setOutput(err.response?.data || { error: 'Execution failed' });
      setStatus('Compiler Error');
    }
    setActiveTab('output');
  };

  const pollSubmission = async (jobId) => {
    try {
      // For optionalAuth token may be null, but we'll try user.token if it exists
      const token = user ? user.token : null;
      const res = await axios.get(`${API_URL}/submissions/status/${jobId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const { submission } = res.data;
      if (submission.status === 'Completed') {
        clearInterval(pollingInterval.current);
        setOutput(submission);
        setStatus(submission.verdict);
      } else {
        setStatus(submission.status);
      }
    } catch (err) {
      clearInterval(pollingInterval.current);
      setStatus('Error checking status');
    }
  };

  const handleSubmit = async () => {
    if (!user) return alert('Please login to submit code');
    setStatus('Pending...');
    setOutput(null);
    try {
      const token = user.token;
      const res = await axios.post(`${API_URL}/submissions/submit`, {
        problemId: id,
        code,
        language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const jobId = res.data.jobId;
      pollingInterval.current = setInterval(() => pollSubmission(jobId), 1500);
      
    } catch (err) {
      console.error('Submit Error:', err.response?.data || err.message);
      setStatus(err.response?.data?.message || err.message || 'Submission Error');
    }
    setActiveTab('output');
  };

  if (!problem) return <div style={{padding: '2rem'}}>Loading...</div>;

  const isPremiumLocked = problem.isPremium && (!user || !user.isPremiumStatus);

  return (
    <div className="workspace">
      
      {/* LEFT PANE */}
      <div className="pane" style={{ flex: 1.2 }}>
        <div className="pane-tabs">
          <button className={`pane-tab ${leftTab === 'description' ? 'active' : ''}`} onClick={() => setLeftTab('description')}>Description</button>
          <button className={`pane-tab ${leftTab === 'solution' ? 'active' : ''}`} onClick={() => setLeftTab('solution')}>Solutions</button>
          <button className={`pane-tab ${leftTab === 'submissions' ? 'active' : ''}`} onClick={() => setLeftTab('submissions')}>Submissions</button>
        </div>

        <div className="pane-content">
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
              
              <div style={{ marginTop: '30px' }}>
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
                    <li key={idx}><code style={{background: 'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'4px'}}>{c}</code></li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {leftTab === 'solution' && (
            <div className={isPremiumLocked ? 'premium-blur-container' : ''} style={{ height: '100%' }}>
              <h2>Optimized Approach</h2>
              
              {isPremiumLocked && (
                <div className="premium-blur-overlay">
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--lc-accent)' }}>Premium Content</span>
                  <p style={{ marginTop: '10px', color: '#fff' }}>Subscribe to unlock editorials and optimized code solutions.</p>
                  <button className="btn btn-submit" style={{ marginTop: '20px', background: 'var(--lc-accent)', color: '#000' }}>Subscribe Now</button>
                </div>
              )}

              <div style={{ marginTop: '20px', lineHeight: '1.6', filter: isPremiumLocked ? 'blur(4px)' : 'none' }}>
                <p>{problem.solution?.explanation || "Solution currently unavailable."}</p>
                
                <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', gap: '20px' }}>
                  <span><strong>Time Complexity:</strong> <code style={{color: 'var(--lc-accent)'}}>{problem.solution?.timeComplexity}</code></span>
                  <span><strong>Space Complexity:</strong> <code style={{color: 'var(--lc-accent)'}}>{problem.solution?.spaceComplexity}</code></span>
                </div>

                <h3>Code Implementation ({language})</h3>
                <pre style={{ marginTop: '10px', padding: '16px', borderRadius: '8px', overflowX: 'auto', background: 'var(--lc-bg-layer-2)' }}>
                  {problem.solution?.code?.[language] || problem.solution?.code || "// Solution currently unavailable for this language."}
                </pre>
              </div>
            </div>
          )}

          {leftTab === 'submissions' && (
            <div>
              <h3>Past Submissions</h3>
              {!user ? (
                <p style={{marginTop: '20px', color: 'var(--lc-text-secondary)'}}>Please sign in to view your submissions.</p>
              ) : submissionHistory.length === 0 ? (
                <p style={{marginTop: '20px', color: 'var(--lc-text-secondary)'}}>No submissions found for this problem.</p>
              ) : (
                <table className="problemset-table" style={{marginTop: '20px', borderSpacing: 0, width: '100%'}}>
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #333'}}>Time Submitted</th>
                      <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #333'}}>Status</th>
                      <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #333'}}>Runtime</th>
                      <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #333'}}>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionHistory.map(sub => (
                      <tr key={sub._id}>
                        <td style={{padding: '8px', borderBottom: '1px solid #333'}}>{new Date(sub.createdAt).toLocaleString()}</td>
                        <td style={{padding: '8px', borderBottom: '1px solid #333'}} className={`status-${sub.verdict?.split(' ')[0] || 'Pending'}`}>{sub.verdict || sub.status}</td>
                        <td style={{padding: '8px', borderBottom: '1px solid #333'}}>{sub.executionTime ? sub.executionTime + ' ms' : 'N/A'}</td>
                        <td style={{padding: '8px', borderBottom: '1px solid #333'}}>{sub.language}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {/* Editor Area */}
        <div className="pane" style={{ flex: 1.5 }}>
          <div className="editor-toolbar">
            <select value={language} onChange={handleLanguageChange} className="lc-select">
              <option value="python">Python3</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <Editor
            height="100%"
            language={language === 'c' || language === 'cpp' ? 'cpp' : language}
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
              Status: <span className={`status-${status.split(' ')[0]}`}>{status || 'Idle'}</span>
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleRun} className="btn btn-primary">Run</button>
              <button onClick={handleSubmit} className="btn btn-submit">Submit</button>
            </div>
          </div>
        </div>

        {/* Bottom Tabs Panel */}
        <div className="pane" style={{ flex: 0.8, overflow: 'auto' }}>
          <div className="pane-tabs">
            <button className={`pane-tab ${activeTab === 'output' ? 'active' : ''}`} onClick={() => setActiveTab('output')}>Output</button>
            <button className={`pane-tab ${activeTab === 'testcases' ? 'active' : ''}`} onClick={() => setActiveTab('testcases')}>Test Cases</button>
          </div>
          <div className="pane-content" style={{ background: '#282828' }}>
            
            {activeTab === 'testcases' && (
                <div>
                    {!output && !status && <div style={{color: 'var(--lc-text-secondary)'}}>Run or submit code to see results. Click on Output to see logs.</div>}
                    <h3 style={{marginBottom: '10px'}}>Visible Test Cases</h3>
                    {problem.testCases?.filter(tc => !tc.isHidden).map((tc, idx) => (
                      <div key={idx} style={{ marginBottom: '16px', background: 'var(--lc-bg-layer-1)', padding: '12px', borderRadius: '8px' }}>
                        <div><strong>Test Case {idx+1}</strong></div>
                        <div style={{ marginTop: '10px', fontSize: '13px' }}>
                          <div><strong>Input:</strong> <pre style={{margin: '4px 0'}}>{tc.input}</pre></div>
                          <div style={{ marginTop: '8px' }}><strong>Expected Output:</strong> <pre style={{margin: '4px 0'}}>{tc.output}</pre></div>
                        </div>
                      </div>
                    ))}
                </div>
            )}
            
            {activeTab === 'output' && (
              <div>
                {status === 'Running...' || status === 'Pending...' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner"></div> Wait, judging...
                  </div>
                ) : output ? (
                  <div>
                    <h3 className={`status-${status.split(' ')[0]}`} style={{ marginBottom: '16px' }}>{status}</h3>
                    
                    {output.executionTime && <div style={{marginBottom: '10px', fontSize: '13px'}}><strong>Runtime:</strong> {output.executionTime} ms</div>}
                    
                    {output.error && (
                      <div className="example-box" style={{ color: 'var(--lc-red)' }}>
                        {output.error}
                      </div>
                    )}
                    
                    {output.testCaseResults && output.testCaseResults.map((res, i) => (
                      <div key={i} style={{ marginBottom: '16px', background: 'var(--lc-bg-layer-1)', padding: '12px', borderRadius: '8px' }}>
                        <div><strong>Test Case {i+1}</strong>: {res.passed ? <span style={{color: 'var(--lc-green)'}}>Passed</span> : <span style={{color: 'var(--lc-red)'}}>Failed</span>}</div>
                        
                        <div style={{ marginTop: '10px', fontSize: '13px' }}>
                          {res.error && <strong style={{color: 'var(--lc-red)'}}>Error:<br/><pre style={{marginBottom: '8px', color: 'var(--lc-red)'}}>{res.error}</pre></strong>}
                          <div><strong>Input:</strong> <pre style={{margin: '4px 0'}}>{res.input}</pre></div>
                          <div style={{ marginTop: '8px' }}><strong>Expected Output:</strong> <pre style={{margin: '4px 0'}}>{res.expectedOutput}</pre></div>
                          {!res.passed && (
                            <div style={{ marginTop: '8px' }}><strong>Actual Output:</strong> <pre style={{margin: '4px 0'}}>{res.actualOutput || 'Empty String'}</pre></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div style={{color: 'var(--lc-text-secondary)'}}>Run or submit code to see results.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
