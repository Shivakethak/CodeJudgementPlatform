/**
 * Extra canonical problems (arrays, strings, stack, math, DP, bit tricks).
 * stdin/stdout format matches execution-worker expectations.
 */

const {
  buildMaxArrayCases,
  buildSumArrayCases,
  buildReverseStringCases,
  buildValidParenthesesCases,
  buildClimbingStairsCases,
  buildIntSqrtCases,
  buildSingleNumberCases
} = require('./testCaseGenerators');

const MAX_ELEMENT = {
  title: 'Maximum Element in Array',
  description:
    'Given an integer array, print the **maximum** value (single integer on one line).\n\n**Input:** first line `n`, second line `n` space-separated integers.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Array'],
  companies: ['Amazon', 'Google'],
  constraints: ['1 <= n <= 500', 'Each value fits in 32-bit signed int'],
  examples: [{ input: '3\n1 5 3', output: '5', explanation: 'Maximum is 5.' }],
  testCases: buildMaxArrayCases(28),
  templates: {
    python:
      'def maxElement(nums):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    nums = list(map(int, sys.stdin.readline().split()))\n    print(maxElement(nums))',
    javascript: `function maxElement(nums) {
    return 0;
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const n = parseInt(input[0], 10);
const nums = input[1].split(" ").map(Number);
console.log(maxElement(nums));`,
    java: `import java.util.*;

public class Main {
    public static int maxElement(int[] nums) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(maxElement(nums));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int maxElement(vector<int>& nums) { return 0; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << maxElement(nums) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
int maxElement(int* nums, int n) { return 0; }
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[512];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", maxElement(nums, n));
    return 0;
}`
  },
  solution: {
    explanation: 'Linear scan tracking the running maximum.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: {
      python: `def maxElement(nums):
    return max(nums)

import sys
if __name__ == "__main__":
    n = int(sys.stdin.readline())
    nums = list(map(int, sys.stdin.readline().split()))
    print(maxElement(nums))`,
      javascript: `function maxElement(nums) {
    return Math.max(...nums);
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const nums = input[1].split(" ").map(Number);
console.log(maxElement(nums));`,
      java: `public static int maxElement(int[] nums) {
    int m = nums[0];
    for (int x : nums) m = Math.max(m, x);
    return m;
}`,
      cpp: `int maxElement(vector<int>& nums) {
    return *max_element(nums.begin(), nums.end());
}`,
      c: `int maxElement(int* nums, int n) {
    int m = nums[0];
    for (int i = 1; i < n; i++) if (nums[i] > m) m = nums[i];
    return m;
}`
    }
  }
};

const SUM_ARRAY = {
  title: 'Sum of Array',
  description:
    'Given `n` integers, print their **sum** (one line).\n\n**Input:** first line `n`, second line `n` space-separated integers.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Array', 'Prefix Sum'],
  companies: ['Meta', 'Apple'],
  constraints: ['1 <= n <= 200', 'Values in [-50, 50] for generated tests'],
  examples: [{ input: '3\n1 2 3', output: '6', explanation: '1+2+3=6' }],
  testCases: buildSumArrayCases(28),
  templates: {
    python:
      'def arraySum(nums):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    nums = list(map(int, sys.stdin.readline().split()))\n    print(arraySum(nums))',
    javascript: `function arraySum(nums) {
    return 0;
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const nums = input[1].split(" ").map(Number);
console.log(arraySum(nums));`,
    java: `import java.util.*;

public class Main {
    public static int arraySum(int[] nums) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(arraySum(nums));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int arraySum(vector<int>& nums) { return 0; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << arraySum(nums) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
int arraySum(int* nums, int n) { return 0; }
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[512];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", arraySum(nums, n));
    return 0;
}`
  },
  solution: {
    explanation: 'Accumulate with a running total.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: {
      python: `def arraySum(nums):
    return sum(nums)

import sys
if __name__ == "__main__":
    n = int(sys.stdin.readline())
    nums = list(map(int, sys.stdin.readline().split()))
    print(arraySum(nums))`,
      javascript: `function arraySum(nums) {
    return nums.reduce((a, b) => a + b, 0);
}`,
      java: `public static int arraySum(int[] nums) {
    int s = 0;
    for (int x : nums) s += x;
    return s;
}`,
      cpp: `int arraySum(vector<int>& nums) {
    return accumulate(nums.begin(), nums.end(), 0);
}`,
      c: `int arraySum(int* nums, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += nums[i];
    return s;
}`
    }
  }
};

