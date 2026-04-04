/**
 * Deterministic bulk test cases for canonical problems (judge runs every case in Docker/sqlite).
 */

function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}

function buildTwoSumCases(targetCount = 28) {
  const cases = [];
  const fixed = [
    { nums: [2, 7, 11, 15], target: 9 },
    { nums: [3, 2, 4], target: 6 },
    { nums: [3, 3], target: 6 }
  ];
  fixed.forEach((f, k) => {
    const pair = twoSumBrute(f.nums, f.target);
    const n = f.nums.length;
    const input = `${n}\n${f.nums.join(' ')}\n${f.target}`;
    const output = `[${pair[0]}, ${pair[1]}]`;
    cases.push({ input, output, isHidden: k >= 2 });
  });

  let t = 0;
  while (cases.length < targetCount) {
    const len = 4 + (t % 7);
    const nums = [];
    for (let i = 0; i < len; i++) {
      nums.push(((i * 31 + t * 7) % 199) - 99);
    }
    const target = nums[0] + nums[len - 1];
    const pair = twoSumBrute(nums, target);
    if (!pair) {
      t++;
      continue;
    }
    const input = `${len}\n${nums.join(' ')}\n${target}`;
    const output = `[${pair[0]}, ${pair[1]}]`;
    cases.push({ input, output, isHidden: true });
    t++;
  }
  return cases.slice(0, targetCount);
}

function fibIter(n) {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return b;
}

function buildFibCases() {
  const cases = [];
  for (let n = 0; n <= 30; n++) {
    const v = fibIter(n);
    cases.push({
      input: String(n),
      output: String(v),
      isHidden: n > 2
    });
  }
  return cases;
}

function expectedPalindrome(x) {
  if (x < 0) return 'false';
  if (x !== 0 && x % 10 === 0) return 'false';
  let r = 0;
  let t = x;
  while (t > r) {
    r = r * 10 + (t % 10);
    t = Math.floor(t / 10);
  }
  return t === r || t === Math.floor(r / 10) ? 'true' : 'false';
}

function buildPalindromeCases(targetCount = 28) {
  const xs = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    11, 22, 101, 121, 1001, 12321, 1234321, 123454321,
    -1, -121, 10, 100, 1230, 1234567890,
    2147483647, -2147483648, 1000021, 1234567, 7654321
  ];
  while (xs.length < targetCount) {
    const k = xs.length;
    xs.push(10000 + k * 1337);
  }
  return xs.slice(0, targetCount).map((x, i) => ({
    input: String(x),
    output: expectedPalindrome(x),
    isHidden: i >= 2
  }));
}

function buildSqlInvCases(problemIndex, targetCount = 24) {
  const cases = [];
  for (let j = 0; j < targetCount; j++) {
    const x = 5 + ((problemIndex * 7 + j * 11) % 97);
    const y = 11 + ((problemIndex * 3 + j * 5) % 83);
    const sum = x + y;
    cases.push({
      input: `CREATE TABLE inv(id INTEGER, qty INTEGER);
INSERT INTO inv VALUES (1, ${x});
INSERT INTO inv VALUES (2, ${y});`,
      output: String(sum),
      isHidden: j >= 2
    });
  }
  return cases;
}

/** variant: 0=SUM, 1=COUNT(*), 2=MAX(qty), 3=MIN(qty) */
function buildSqlInvCasesVariant(problemIndex, variant, targetCount = 24) {
  const cases = [];
  for (let j = 0; j < targetCount; j++) {
    const x = 5 + ((problemIndex * 7 + j * 11) % 97);
    const y = 11 + ((problemIndex * 3 + j * 5) % 83);
    let out;
    if (variant === 0) out = String(x + y);
    else if (variant === 1) out = '2';
    else if (variant === 2) out = String(Math.max(x, y));
    else out = String(Math.min(x, y));
    cases.push({
      input: `CREATE TABLE inv(id INTEGER, qty INTEGER);
INSERT INTO inv VALUES (1, ${x});
INSERT INTO inv VALUES (2, ${y});`,
      output: out,
      isHidden: j >= 2
    });
  }
  return cases;
}

function buildMaxArrayCases(targetCount = 28) {
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const len = 3 + (k % 15);
    const nums = [];
    for (let i = 0; i < len; i++) nums.push(((i * 17 + k * 11) % 200) - 100);
    const mx = Math.max(...nums);
    cases.push({
      input: `${len}\n${nums.join(' ')}`,
      output: String(mx),
      isHidden: k >= 2
    });
  }
  return cases;
}

