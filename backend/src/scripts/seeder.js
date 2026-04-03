const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// Base 5 valid problems with all templates and solutions
const baseProblems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Apple'],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] == 9, we return 0 1.' },
      { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] == 6, we return 1 2.' }
    ],
    testCases: [
      { input: '4\n2 7 11 15\n9', output: '0 1', isHidden: false },
      { input: '3\n3 2 4\n6', output: '1 2', isHidden: false },
      { input: '2\n3 3\n6', output: '0 1', isHidden: true },
    ],
    templates: {
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    n = int(input())\n    nums = list(map(int, input().split()))\n    target = int(input())\n    res = twoSum(nums, target)\n    print(" ".join(map(str, res)))',
      java: 'import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int[] res = twoSum(nums, target);\n        System.out.println(res[0] + " " + res[1]);\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    vector<int> res = twoSum(nums, target);\n    cout << res[0] << " " << res[1] << endl;\n    return 0;\n}',
      c: '#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int* nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf("%d", &nums[i]);\n    int target;\n    scanf("%d", &target);\n    int returnSize;\n    int* res = twoSum(nums, n, target, &returnSize);\n    if (res) printf("%d %d\\n", res[0], res[1]);\n    free(nums); if(res) free(res);\n    return 0;\n}',
      javascript: 'const fs = require("fs");\n\nfunction twoSum(nums, target) {\n    // Write your code here\n    return [];\n}\n\nfunction main() {\n    const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split(/\\s+/);\n    if (input.length < 2) return;\n    let n = parseInt(input[0]);\n    let nums = [];\n    for(let i=1; i<=n; i++) nums.push(parseInt(input[i]));\n    let target = parseInt(input[n+1]);\n    let res = twoSum(nums, target);\n    console.log(res.join(" "));\n}\nmain();'
    },
    solution: {
      explanation: 'Use a hash map to store the values and their indices. For each element, check if target - element exists in the map.',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      code: {
        python: 'def twoSum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in num_map:\n            return [num_map[diff], i]\n        num_map[num] = i\n    return []\n\nif __name__ == "__main__":\n    n = int(input())\n    nums = list(map(int, input().split()))\n    target = int(input())\n    res = twoSum(nums, target)\n    print(" ".join(map(str, res)))',
        java: 'import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int[] res = twoSum(nums, target);\n        System.out.println(res[0] + " " + res[1]);\n    }\n}',
        cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> numMap;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (numMap.count(diff)) {\n            return {numMap[diff], i};\n        }\n        numMap[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    vector<int> res = twoSum(nums, target);\n    if (res.size() == 2) cout << res[0] << " " << res[1] << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    int key;\n    int val;\n} HashItem;\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    int* res = (int*)malloc(2 * sizeof(int));\n    *returnSize = 2;\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                res[0] = i;\n                res[1] = j;\n                return res;\n            }\n        }\n    }\n    *returnSize = 0;\n    return NULL;\n}\n\nint main() {\n    int n;\n    if(scanf("%d", &n) != 1) return 0;\n    int* nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf("%d", &nums[i]);\n    int target;\n    scanf("%d", &target);\n    int returnSize;\n    int* res = twoSum(nums, n, target, &returnSize);\n    if (res && returnSize == 2) printf("%d %d\\n", res[0], res[1]);\n    free(nums); if(res) free(res);\n    return 0;\n}',
        javascript: 'const fs = require("fs");\n\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nfunction main() {\n    const input = fs.readFileSync("/dev/stdin", "utf-8").trim().split(/\\s+/);\n    if (input.length < 2) return;\n    let n = parseInt(input[0]);\n    let nums = [];\n    let i = 1;\n    for(; i<=n; i++) nums.push(parseInt(input[i]));\n    let target = parseInt(input[i]);\n    let res = twoSum(nums, target);\n    console.log(res.join(" "));\n}\nmain();'
      }
    }
  },
  {
    title: 'Fibonacci Number',
    description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.',
    difficulty: 'Easy',
    topics: ['Math', 'Dynamic Programming'],
    companies: ['Microsoft', 'Apple'],
    constraints: ['0 <= n <= 30'],
    examples: [
      { input: '2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
      { input: '3', output: '2', explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.' },
    ],
    testCases: [
      { input: '2', output: '1', isHidden: false },
      { input: '3', output: '2', isHidden: false },
      { input: '4', output: '3', isHidden: true },
      { input: '30', output: '832040', isHidden: true },
    ],
    templates: {
      python: 'def fib(n: int) -> int:\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    n = int(input())\n    print(fib(n))',
      java: 'import java.util.*;\n\npublic class Main {\n    public static int fib(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(fib(n));\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint fib(int n) {\n    // Write your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << fib(n) << endl;\n    return 0;\n}',
      c: '#include <stdio.h>\n\nint fib(int n) {\n    // Write your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", fib(n));\n    return 0;\n}',
      javascript: 'const fs = require("fs");\n\nfunction fib(n) {\n    // Write your code here\n    return 0;\n}\n\nfunction main() {\n    const input = fs.readFileSync("/dev/stdin", "utf-8").trim();\n    if (!input) return;\n    console.log(fib(parseInt(input)));\n}\nmain();'
    },
    solution: {
      explanation: 'Use dynamic programming or iteration to efficiently compute F(n) without storing the entire sequence.',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      code: {
        python: 'def fib(n: int) -> int:\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == "__main__":\n    n = int(input())\n    print(fib(n))',
        java: 'import java.util.*;\n\npublic class Main {\n    public static int fib(int n) {\n        if (n <= 1) return n;\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        System.out.println(fib(n));\n    }\n}',
        cpp: '#include <iostream>\nusing namespace std;\n\nint fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}\n\nint main() {\n    int n;\n    if(cin >> n) cout << fib(n) << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}\n\nint main() {\n    int n;\n    if(scanf("%d", &n) == 1) printf("%d\\n", fib(n));\n    return 0;\n}',
        javascript: 'const fs = require("fs");\n\nfunction fib(n) {\n    if (n <= 1) return n;\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) {\n        let temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}\n\nfunction main() {\n    const input = fs.readFileSync("/dev/stdin", "utf-8").trim();\n    if (!input) return;\n    console.log(fib(parseInt(input)));\n}\nmain();'
      }
    }
  }
];

// Add similar base problems dynamically to reach 500
const difficulties = ['Easy', 'Medium', 'Hard'];
const categories = ['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Graph', 'Tree'];

const generateProblems = () => {
    let output = [...baseProblems];
    
    for (let i = 3; i <= 505; i++) {
        let base = baseProblems[i % 2];
        let diff = difficulties[i % 3];
        let topic = categories[i % categories.length];
        
        output.push({
            ...base,
            title: `${topic} Master Variant #${i}`,
            description: `This is a generated variant of ${base.title} adjusted for pattern analysis.\n\n${base.description}`,
            difficulty: diff,
            topics: [topic],
            isPremium: i % 10 === 0 // every 10th problem is premium
        });
    }
    return output;
};


async function seedDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codejudge';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    await Problem.deleteMany({});
    await Submission.deleteMany({});
    console.log('Cleared existing problems and submissions.');

    const problems = generateProblems();
    await Problem.insertMany(problems);
    console.log(`Inserted ${problems.length} problems!`);

    mongoose.connection.close();
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDB();
