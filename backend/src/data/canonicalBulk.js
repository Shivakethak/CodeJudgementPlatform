/**
 * Canonical problem definitions with full stdin/stdout + templates + solutions
 * for Python, Java, JavaScript, C++, and C. Used to clone hundreds of judge-safe variants.
 */

const { buildTwoSumCases, buildFibCases, buildSqlInvCasesVariant } = require('./testCaseGenerators');
const EXTRA_CANONICALS = require('./canonicalExtras');

const TWO_SUM = {
  title: 'Two Sum',
  description:
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nEach input has exactly one solution; you may not use the same element twice.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Array', 'Hash Table'],
  companies: ['Amazon', 'Google'],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9'
  ],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0, 1]',
      explanation: 'nums[0] + nums[1] == 9'
    }
  ],
  testCases: buildTwoSumCases(28),
  templates: {
    python:
      'def twoSum(nums, target):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    nums = list(map(int, sys.stdin.readline().split()))\n    target = int(sys.stdin.readline())\n    r = twoSum(nums, target)\n    print(r)',
    javascript: `function twoSum(nums, target) {
    return [];
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const n = parseInt(input[0], 10);
const nums = input[1].split(" ").map(Number);
const target = parseInt(input[2], 10);
const r = twoSum(nums, target);
console.log("[" + r.join(", ") + "]");`,
    java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        return new int[] {};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        int[] r = twoSum(nums, target);
        System.out.println("[" + r[0] + ", " + r[1] + "]");
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    return {};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    vector<int> r = twoSum(nums, target);
    cout << "[" << r[0] << ", " << r[1] << "]" << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int n, int target, int* outLen) {
    *outLen = 2;
    int* r = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                r[0] = i; r[1] = j; return r;
            }
        }
    }
    *outLen = 0;
    return NULL;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    int target;
    scanf("%d", &target);
    int len;
    int* r = twoSum(nums, n, target, &len);
    if (r && len == 2) printf("[%d, %d]\\n", r[0], r[1]);
    free(nums);
    free(r);
    return 0;
}`
  },
  solution: {
    explanation: 'Hash map from value to index; for each element check complement.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: {
      python: `def twoSum(nums, target):
    m = {}
    for i, x in enumerate(nums):
        if target - x in m:
            return [m[target - x], i]
        m[x] = i
    return []

import sys
if __name__ == "__main__":
    n = int(sys.stdin.readline())
    nums = list(map(int, sys.stdin.readline().split()))
    target = int(sys.stdin.readline())
    r = twoSum(nums, target)
    print(r)`,
      javascript: `function twoSum(nums, target) {
    const m = new Map();
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (m.has(need)) return [m.get(need), i];
        m.set(nums[i], i);
    }
    return [];
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const n = parseInt(input[0], 10);
const nums = input[1].split(" ").map(Number);
const target = parseInt(input[2], 10);
const r = twoSum(nums, target);
console.log("[" + r.join(", ") + "]");`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> m = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (m.containsKey(need)) return new int[] { m.get(need), i };
            m.put(nums[i], i);
        }
        return new int[] {};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        int[] r = twoSum(nums, target);
        System.out.println("[" + r[0] + ", " + r[1] + "]");
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> m;
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (m.count(need)) return {m[need], i};
        m[nums[i]] = i;
    }
    return {};
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    vector<int> r = twoSum(nums, target);
    cout << "[" << r[0] << ", " << r[1] << "]" << endl;
    return 0;
}`,
      c: `/* two-sum reference */
#include <stdio.h>
#include <stdlib.h>

typedef struct { int k, v; } Pair;
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* nums = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    int target;
    scanf("%d", &target);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("[%d, %d]\\n", i, j);
                free(nums);
                return 0;
            }
        }
    }
    free(nums);
    return 0;
}`
    }
  }
};

const FIB = {
  title: 'Fibonacci Number',
  description:
    'The Fibonacci numbers F(n): F(0)=0, F(1)=1, and for n>=2, F(n)=F(n-1)+F(n-2). Given `n`, return F(n).',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Math', 'Dynamic Programming'],
  companies: ['Microsoft', 'Apple'],
  constraints: ['0 <= n <= 30'],
  examples: [
    { input: '2', output: '1', explanation: 'F(2)=1' },
    { input: '3', output: '2', explanation: 'F(3)=2' }
  ],
  testCases: buildFibCases(),
  templates: {
    python:
      'def fib(n: int) -> int:\n    pass\n\nimport sys\nif __name__ == "__main__":\n    print(fib(int(sys.stdin.read().strip())))',
    javascript: `function fib(n) {
    return 0;
}
const fs = require("fs");
const n = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim(), 10);
console.log(fib(n));`,
    java: `import java.util.*;

public class Main {
    public static int fib(int n) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(fib(sc.nextInt()));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int fib(int n) { return 0; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int fib(int n) { return 0; }

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    printf("%d\\n", fib(n));
    return 0;
}`
  },
  solution: {
    explanation: 'Iterative DP with O(1) space.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: {
      python: `def fib(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

import sys
if __name__ == "__main__":
    print(fib(int(sys.stdin.read().strip())))`,
      javascript: `function fib(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        const t = a + b;
        a = b;
        b = t;
    }
    return b;
}
const fs = require("fs");
const n = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim(), 10);
console.log(fib(n));`,
      java: `import java.util.*;

public class Main {
    public static int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int t = a + b;
            a = b;
            b = t;
        }
        return b;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(fib(sc.nextInt()));
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

long long fib(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long t = a + b;
        a = b;
        b = t;
    }
    return b;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`,
      c: `#include <stdio.h>

static long long fib(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long t = a + b;
        a = b;
        b = t;
    }
    return b;
}
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    printf("%lld\\n", fib(n));
    return 0;
}`
    }
  }
};