const REVERSE_STRING = {
  title: 'Reverse String',
  description:
    'Read one line from stdin (may contain spaces). Print the **reversed** string on one line.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['String', 'Two Pointers'],
  companies: ['Microsoft', 'Adobe'],
  constraints: ['length <= 4000 chars for tests'],
  examples: [{ input: 'hello', output: 'olleh', explanation: 'Reverse characters.' }],
  testCases: buildReverseStringCases(28),
  templates: {
    python:
      'def reverseString(s):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    s = sys.stdin.read().rstrip("\\n")\n    print(reverseString(s))',
    javascript: `function reverseString(s) {
    return "";
}
const fs = require("fs");
const s = fs.readFileSync("/dev/stdin", "utf-8").replace(/\\r?\\n$/, "");
console.log(reverseString(s));`,
    java: `import java.util.*;

public class Main {
    public static String reverseString(String s) { return ""; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(reverseString(s));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

string reverseString(string s) { return ""; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    getline(cin, s);
    cout << reverseString(s) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <string.h>
void reverse(char* s) { /* implement */ }
int main() {
    char buf[4096];
    if (!fgets(buf, sizeof(buf), stdin)) return 0;
    size_t n = strlen(buf);
    if (n && buf[n-1] == '\\n') buf[--n] = 0;
    reverse(buf);
    printf("%s\\n", buf);
    return 0;
}`
  },
  solution: {
    explanation: 'Two pointers from both ends or build a new string.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: {
      python: `def reverseString(s):
    return s[::-1]

import sys
if __name__ == "__main__":
    s = sys.stdin.read().rstrip("\\n")
    print(reverseString(s))`,
      javascript: `function reverseString(s) {
    return s.split("").reverse().join("");
}`,
      java: `public static String reverseString(String s) {
    return new StringBuilder(s).reverse().toString();
}`,
      cpp: `string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}`,
      c: `void reverse(char* s) {
    int i = 0, j = (int)strlen(s) - 1;
    while (i < j) { char t = s[i]; s[i] = s[j]; s[j] = t; i++; j--; }
}`
    }
  }
};

