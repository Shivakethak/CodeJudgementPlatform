/**
 * Two-client Socket.IO verification against a running backend (e.g. docker compose).
 * Usage: node scripts/two-client-socket-smoke.js [BASE_URL]
 * Default BASE_URL: http://localhost:5000
 */
const axios = require('axios');
const { io } = require('socket.io-client');

const BASE = process.argv[2] || 'http://localhost:5000';
const API = `${BASE.replace(/\/$/, '')}/api`;

const logEv = (clientName, event, payload) => {
  const preview =
    payload && typeof payload === 'object'
      ? JSON.stringify(payload).slice(0, 220) + (JSON.stringify(payload).length > 220 ? '…' : '')
      : String(payload);
  console.log(`[${clientName}] ${event}: ${preview}`);
};

async function register(email, password) {
  const { data } = await axios.post(`${API}/auth/register`, { email, password });
  return data.token;
}

async function main() {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const email1 = `sock_a_${suffix}@test.local`;
  const email2 = `sock_b_${suffix}@test.local`;
  const password = 'SmokeTest!123';

  const token1 = await register(email1, password);
  const token2 = await register(email2, password);

  const { data: challenge } = await axios.get(`${API}/challenges/current`);
  const challengeId = challenge._id;
  const problemId =
    challenge.problems && challenge.problems.length > 0
      ? challenge.problems[0]._id || challenge.problems[0]
      : null;

  await axios.post(
    `${API}/challenges/${challengeId}/join`,
    {},
    { headers: { Authorization: `Bearer ${token1}` } }
  );
  await axios.post(
    `${API}/challenges/${challengeId}/join`,
    {},
    { headers: { Authorization: `Bearer ${token2}` } }
  );

  const events1 = [];
  const events2 = [];

  const client1 = io(BASE, {
    transports: ['websocket'],
    auth: { token: token1 },
  });
  const client2 = io(BASE, {
    transports: ['websocket'],
    auth: { token: token2 },
  });

  const watch = (socket, name, bucket) => {
    [
      'connect',
      'connect_error',
      'disconnect',
      'contest:timer',
      'contest:status',
      'leaderboard:updated',
      'submission:running',
      'submission:completed',
    ].forEach((ev) => {
      socket.on(ev, (payload) => {
        bucket.push({ name, ev, t: Date.now(), payload });
        logEv(name, ev, payload);
      });
    });
  };

  watch(client1, 'client1(submitter)', events1);
  watch(client2, 'client2(observer)', events2);

  await new Promise((resolve) => {
    let n = 0;
    const done = () => {
      n += 1;
      if (n >= 2) resolve();
    };
    client1.on('connect', done);
    client2.on('connect', done);
    client1.on('connect_error', done);
    client2.on('connect_error', done);
    setTimeout(resolve, 8000);
  });

  client1.emit('challenge:subscribe', challengeId);
  client2.emit('challenge:subscribe', challengeId);

  await new Promise((r) => setTimeout(r, 3500));

  if (problemId) {
    const twoSumPy = `import sys
data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1+n]))
target = int(data[1+n])
for i in range(n):
    for j in range(i+1, n):
        if nums[i] + nums[j] == target:
            print(i, j)
            break
`;
    console.log('\n-- POST submit (user1) problemId=', problemId);
    await axios.post(
      `${API}/submissions/submit`,
      { problemId, language: 'python', code: twoSumPy },
      { headers: { Authorization: `Bearer ${token1}` } }
    );
  } else {
    console.log('\n-- Skip submit: active challenge has no problems linked; timer/leaderboard socket smoke only.');
  }

  await new Promise((r) => setTimeout(r, 12000));

  client1.disconnect();
  client2.disconnect();

  console.log('\n=== Summary ===');
  console.log('client1 events:', events1.map((e) => `${e.ev}@${new Date(e.t).toISOString()}`).join(', ') || '(none)');
  console.log('client2 events:', events2.map((e) => `${e.ev}@${new Date(e.t).toISOString()}`).join(', ') || '(none)');

  const c2hasLb = events2.some((e) => e.ev === 'leaderboard:updated');
  const c1hasRun = events1.some((e) => e.ev === 'submission:running');
  const c1hasDone = events1.some((e) => e.ev === 'submission:completed');

  const timerOk = events1.some((e) => e.ev === 'contest:timer') && events2.some((e) => e.ev === 'contest:timer');
  console.log('contest:timer on both:', timerOk);
  if (problemId) {
    console.log('submission:running (client1):', c1hasRun);
    console.log('submission:completed (client1):', c1hasDone);
    console.log('leaderboard:updated (client2):', c2hasLb);
  }
}

main().catch((err) => {
  console.error(err.response?.data || err.message || err);
  process.exit(1);
});
