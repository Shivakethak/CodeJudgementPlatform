const { exec } = require('child_process');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const execPromise = (cmd, timeoutMs) => {
  return new Promise((resolve) => {
    let timer;
    const process = exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      clearTimeout(timer);
      resolve({ error, stdout, stderr });
    });

    if (timeoutMs) {
      timer = setTimeout(() => {
        process.kill('SIGKILL');
        resolve({ error: new Error('Execution Timeout'), stdout: '', stderr: 'Execution Timeout' });
      }, timeoutMs);
    }
  });
};

const sanitizeOutput = (str) => {
  if (!str) return '';
  return str.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
};

const runSql = (code, testCases) => {
  const jobId = uuidv4();
  const jobDir = path.join(TEMP_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });
  let results = [];
  let maxExecutionTime = 0;
  let overallVerdict = 'Accepted';

  try {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const scriptPath = path.join(jobDir, `run_${i}.sql`);
      const fullScript = `${(tc.input || '').trim()}\n${(code || '').trim()}\n`;
      fs.writeFileSync(scriptPath, fullScript, 'utf8');
      const readArg = `.read ${scriptPath.split(path.sep).join('/')}`;

      const start = Date.now();
      const r = spawnSync('sqlite3', [':memory:', readArg], {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        timeout: 15000,
      });
      const execTime = Date.now() - start;
      maxExecutionTime = Math.max(maxExecutionTime, execTime);

      const failed = r.error || (typeof r.status === 'number' && r.status !== 0);
      if (failed) {
        overallVerdict = 'Runtime Error';
        results.push({
          passed: false,
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: (r.stdout || '').substring(0, 1000),
          error: ((r.stderr || r.error?.message || 'SQL error') + '').substring(0, 1000),
        });
        break;
      }

      const stdout = r.stdout || '';
      const cleanExpected = sanitizeOutput(tc.output);
      const cleanActual = sanitizeOutput(stdout);
      let tcVerdict = 'Accepted';
      if (cleanExpected !== cleanActual) {
        tcVerdict = 'Wrong Answer';
        if (overallVerdict === 'Accepted') overallVerdict = 'Wrong Answer';
      }

      results.push({
        passed: tcVerdict === 'Accepted',
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: stdout.substring(0, 1000),
        error: null
      });

      if (tcVerdict !== 'Accepted') break;
    }
  } finally {
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
    } catch (e) {}
  }

  return {
    verdict: overallVerdict,
    executionTime: maxExecutionTime,
    testCaseResults: results
  };
};

const executeCode = async (language, code, testCases) => {
  if (language === 'sql') {
    return runSql(code, testCases);
  }

  const jobId = uuidv4();
  const jobDir = path.join(TEMP_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  let filename, runCmd, compileCmd, image;

  switch (language) {
    case 'python':
      filename = 'main.py';
      image = 'python:3.10-alpine';
      runCmd = `python ${filename}`;
      break;
    case 'javascript':
      filename = 'main.js';
      image = 'node:18-alpine';
      runCmd = `node ${filename}`;
      break;
    case 'java':
      filename = 'Main.java';
      image = 'eclipse-temurin:17-alpine';
      compileCmd = `javac ${filename}`;
      runCmd = `java Main`;
      break;
    case 'cpp':
      filename = 'main.cpp';
      image = 'gcc:latest';
      compileCmd = `g++ ${filename} -o main`;
      runCmd = `./main`;
      break;
    case 'c':
      filename = 'main.c';
      image = 'gcc:latest';
      compileCmd = `gcc ${filename} -o main`;
      runCmd = `./main`;
      break;
    default:
      return { verdict: 'Runtime Error', testCaseResults: [], message: 'Unsupported language' };
  }

  const filepath = path.join(jobDir, filename);
  fs.writeFileSync(filepath, code);

  let results = [];
  let compileError = false;
  let maxExecutionTime = 0;
  let overallVerdict = 'Accepted';

  const { stdout: containerIdStr, error: startErr } = await execPromise(
    `docker run -d --rm --network=none --memory=128m --cpus=0.5 -w /app ${image} sleep 3600`, 10000
  );

  if (startErr) {
    return { verdict: 'System Error', executionTime: 0, testCaseResults: [], error: 'Failed to start sandbox' };
  }
  const containerId = containerIdStr.trim();

  try {
    const { error: cpErr } = await execPromise(`docker cp "${jobDir}/." ${containerId}:/app/`, 10000);
    if (cpErr) throw new Error('File transfer failed');

    if (compileCmd) {
      const compileResult = await execPromise(
        `docker exec -w /app ${containerId} sh -c "${compileCmd}"`, 10000
      );
      if (compileResult.error) {
        compileError = true;
        overallVerdict = 'Compilation Error';
        return { verdict: overallVerdict, executionTime: 0, testCaseResults: [], error: compileResult.stderr };
      }
    }

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcInputFile = path.join(jobDir, `input_${i}.txt`);
      fs.writeFileSync(tcInputFile, tc.input);
      await execPromise(`docker cp "${tcInputFile}" ${containerId}:/app/`, 5000);

      const start = Date.now();

      const cCmd = `docker exec -w /app ${containerId} sh -c "${runCmd} < input_${i}.txt"`;

      const { error, stdout, stderr } = await execPromise(cCmd, 15000);

      const execTime = Date.now() - start;
      maxExecutionTime = Math.max(maxExecutionTime, execTime);

      let tcVerdict = 'Accepted';
      let tcError = null;

      if (error && error.message === 'Execution Timeout') {
        tcVerdict = 'Time Limit Exceeded';
        tcError = 'Timeout';
        overallVerdict = 'Time Limit Exceeded';
      } else if (error || stderr) {
        tcVerdict = 'Runtime Error';
        tcError = stderr || (error ? error.message : '');
        if (overallVerdict === 'Accepted') overallVerdict = 'Runtime Error';
      } else {
        const cleanExpected = sanitizeOutput(tc.output);
        const cleanActual = sanitizeOutput(stdout);

        if (cleanExpected !== cleanActual) {
          tcVerdict = 'Wrong Answer';
          if (overallVerdict === 'Accepted') overallVerdict = 'Wrong Answer';
        }
      }

      results.push({
        passed: tcVerdict === 'Accepted',
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: stdout.substring(0, 1000),
        error: tcError ? tcError.substring(0, 1000) : null
      });

      if (tcVerdict !== 'Accepted') {
        break;
      }
    }
  } finally {
    await execPromise(`docker kill ${containerId}`, 5000);
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
    } catch (e) {}
  }

  return {
    verdict: overallVerdict,
    executionTime: maxExecutionTime,
    testCaseResults: results
  };
};

module.exports = { executeCode };