const VALID_PARENTHESES = {
  title: 'Valid Parentheses',
  description:
    'Given a string containing only `(` `)` `[` `]` `{` `}`, print `true` if it is valid, else `false`.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['String', 'Stack'],
  companies: ['Amazon', 'Bloomberg'],
  constraints: ['0 <= length <= 5000'],
  examples: [{ input: '()[]{}', output: 'true', explanation: 'Properly nested.' }],
  testCases: buildValidParenthesesCases(28),
  templates: {
    python:
      'def isValid(s):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print("true" if isValid(s) else "false")',
    javascript: `function isValid(s) {
    return false;
}
const fs = require("fs");
const s = fs.readFileSync("/dev/stdin", "utf-8").trim();
console.log(isValid(s) ? "true" : "false");`,
    java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) { return false; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isValid(s) ? "true" : "false");
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) { return false; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    getline(cin, s);
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>
bool isValid(char* s) { return false; }
int main() {
    char buf[4096];
    if (!fgets(buf, sizeof(buf), stdin)) return 0;
    size_t n = strlen(buf);
    if (n && buf[n-1] == '\\n') buf[--n] = 0;
    printf("%s\\n", isValid(buf) ? "true" : "false");
    return 0;
}`
  },
  solution: {
    explanation: 'Use a stack for opening brackets; pop on matching close.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: {
      python: `def isValid(s):
    st = []
    m = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            st.append(ch)
        else:
            if not st or st.pop() != m[ch]:
                return False
    return len(st) == 0

import sys
if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print("true" if isValid(s) else "false")`,
      javascript: `function isValid(s) {
    const st = [];
    const m = { ')': '(', ']': '[', '}': '{' };
    for (const ch of s) {
        if ('([{'.includes(ch)) st.push(ch);
        else {
            if (!st.length || st.pop() !== m[ch]) return false;
        }
    }
    return st.length === 0;
}`,
      java: `public static boolean isValid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    Map<Character, Character> m = Map.of(')', '(', ']', '[', '}', '{');
    for (char ch : s.toCharArray()) {
        if ("([{".indexOf(ch) >= 0) st.push(ch);
        else {
            if (st.isEmpty() || st.pop() != m.get(ch)) return false;
        }
    }
    return st.isEmpty();
}`,
      cpp: `bool isValid(string s) {
    vector<char> st;
    unordered_map<char,char> m{{')','('},{']','['},{'}','{'}};
    for (char ch : s) {
        if (ch=='('||ch=='['||ch=='{') st.push_back(ch);
        else {
            if (st.empty() || st.back()!=m[ch]) return false;
            st.pop_back();
        }
    }
    return st.empty();
}`,
      c: `bool isValid(char* s) {
    char st[256]; int top = 0;
    for (char* p = s; *p; p++) {
        char ch = *p;
        if (ch=='('||ch=='['||ch=='{') st[top++] = ch;
        else {
            char o = (ch==')')?'(':(ch==']')?'[':'{';
            if (top==0 || st[--top]!=o) return false;
        }
    }
    return top==0;
}`
    }
  }
};

const CLIMBING_STAIRS = {
  title: 'Climbing Stairs',
  description:
    'You can climb `1` or `2` steps at a time. Given `n` stairs, print the number of **distinct ways** to reach the top.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Dynamic Programming', 'Math'],
  companies: ['Amazon', 'Google'],
  constraints: ['1 <= n <= 25'],
  examples: [
    { input: '2', output: '2', explanation: '1+1 or 2' },
    { input: '3', output: '3', explanation: 'Three ways.' }
  ],
  testCases: buildClimbingStairsCases(28),
  templates: {
    python:
      'def climbStairs(n):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    print(climbStairs(int(sys.stdin.read().strip())))',
    javascript: `function climbStairs(n) {
    return 0;
}
const fs = require("fs");
const n = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim(), 10);
console.log(climbStairs(n));`,
    java: `import java.util.*;

public class Main {
    public static int climbStairs(int n) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(climbStairs(sc.nextInt()));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int climbStairs(int n) { return 0; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    cout << climbStairs(n) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
int climbStairs(int n) { return 0; }
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    printf("%d\\n", climbStairs(n));
    return 0;
}`
  },
  solution: {
    explanation: 'Fibonacci recurrence: ways(n)=ways(n-1)+ways(n-2).',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: {
      python: `def climbStairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

import sys
if __name__ == "__main__":
    print(climbStairs(int(sys.stdin.read().strip())))`,
      javascript: `function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        const t = a + b;
        a = b;
        b = t;
    }
    return b;
}`,
      java: `public static int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int t = a + b;
        a = b;
        b = t;
    }
    return b;
}`,
      cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long t = a + b;
        a = b;
        b = t;
    }
    return (int)b;
}`,
      c: `int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int t = a + b;
        a = b;
        b = t;
    }
    return b;
}`
    }
  }
};