const CANONICALS = [TWO_SUM, FIB, ...EXTRA_CANONICALS];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const EXTRA_TOPICS = ['Array', 'String', 'Dynamic Programming', 'Tree', 'Graph', 'Math', 'Binary Search', 'Greedy'];
const COMPANIES = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Bloomberg', 'Adobe', 'Uber'];
const CATALOG_TIERS = ['Warm', 'Core', 'Sprint', 'Master', 'Drill'];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function stripCatalogSuffix(title) {
  return String(title)
    .replace(/\s*—\s*(Warm|Core|Sprint|Master|Drill)\s+\d+\s*$/i, '')
    .replace(/\s*\(Variant\s*\d+\)\s*$/i, '')
    .replace(/\s*\(Practice.*\)\s*$/i, '')
    .trim();
}

function buildClone(index) {
  const base = CANONICALS[index % CANONICALS.length];
  const p = deepClone(base);
  const rootTitle = stripCatalogSuffix(base.title);
  const cycle = Math.floor(index / CANONICALS.length) + 1;
  const tier = CATALOG_TIERS[index % CATALOG_TIERS.length];
  p.title = `${rootTitle} — ${tier} ${cycle}`;
  p.description = `${base.description}\n\n_Catalog problem — same I/O contract as "${rootTitle}"; difficulty/tier label is for browsing only._`;
  p.stats = { totalSubmissions: 0, acceptedSubmissions: 0 };
  p.difficulty = DIFFICULTIES[index % DIFFICULTIES.length];
  p.topics = [...new Set([...(base.topics || []), EXTRA_TOPICS[index % EXTRA_TOPICS.length]])];
  p.companies = [COMPANIES[index % COMPANIES.length], COMPANIES[(index + 3) % COMPANIES.length]];
  p.isPremium = index % 18 === 0;
  return p;
}

const SQL_VARIANTS = [
  {
    titlePrefix: 'SQL: Inventory total',
    blurb:
      'Table `inv(id INTEGER, qty INTEGER)`. **Return one line:** the integer **sum** of all `qty` values (digits only, no column labels).',
    sql: 'SELECT SUM(qty) FROM inv;',
    explain: 'Aggregate SUM over all rows.'
  },
  {
    titlePrefix: 'SQL: Row count',
    blurb:
      'Table `inv(id INTEGER, qty INTEGER)`. **Return one line:** the **number of rows** in `inv` (single integer).',
    sql: 'SELECT COUNT(*) FROM inv;',
    explain: 'COUNT(*) counts every row.'
  },
  {
    titlePrefix: 'SQL: Largest quantity',
    blurb:
      'Table `inv(id INTEGER, qty INTEGER)`. **Return one line:** the **maximum** `qty` value.',
    sql: 'SELECT MAX(qty) FROM inv;',
    explain: 'MAX aggregate over qty.'
  },
  {
    titlePrefix: 'SQL: Smallest quantity',
    blurb:
      'Table `inv(id INTEGER, qty INTEGER)`. **Return one line:** the **minimum** `qty` value.',
    sql: 'SELECT MIN(qty) FROM inv;',
    explain: 'MIN aggregate over qty.'
  }
];

function buildSqlProblem(i) {
  const variant = SQL_VARIANTS[i % SQL_VARIANTS.length];
  const band = Math.floor(i / SQL_VARIANTS.length) + 1;
  return {
    title: `${variant.titlePrefix} · band ${band}`,
    description: variant.blurb,
    difficulty: 'Easy',
    isPremium: false,
    topics: ['SQL', 'Database'],
    companies: [COMPANIES[i % COMPANIES.length]],
    constraints: ['Your query is appended after the setup SQL for each test.'],
    examples: [
      {
        input: 'CREATE TABLE + inserts',
        output: 'see first test',
        explanation: variant.explain
      }
    ],
    stats: { totalSubmissions: 0, acceptedSubmissions: 0 },
    testCases: buildSqlInvCasesVariant(i, i % SQL_VARIANTS.length, 24),
    templates: {
      sql: `${variant.sql}\n`
    },
    solution: {
      code: {
        sql: variant.sql
      },
      explanation: variant.explain,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    }
  };
}

function generateBulkClones(count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(buildClone(i));
  return out;
}

function generateSqlBank(count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(buildSqlProblem(i));
  return out;
}

module.exports = {
  generateBulkClones,
  generateSqlBank,
  CANONICALS
};