function buildSumArrayCases(targetCount = 28) {
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const len = 2 + (k % 20);
    const nums = [];
    let s = 0;
    for (let i = 0; i < len; i++) {
      const v = ((i * 13 + k * 7) % 101) - 50;
      nums.push(v);
      s += v;
    }
    cases.push({
      input: `${len}\n${nums.join(' ')}`,
      output: String(s),
      isHidden: k >= 2
    });
  }
  return cases;
}

function buildReverseStringCases(targetCount = 28) {
  const seeds = [
    'hello', 'CodeJudge', 'a', 'racecar', 'OpenAI', '12345', 'z', 'palindrome',
    'data', 'structure', 'stack', 'queue', 'heap', 'tree', 'graph', 'hash',
    'sliding', 'window', 'binary', 'search', 'sort', 'merge', 'quick', 'radix',
    'trie', 'segment', 'fenwick', 'union', 'find', 'path', 'flow'
  ];
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const base = seeds[k % seeds.length];
    const s = `${base}${k >= 8 ? 'x'.repeat((k % 4) + 1) : ''}`;
    const rev = s.split('').reverse().join('');
    cases.push({ input: s, output: rev, isHidden: k >= 2 });
  }
  return cases;
}

function expectedValidParens(str) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (!stack.length || stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}

function buildValidParenthesesCases(targetCount = 28) {
  /* Non-empty Mongo strings only (schema required); blank line case uses newline. */
  const seeds = [
    '()',
    '()[]{}',
    '(]',
    '([)]',
    '{[]}',
    '((()))',
    '([{}])',
    '\n',
    '(',
    '())',
    '[](){}',
    '(((())))',
    '[({})]',
    '([)]',
    '()()()',
    '{[()]}',
    '([)]',
    '((()))[]',
    '([)]',
    '()',
    '(((())))',
    '[]',
    '{}',
    '([)]',
    '()[]{}',
    '(((())))',
    '([)]',
    '()'
  ];
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const s = seeds[k % seeds.length];
    const out = expectedValidParens(s) ? 'true' : 'false';
    cases.push({ input: s, output: out, isHidden: k >= 2 });
  }
  return cases;
}

function climbStairsWays(n) {
  if (n <= 2) return n;
  let a = 1;
  let b = 2;
  for (let i = 3; i <= n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return b;
}

function buildClimbingStairsCases(targetCount = 28) {
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const n = 1 + (k % 25);
    cases.push({
      input: String(n),
      output: String(climbStairsWays(n)),
      isHidden: k >= 2
    });
  }
  return cases;
}

function intSqrtFloor(n) {
  let lo = 0;
  let hi = n;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (m * m <= n) lo = m + 1;
    else hi = m - 1;
  }
  return hi;
}

function buildIntSqrtCases(targetCount = 28) {
  const preset = [0, 1, 2, 3, 4, 8, 9, 15, 16, 100, 2147395599, 1000000, 9999999];
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const n = k < preset.length ? preset[k] : ((k * 7919) % 10000000);
    const out = intSqrtFloor(n);
    cases.push({
      input: String(n),
      output: String(out),
      isHidden: k >= 2
    });
  }
  return cases;
}

function shuffleDeterministic(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSingleNumberCases(targetCount = 28) {
  const cases = [];
  for (let k = 0; k < targetCount; k++) {
    const singleton = 500 + k * 31;
    const nums = [];
    const pairs = 6 + (k % 8);
    for (let i = 0; i < pairs; i++) {
      const v = 2 + i * 3 + (k % 17);
      nums.push(v, v);
    }
    nums.push(singleton);
    const shuffled = shuffleDeterministic(nums, k + 17);
    cases.push({
      input: `${shuffled.length}\n${shuffled.join(' ')}`,
      output: String(singleton),
      isHidden: k >= 2
    });
  }
  return cases;
}

module.exports = {
  buildTwoSumCases,
  buildFibCases,
  buildPalindromeCases,
  buildSqlInvCases,
  buildSqlInvCasesVariant,
  buildMaxArrayCases,
  buildSumArrayCases,
  buildReverseStringCases,
  buildValidParenthesesCases,
  buildClimbingStairsCases,
  buildIntSqrtCases,
  buildSingleNumberCases
};