const INT_SQRT = {
  title: 'Integer Square Root',
  description:
    'Given a non-negative integer `x`, print **floor(sqrt(x))** (integer on one line).',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Math', 'Binary Search'],
  companies: ['Apple', 'Facebook'],
  constraints: ['0 <= x <= 10^7 in tests'],
  examples: [{ input: '8', output: '2', explanation: 'sqrt(8)≈2.828, floor is 2.' }],
  testCases: buildIntSqrtCases(28),
  templates: {
    python:
      'def mySqrt(x):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    print(mySqrt(int(sys.stdin.read().strip())))',
    javascript: `function mySqrt(x) {
    return 0;
}
const fs = require("fs");
const x = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim(), 10);
console.log(mySqrt(x));`,
    java: `import java.util.*;

public class Main {
    public static int mySqrt(int x) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(mySqrt(sc.nextInt()));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int mySqrt(int x) { return 0; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int x;
    cin >> x;
    cout << mySqrt(x) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
int mySqrt(int x) { return 0; }
int main() {
    int x;
    if (scanf("%d", &x) != 1) return 0;
    printf("%d\\n", mySqrt(x));
    return 0;
}`
  },
  solution: {
    explanation: 'Binary search on answer, or Newton iteration.',
    timeComplexity: 'O(log x)',
    spaceComplexity: 'O(1)',
    code: {
      python: `def mySqrt(x):
    lo, hi = 0, x
    while lo <= hi:
        m = (lo + hi) // 2
        if m * m <= x:
            lo = m + 1
        else:
            hi = m - 1
    return hi

import sys
if __name__ == "__main__":
    print(mySqrt(int(sys.stdin.read().strip())))`,
      javascript: `function mySqrt(x) {
    let lo = 0, hi = x;
    while (lo <= hi) {
        const m = (lo + hi) >> 1;
        if (m * m <= x) lo = m + 1;
        else hi = m - 1;
    }
    return hi;
}`,
      java: `public static int mySqrt(int x) {
    int lo = 0, hi = x;
    while (lo <= hi) {
        int m = lo + (hi - lo) / 2;
        if ((long)m * m <= x) lo = m + 1;
        else hi = m - 1;
    }
    return hi;
}`,
      cpp: `int mySqrt(int x) {
    long lo = 0, hi = x;
    while (lo <= hi) {
        long m = (lo + hi) / 2;
        if (m * m <= x) lo = m + 1;
        else hi = m - 1;
    }
    return (int)hi;
}`,
      c: `int mySqrt(int x) {
    long lo = 0, hi = x;
    while (lo <= hi) {
        long m = (lo + hi) / 2;
        if (m * m <= x) lo = m + 1;
        else hi = m - 1;
    }
    return (int)hi;
}`
    }
  }
};

const SINGLE_NUMBER = {
  title: 'Single Number',
  description:
    'Given an array where every element appears **twice** except one, print that **unique** element.\n\n**Input:** first line `n` (odd), second line `n` space-separated integers.',
  difficulty: 'Easy',
  isPremium: false,
  topics: ['Array', 'Bit Manipulation'],
  companies: ['Google', 'Uber'],
  constraints: ['n is odd', 'Exactly one element appears once'],
  examples: [{ input: '3\n2 2 1', output: '1', explanation: '1 appears once.' }],
  testCases: buildSingleNumberCases(28),
  templates: {
    python:
      'def singleNumber(nums):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    nums = list(map(int, sys.stdin.readline().split()))\n    print(singleNumber(nums))',
    javascript: `function singleNumber(nums) {
    return 0;
}
const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");
const nums = input[1].split(" ").map(Number);
console.log(singleNumber(nums));`,
    java: `import java.util.*;

public class Main {
    public static int singleNumber(int[] nums) { return 0; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(singleNumber(nums));
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int singleNumber(vector<int>& nums) { return 0; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << singleNumber(nums) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
int singleNumber(int* nums, int n) { return 0; }
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[512];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", singleNumber(nums, n));
    return 0;
}`
  },
  solution: {
    explanation: 'XOR all numbers; pairs cancel to 0.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: {
      python: `def singleNumber(nums):
    x = 0
    for v in nums:
        x ^= v
    return x

import sys
if __name__ == "__main__":
    n = int(sys.stdin.readline())
    nums = list(map(int, sys.stdin.readline().split()))
    print(singleNumber(nums))`,
      javascript: `function singleNumber(nums) {
    return nums.reduce((a, b) => a ^ b, 0);
}`,
      java: `public static int singleNumber(int[] nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}`,
      cpp: `int singleNumber(vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}`,
      c: `int singleNumber(int* nums, int n) {
    int x = 0;
    for (int i = 0; i < n; i++) x ^= nums[i];
    return x;
}`
    }
  }
};

module.exports = [
  MAX_ELEMENT,
  SUM_ARRAY,
  REVERSE_STRING,
  VALID_PARENTHESES,
  CLIMBING_STAIRS,
  INT_SQRT,
  SINGLE_NUMBER
];
