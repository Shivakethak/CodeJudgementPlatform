const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const StudyPlan = require('../models/StudyPlan');
const DiscussPost = require('../models/DiscussPost');
const { generateBulkClones, generateSqlBank, CANONICALS } = require('./canonicalBulk');
const { buildPalindromeCases } = require('./testCaseGenerators');

const BATCH = 250;
/** 6 heroes + BULK_CLONE_COUNT + SQL_COUNT ≈ 1000 total problems */
const BULK_CLONE_COUNT = 944;
const SQL_COUNT = 50;

async function insertInBatches(documents) {
  const inserted = [];
  for (let i = 0; i < documents.length; i += BATCH) {
    const chunk = documents.slice(i, i + BATCH);
    const res = await Problem.insertMany(chunk);
    inserted.push(...res);
  }
  return inserted;
}

const seedProblems = async () => {
  try {
    await StudyPlan.deleteMany({});
    await DiscussPost.deleteMany({});
    const WeeklyChallenge = require('../models/WeeklyChallenge');
    await WeeklyChallenge.deleteMany({});

    await Problem.deleteMany({});
    console.log('Cleared existing problems');
    console.log(`Algorithm archetypes in catalog rotation: ${CANONICALS.length}`);

    const twoSumHero = JSON.parse(JSON.stringify(CANONICALS[0]));
    twoSumHero.stats = { totalSubmissions: 0, acceptedSubmissions: 0 };

    const problemsList = [
      twoSumHero,
      {
        title: 'Palindrome Number',
        description:
          'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nA palindrome is a number that reads the same backward as forward.',
        difficulty: 'Easy',
        isPremium: false,
        topics: ['Math'],
        companies: ['Facebook', 'Microsoft', 'Bloomberg'],
        stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
        constraints: ['-2^31 <= x <= 2^31 - 1'],
        examples: [
          {
            input: 'x = 121',
            output: 'true',
            explanation: '121 reads as 121 from left to right and from right to left.'
          }
        ],
        testCases: buildPalindromeCases(28),
        templates: {
          python:
            'def isPalindrome(x):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    x = int(sys.stdin.read().strip())\n    print("true" if isPalindrome(x) else "false")',
          javascript:
            'function isPalindrome(x) {\n}\nconst fs = require("fs");\nconst x = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim());\nconsole.log(isPalindrome(x) ? "true" : "false");',
          java:
            'import java.util.*;\npublic class Main {\n    public static boolean isPalindrome(int x) { return false; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(isPalindrome(sc.nextInt()) ? "true" : "false");\n    }\n}',
          cpp:
            '#include <bits/stdc++.h>\nusing namespace std;\nbool isPalindrome(int x) { return false; }\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);int x;cin>>x;cout<<(isPalindrome(x)?"true":"false")<<endl;return 0;}\n',
          c:
            '#include <stdio.h>\n#include <stdbool.h>\nbool isPalindrome(int x) { return false; }\nint main(){int x;if(scanf("%d",&x)!=1)return 0;printf("%s\\n",isPalindrome(x)?"true":"false");return 0;}\n',
          sql: '-- N/A: algorithm problem\nSELECT 1;\n'
        },
        solution: {
          code: {
            python: `def isPalindrome(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    r = 0
    while x > r:
        r = r * 10 + x % 10
        x //= 10
    return x == r or x == r // 10`,
            javascript: `function isPalindrome(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let r = 0;
  while (x > r) {
    r = r * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  return x === r || x === Math.floor(r / 10);
}`,
            java: `public boolean isPalindrome(int x) {
  if (x < 0 || (x % 10 == 0 && x != 0)) return false;
  int r = 0;
  while (x > r) {
    r = r * 10 + x % 10;
    x /= 10;
  }
  return x == r || x == r / 10;
}`,
            cpp: `bool isPalindrome(int x) {
  if (x < 0 || (x % 10 == 0 && x != 0)) return false;
  long r = 0;
  while (x > r) {
    r = r * 10 + x % 10;
    x /= 10;
  }
  return x == r || x == r / 10;
}`,
            c: `bool isPalindrome(int x) {
  if (x < 0 || (x % 10 == 0 && x != 0)) return false;
  long r = 0;
  while (x > r) {
    r = r * 10 + x % 10;
    x /= 10;
  }
  return x == r || x == r / 10;
}`
          },
          explanation: 'Reverse half the digits numerically and compare.',
          timeComplexity: 'O(log10 x)',
          spaceComplexity: 'O(1)'
        }
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        isPremium: false,
        topics: ['Hash Table', 'String', 'Sliding Window'],
        companies: ['Amazon', 'Microsoft', 'Bloomberg'],
        stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
        constraints: [
          '0 <= s.length <= 5 * 10^4',
          's consists of English letters, digits, symbols and spaces.'
        ],
        examples: [
          {
            input: 's = "abcabcbb"',
            output: '3',
            explanation: 'The answer is "abc", with the length of 3.'
          }
        ],
        testCases: [
          { input: 'abcabcbb', output: '3', isHidden: false },
          { input: 'bbbbb', output: '1', isHidden: false },
          { input: 'pwwkew', output: '3', isHidden: true }
        ],
        templates: {
          python:
            'def lengthOfLongestSubstring(s):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(lengthOfLongestSubstring(s))',
          javascript:
            'function lengthOfLongestSubstring(s) {\n}\nconst fs = require("fs");\nconst s = fs.readFileSync("/dev/stdin", "utf-8").trim();\nconsole.log(lengthOfLongestSubstring(s));',
          java:
            'import java.util.*;\npublic class Main {\n    public static Map<Character,Integer> m;\n    public static int lengthOfLongestSubstring(String s) { return 0; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(lengthOfLongestSubstring(s));\n    }\n}',
          cpp:
            '#include <bits/stdc++.h>\nusing namespace std;\nint lengthOfLongestSubstring(string s){return 0;}\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);string s;getline(cin,s);cout<<lengthOfLongestSubstring(s)<<endl;return 0;}\n',
          c: '/* Use C++ or Python for this problem in the judge — C stub */\n#include <stdio.h>\nint main(){printf("0\\n");return 0;}\n',
          sql: '-- N/A\nSELECT 1;\n'
        },
        solution: {
          code: {
            python: `def lengthOfLongestSubstring(s):
    last = {}
    lo = 0
    best = 0
    for hi, ch in enumerate(s):
        if ch in last and last[ch] >= lo:
            lo = last[ch] + 1
        last[ch] = hi
        best = max(best, hi - lo + 1)
    return best`,
            javascript: `function lengthOfLongestSubstring(s) {
  const m = new Map();
  let lo = 0, best = 0;
  for (let hi = 0; hi < s.length; hi++) {
    const ch = s[hi];
    if (m.has(ch) && m.get(ch) >= lo) lo = m.get(ch) + 1;
    m.set(ch, hi);
    best = Math.max(best, hi - lo + 1);
  }
  return best;
}`,
            java: `public static int lengthOfLongestSubstring(String s) {
  Map<Character, Integer> m = new HashMap<>();
  int lo = 0, best = 0;
  for (int hi = 0; hi < s.length(); hi++) {
    char ch = s.charAt(hi);
    if (m.containsKey(ch) && m.get(ch) >= lo) lo = m.get(ch) + 1;
    m.put(ch, hi);
    best = Math.max(best, hi - lo + 1);
  }
  return best;
}`,
            cpp: `int lengthOfLongestSubstring(string s) {
  unordered_map<char,int> last;
  int lo = 0, best = 0;
  for (int hi = 0; hi < (int)s.size(); hi++) {
    char ch = s[hi];
    if (last.count(ch) && last[ch] >= lo) lo = last[ch] + 1;
    last[ch] = hi;
    best = max(best, hi - lo + 1);
  }
  return best;
}`,
            c: '/* See Python or C++ reference for sliding-window solution. */\n'
          },
          explanation: 'Sliding window with last-seen index map.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(min(n, alphabet))'
        }
      },
      {
        title: 'Regular Expression Matching',
        description:
          'Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` and `*`.',
        difficulty: 'Hard',
        isPremium: true,
        topics: ['String', 'Dynamic Programming', 'Recursion'],
        companies: ['Facebook', 'Google', 'Uber'],
        stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
        constraints: ['1 <= s.length <= 20', '1 <= p.length <= 20'],
        examples: [
          {
            input: 's = "aa", p = "a*"',
            output: 'true',
            explanation: '"*" means zero or more of the preceding element.'
          }
        ],
        testCases: [
          { input: 'aa\na*', output: 'true', isHidden: false },
          { input: 'ab\n.*', output: 'true', isHidden: false },
          { input: 'mississippi\nmis*is*p*.', output: 'false', isHidden: true }
        ],
        templates: {
          python:
            'def isMatch(s, p):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    inputs = sys.stdin.read().split("\\n")\n    if len(inputs) >= 2:\n        print("true" if isMatch(inputs[0].strip(), inputs[1].strip()) else "false")',
          javascript:
            'function isMatch(s, p) {\n}\nconst fs = require("fs");\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\nif (input.length >= 2) {\n  console.log(isMatch(input[0], input[1]) ? "true" : "false");\n}',
          java:
            'import java.util.*;\npublic class Main {\n    public static boolean isMatch(String s, String p) { return false; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine(), p = sc.nextLine();\n        System.out.println(isMatch(s, p) ? "true" : "false");\n    }\n}',
          cpp:
            '#include <bits/stdc++.h>\nusing namespace std;\nbool isMatch(string s,string p){return false;}\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);string s,p;getline(cin,s);getline(cin,p);cout<<(isMatch(s,p)?"true":"false")<<endl;return 0;}\n',
          c: '#include <stdio.h>\nint main(){printf("false\\n");return 0;}\n',
          sql: '-- N/A\nSELECT 1;\n'
        },
        solution: {
          code: {
            python: `# DP reference omitted for brevity — full solution in editorial build`,
            javascript: `function isMatch(s, p) {
  const dp = Array(s.length + 1).fill(false).map(() => Array(p.length + 1).fill(false));
  dp[0][0] = true;
  for (let j = 1; j <= p.length; j++) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  }
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= p.length; j++) {
      if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 2];
        if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) {
          dp[i][j] = dp[i][j] || dp[i - 1][j];
        }
      }
    }
  }
  return dp[s.length][p.length];
}`
          },
          explanation: 'Classic 2D dynamic programming for regex.',
          timeComplexity: 'O(|s|·|p|)',
          spaceComplexity: 'O(|s|·|p|)'
        }
      },
      {
        title: 'Merge Intervals',
        description:
          'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals.',
        difficulty: 'Medium',
        isPremium: false,
        topics: ['Array', 'Sorting'],
        companies: ['Google', 'Facebook', 'Microsoft', 'Bloomberg'],
        stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
        constraints: ['1 <= intervals.length <= 10^4'],
        examples: [
          {
            input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
            output: '[[1, 6], [8, 10], [15, 18]]',
            explanation: 'Merge [1,3] and [2,6] into [1,6].'
          }
        ],
        testCases: [
          { input: '4\n1 3\n2 6\n8 10\n15 18', output: '[[1,6],[8,10],[15,18]]', isHidden: false },
          { input: '2\n1 4\n4 5', output: '[[1,5]]', isHidden: false }
        ],
        templates: {
          python:
            'import json\n\ndef merge(intervals):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    intervals = []\n    for _ in range(n):\n        intervals.append(list(map(int, sys.stdin.readline().split())))\n    print(json.dumps(merge(intervals)))',
          javascript: `function merge(intervals) {
  return [];
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const n = parseInt(input[0], 10);
const intervals = [];
for (let i = 1; i <= n; i++) {
  const p = input[i].split(" ").map(Number);
  intervals.push([p[0], p[1]]);
}
console.log(JSON.stringify(merge(intervals)));`,
          java:
            'import java.util.*;\npublic class Main {\n    public static List<int[]> merge(int[][] a) { return new ArrayList<>(); }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[][] a = new int[n][2];\n        for (int i = 0; i < n; i++) { a[i][0] = sc.nextInt(); a[i][1] = sc.nextInt(); }\n        System.out.println(merge(a));\n    }\n}',
          cpp:
            '#include <bits/stdc++.h>\nusing namespace std;\nvector<vector<int>> merge(vector<vector<int>>& a){return {};}\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);return 0;}\n',
          c: '#include <stdio.h>\nint main(){printf("[]\\n");return 0;}\n',
          sql: '-- N/A\nSELECT 1;\n'
        },
        solution: {
          code: {
            python: `import json
import sys

def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    out = []
    for cur in intervals:
        if not out or out[-1][1] < cur[0]:
            out.append(cur)
        else:
            out[-1][1] = max(out[-1][1], cur[1])
    return out

if __name__ == "__main__":
    n = int(sys.stdin.readline())
    intervals = []
    for _ in range(n):
        intervals.append(list(map(int, sys.stdin.readline().split())))
    print(json.dumps(merge(intervals)))`,
            javascript: `function merge(intervals) {
  intervals.sort((a,b) => a[0]-b[0]);
  const out = [];
  for (const cur of intervals) {
    if (!out.length || out[out.length-1][1] < cur[0]) out.push([...cur]);
    else out[out.length-1][1] = Math.max(out[out.length-1][1], cur[1]);
  }
  return out;
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const n = parseInt(input[0], 10);
const intervals = [];
for (let i = 1; i <= n; i++) {
  const p = input[i].split(" ").map(Number);
  intervals.push([p[0], p[1]]);
}
console.log(JSON.stringify(merge(intervals)));`
          },
          explanation: 'Sort by start, then sweep merging overlapping ranges.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(log n) stack space for sort'
        }
      },
      {
        title: 'SQL: High Scores',
        description:
          'Table `students` has columns `id`, `name`, and `score`. Write a query that returns the `name` of every student with `score` **greater than or equal to** 90, one name per line (alphabetical order by name).',
        difficulty: 'Easy',
        isPremium: false,
        topics: ['SQL', 'Database'],
        companies: ['Meta', 'Amazon', 'Databricks'],
        stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
        constraints: ['Setup SQL is provided per test case; your submission is appended after it.'],
        examples: [
          {
            input: 'See hidden test runner',
            output: 'Ada',
            explanation: 'Only Ada has score >= 90.'
          }
        ],
        testCases: [
          {
            input: `CREATE TABLE students (id INTEGER, name TEXT, score INTEGER);
INSERT INTO students VALUES (1, 'Ada', 95);
INSERT INTO students VALUES (2, 'Bob', 72);
INSERT INTO students VALUES (3, 'Carl', 90);`,
            output: 'Ada\nCarl',
            isHidden: false
          },
          {
            input: `CREATE TABLE students (id INTEGER, name TEXT, score INTEGER);
INSERT INTO students VALUES (1, 'Zoe', 100);
INSERT INTO students VALUES (2, 'Amy', 89);`,
            output: 'Zoe',
            isHidden: true
          }
        ],
        templates: {
          python:
            '# Use SQL language selector\nraise SystemExit("Select SQL in the language dropdown")\n',
          javascript: 'throw new Error("Select SQL in the language dropdown");',
          java: 'class Main { public static void main(String[] a){ System.exit(1); } }',
          cpp: 'int main(){return 1;}',
          c: 'int main(){return 1;}',
          sql: 'SELECT name FROM students WHERE score >= 90 ORDER BY name;\n'
        },
        solution: {
          code: {
            sql: 'SELECT name FROM students WHERE score >= 90 ORDER BY name;'
          },
          explanation: 'Filter with WHERE score >= 90 and sort names for deterministic output.',
          timeComplexity: 'O(N log N)',
          spaceComplexity: 'O(N)'
        }
      }
    ];

    fixPalindromeJsTemplate(problemsList[1]);
    fixLongestJavaTemplate(problemsList[2]);

    console.log('Inserting hero problems…');
    const heroInserted = await insertInBatches(problemsList);
    console.log(`Hero count: ${heroInserted.length}`);

    console.log(`Inserting ${BULK_CLONE_COUNT} algorithm clones…`);
    const clones = generateBulkClones(BULK_CLONE_COUNT);
    const cloneInserted = await insertInBatches(clones);
    console.log(`Clone count: ${cloneInserted.length}`);

    console.log(`Inserting ${SQL_COUNT} SQL drills…`);
    const sqlDocs = generateSqlBank(SQL_COUNT);
    const sqlInserted = await insertInBatches(sqlDocs);
    console.log(`SQL count: ${sqlInserted.length}`);

    const allInserted = [...heroInserted, ...cloneInserted, ...sqlInserted];

    const isSqlProblem = (p) =>
      (p.topics || []).includes('SQL') || (p.title && p.title.startsWith('SQL:'));

    const algorithmPool = allInserted.filter((p) => !isSqlProblem(p));

    const top150 = algorithmPool.slice(0, 150).map((p) => p._id);
    const lc75 = algorithmPool.slice(150, 225).map((p) => p._id);
    const sql50 = sqlInserted.map((p) => p._id);

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 1);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 7);

    const challengeProblems = algorithmPool.slice(0, 4).map((p) => p._id);

    await WeeklyChallenge.create({
      title: 'Weekly Master Challenge #1',
      description:
        'Solve all contest problems. +1 per solve, −1 score per wrong attempt before you solve that problem.',
      slug: 'weekly-master-1',
      kind: 'weekly',
      startDate,
      endDate,
      problems: challengeProblems,
      penaltyPerWrong: 1
    });

    const futureStart = new Date(now);
    futureStart.setDate(now.getDate() + 10);
    const futureEnd = new Date(futureStart);
    futureEnd.setDate(futureStart.getDate() + 4);

    await WeeklyChallenge.create({
      title: 'Grand Sprint Contest',
      description: 'Four-day window. Same scoring: solved count minus penalties.',
      slug: 'grand-sprint',
      kind: 'contest',
      startDate: futureStart,
      endDate: futureEnd,
      problems: algorithmPool.slice(0, 3).map((p) => p._id),
      penaltyPerWrong: 1
    });

    await StudyPlan.insertMany([
      {
        slug: 'top-interview-150',
        title: 'Top Interview 150',
        description: 'Exactly 150 algorithm problems from the CodeJudge catalog.',
        problems: top150
      },
      {
        slug: 'leetcode-75',
        title: 'LeetCode 75',
        description: 'Seventy-five problems — the next band after the top 150 list.',
        problems: lc75
      },
      {
        slug: 'sql-50',
        title: 'SQL 50',
        description: 'Fifty SQLite-friendly aggregates and filters.',
        problems: sql50
      }
    ]);

    await DiscussPost.insertMany([
      {
        title: 'How do you approach interval problems?',
        body: 'I sort by start time and merge in one pass. Works for Meeting Rooms style questions too.',
        authorLabel: 'grapher',
        tags: ['Greedy', 'Sorting'],
        votes: 42,
        replyCount: 7,
        pinned: true
      },
      {
        title: 'Dynamic programming vs memoized DFS — when to pick which?',
        body: 'If states form a DAG and you need all subproblems, bottom-up DP saves stack space. Memoized DFS is faster to sketch in contests.',
        authorLabel: 'byteSurfer',
        tags: ['Dynamic Programming', 'Interview'],
        votes: 28,
        replyCount: 11
      },
      {
        title: 'SQLite edge cases in CodeJudge',
        body: 'The SQL 50 bank rotates SUM, COUNT(*), MAX(qty), and MIN(qty) over the same `inv` table. Outputs are compared line-by-line after trimming; use ORDER BY only when the problem asks for sorted rows.',
        authorLabel: 'dbaJay',
        tags: ['SQL', 'Help'],
        votes: 15,
        replyCount: 4
      }
    ]);

    console.log(
      `Study plans: Top 150 (${top150.length}), LC 75 (${lc75.length}), SQL 50 (${sql50.length}). Total problems: ${allInserted.length}.`
    );
  } catch (error) {
    console.error(`Error seeding problems: ${error.message}`);
  }
};

function fixPalindromeJsTemplate(p) {
  p.templates.javascript = `function isPalindrome(x) {
}

const fs = require("fs");
const x = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim());
console.log(isPalindrome(x) ? "true" : "false");`;
}

function fixLongestJavaTemplate(p) {
  p.templates.java = `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(lengthOfLongestSubstring(s));
    }
}`;
}

module.exports = seedProblems;
