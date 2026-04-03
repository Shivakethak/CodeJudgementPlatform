const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const seedProblems = async () => {
  try {
    // We intentionally wipe existing problems to populate our comprehensive list
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    const problemsList = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        difficulty: 'Easy',
        isPremium: false,
        topics: ['Array', 'Hash Table'],
        companies: ['Amazon', 'Google', 'Apple', 'Adobe'],
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          '-10^9 <= target <= 10^9',
          'Only one valid answer exists.'
        ],
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ],
        testCases: [
          { input: '4\n2 7 11 15\n9', output: '[0, 1]', isHidden: false },
          { input: '3\n3 2 4\n6', output: '[1, 2]', isHidden: false },
          { input: '2\n3 3\n6', output: '[0, 1]', isHidden: true }
        ],
        templates: {
          python: 'def twoSum(nums, target):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    nums = list(map(int, sys.stdin.readline().split()))\n    target = int(sys.stdin.readline())\n    print(twoSum(nums, target))',
          javascript: 'function twoSum(nums, target) {\n    return [];\n}\n\nconst fs = require("fs");\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\nconst n = parseInt(input[0]);\nconst nums = input[1].split(" ").map(Number);\nconst target = parseInt(input[2]);\nconsole.log("[" + twoSum(nums, target).join(", ") + "]");'
        },
        solution: {
          code: {
            python: `def twoSum(nums, target):\n    numMap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in numMap:\n            return [numMap[complement], i]\n        numMap[num] = i\n    return []`,
            javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`
          },
          explanation: 'We can use a Hash Map to store the values we have seen so far and their indices. For each number, we calculate its complement (`target - num`) and check if it exists in the Hash Map. If it does, we immediately return the two indices. If not, we add the current number and its index to the map.',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(N)'
        }
      },
      {
        title: 'Palindrome Number',
        description: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nA palindrome is a number that reads the same backward as forward.',
        difficulty: 'Easy',
        isPremium: false,
        topics: ['Math'],
        companies: ['Facebook', 'Microsoft', 'Bloomberg'],
        constraints: [
          '-2^31 <= x <= 2^31 - 1'
        ],
        examples: [
          {
            input: 'x = 121',
            output: 'true',
            explanation: '121 reads as 121 from left to right and from right to left.'
          }
        ],
        testCases: [
          { input: '121', output: 'true', isHidden: false },
          { input: '-121', output: 'false', isHidden: false },
          { input: '10', output: 'false', isHidden: true }
        ],
        templates: {
          python: 'def isPalindrome(x):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    x = int(sys.stdin.read().strip())\n    print("true" if isPalindrome(x) else "false")',
          javascript: 'function isPalindrome(x) {\n}\n\nconst fs = require("fs");\nconst x = parseInt(fs.readFileSync("/dev/stdin", "utf-8").trim());\nconsole.log(isPalindrome(x) ? "true" : "false");'
        },
        solution: {
          code: {
            python: `def isPalindrome(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    revertedNumber = 0
    while x > revertedNumber:
        revertedNumber = revertedNumber * 10 + x % 10
        x //= 10
    return x == revertedNumber or x == revertedNumber // 10`,
            javascript: `function isPalindrome(x) {
    if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
    let reverse = 0;
    while (x > reverse) {
        reverse = reverse * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    return x === reverse || x === Math.floor(reverse / 10);
}`
          },
          explanation: 'Instead of converting the number to a string (which takes O(N) extra space), we can mathematically reverse the second half of the number and compare it to the first half. When `x > reverse`, we know we have reached the middle of the number.',
          timeComplexity: 'O(log10(X))',
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
          python: 'def lengthOfLongestSubstring(s):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(lengthOfLongestSubstring(s))',
          javascript: 'function lengthOfLongestSubstring(s) {\n}\n\nconst fs = require("fs");\nconst s = fs.readFileSync("/dev/stdin", "utf-8").trim();\nconsole.log(lengthOfLongestSubstring(s));'
        },
        solution: {
          code: {
            python: `def lengthOfLongestSubstring(s: str) -> int:\n    charMap = {}\n    left = 0\n    maxLength = 0\n    \n    for right in range(len(s)):\n        if s[right] in charMap and charMap[s[right]] >= left:\n            left = charMap[s[right]] + 1\n        charMap[s[right]] = right\n        maxLength = max(maxLength, right - left + 1)\n        \n    return maxLength`,
            javascript: `var lengthOfLongestSubstring = function(s) {\n    let map = new Map();\n    let left = 0;\n    let max = 0;\n    for(let i = 0; i < s.length; i++) {\n        if(map.has(s[i])) {\n            left = Math.max(map.get(s[i]) + 1, left);\n        }\n        map.set(s[i], i);\n        max = Math.max(max, i - left + 1);\n    }\n    return max;\n};`
          },
          explanation: 'We use the Sliding Window technique. We maintain a window `[left, right]` and a hash map to store the last seen position of each character. When we encounter a character we already have in our window, we instantly move the `left` pointer just past its previous occurrence.',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(min(M, N)) (Size of charset)'
        }
      },
      {
        title: 'Regular Expression Matching',
        description: 'Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` and `*` where:\n- `.` Matches any single character.\n- `*` Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).',
        difficulty: 'Hard',
        isPremium: true,
        topics: ['String', 'Dynamic Programming', 'Recursion'],
        companies: ['Facebook', 'Google', 'Uber'],
        constraints: [
          '1 <= s.length <= 20',
          '1 <= p.length <= 20'
        ],
        examples: [
          {
            input: 's = "aa", p = "a*"',
            output: 'true',
            explanation: '"*" means zero or more of the preceding element, \'a\'. Therefore, by repeating \'a\' once, it becomes "aa".'
          }
        ],
        testCases: [
          { input: 'aa\na*', output: 'true', isHidden: false },
          { input: 'ab\n.*', output: 'true', isHidden: false },
          { input: 'mississippi\nmis*is*p*.",', output: 'false', isHidden: true }
        ],
        templates: {
          python: 'def isMatch(s, p):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    inputs = sys.stdin.read().split("\\n")\n    if len(inputs) >= 2:\n        print("true" if isMatch(inputs[0].strip(), inputs[1].strip()) else "false")',
          javascript: 'function isMatch(s, p) {\n}\n\nconst fs = require("fs");\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\nif (input.length >= 2) {\n    console.log(isMatch(input[0], input[1]) ? "true" : "false");\n}'
        },
        solution: {
          code: {
            javascript: `function isMatch(s, p) {\n    const dp = Array(s.length + 1).fill(false).map(() => Array(p.length + 1).fill(false));\n    dp[0][0] = true;\n    for (let j = 1; j <= p.length; j++) {\n        if (p[j - 1] === '*') {\n            dp[0][j] = dp[0][j - 2];\n        }\n    }\n    for (let i = 1; i <= s.length; i++) {\n        for (let j = 1; j <= p.length; j++) {\n            if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {\n                dp[i][j] = dp[i - 1][j - 1];\n            } else if (p[j - 1] === '*') {\n                dp[i][j] = dp[i][j - 2];\n                if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) {\n                    dp[i][j] = dp[i][j] || dp[i - 1][j];\n                }\n            } else {\n                dp[i][j] = false;\n            }\n        }\n    }\n    return dp[s.length][p.length];\n}`
          },
          explanation: 'This problem is elegantly solved using 2D Dynamic Programming. We create a DP matrix where `dp[i][j]` means that `s[0..i-1]` matches `p[0..j-1]`. If the current pattern character is `*`, we can strictly drop the group (check `dp[i][j-2]`) or extend it (check `dp[i-1][j]`) if the preceding character matches.',
          timeComplexity: 'O(S * P)',
          spaceComplexity: 'O(S * P)'
        }
      },
      {
        title: 'Merge Intervals',
        description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        difficulty: 'Medium',
        isPremium: false,
        topics: ['Array', 'Sorting'],
        companies: ['Google', 'Facebook', 'Microsoft', 'Bloomberg'],
        constraints: [
          '1 <= intervals.length <= 10^4'
        ],
        examples: [
          {
            input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
            output: '[[1,6],[8,10],[15,18]]',
            explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
          }
        ],
        testCases: [
          { input: '4\n1 3\n2 6\n8 10\n15 18', output: '[[1, 6], [8, 10], [15, 18]]', isHidden: false },
          { input: '2\n1 4\n4 5', output: '[[1, 5]]', isHidden: false }
        ],
        templates: {
          python: 'def merge(intervals):\n    pass\n\nimport sys\nif __name__ == "__main__":\n    n = int(sys.stdin.readline())\n    intervals = []\n    for _ in range(n):\n        intervals.append(list(map(int, sys.stdin.readline().split())))\n    print(merge(intervals))',
          javascript: 'function merge(intervals) {\n    return [];\n}'
        },
        solution: {
          code: {
            python: `def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or merged[-1][1] < interval[0]:\n            merged.append(interval)\n        else:\n            merged[-1][1] = max(merged[-1][1], interval[1])\n    return merged`
          },
          explanation: 'Sort the intervals by their start times. Then iterate over the intervals, adding the current interval to a merged list if it does not overlap with the last seen interval. If it does overlap, update the end time of the last seen interval to be the maximum of both.',
          timeComplexity: 'O(N log N)',
          spaceComplexity: 'O(log N)'
        }
      }
    ];

    const insertedProblems = await Problem.insertMany(problemsList);
    console.log(`Seeded complete enhanced problem list: ${insertedProblems.length} records.`);

    // Purge and construct Weekly Challenge incorporating the first 4 standard problems
    const WeeklyChallenge = require('../models/WeeklyChallenge');
    await WeeklyChallenge.deleteMany({});
    
    // Set Challenge window from yesterday to +7 days
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 1);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 7);

    const challengeProblems = insertedProblems.slice(0, 4).map(p => p._id);
    
    await WeeklyChallenge.create({
      title: 'Weekly Master Challenge #1',
      startDate,
      endDate,
      problems: challengeProblems
    });
    console.log('Actived Weekly Challenge #1.');

  } catch (error) {
    console.error(`Error seeding problems: ${error.message}`);
  }
};

module.exports = seedProblems;
