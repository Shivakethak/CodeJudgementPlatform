const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i], target <= 10^9", "Only one valid answer exists."],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] = 9"
      },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    hints: ["Use a hash map to track visited values and their indices."],
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCode: `function solve(input) {
  const { nums, target } = input;
  // write your code here
  return [];
}`,
    multiLanguageStarterCode: {
      javascript: `function solve(input) {
  const { nums, target } = input;
  // write your code here
  return [];
}`,
      python: `def solve(input_data):
    nums, target = input_data['nums'], input_data['target']
    # Write your code here
    return []`,
      java: `class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `vector<int> solve(vector<int> nums, int target) {
    // Write your code here
    return {};
}`,
      c: `int* solve(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    *returnSize = 2;
    int* result = malloc(2 * sizeof(int));
    return result;
}`
    },
    referenceSolution: (input) => {
      const seen = new Map();
      for (let i = 0; i < input.nums.length; i += 1) {
        const need = input.target - input.nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(input.nums[i], i);
      }
      return [];
    },
    tests: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    constraints: ["1 <= s.length <= 10^4", "s consists only of parentheses brackets."],
    examples: [
      { input: "s = \"()[]{}\"", output: "true" },
      { input: "s = \"(]\"", output: "false" }
    ],
    hints: ["Use a stack and a closing-to-opening character map."],
    statement:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCode: `function solve(input) {
  const { s } = input;
  // write your code here
  return false;
}`,
    referenceSolution: (input) => {
      const map = { ")": "(", "]": "[", "}": "{" };
      const stack = [];
      for (const ch of input.s) {
        if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
        else if (stack.pop() !== map[ch]) return false;
      }
      return stack.length === 0;
    },
    tests: [
      { input: { s: "()" }, expected: true },
      { input: { s: "()[]{}" }, expected: true },
      { input: { s: "(]" }, expected: false },
      { input: { s: "([)]" }, expected: false }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    constraints: ["1 <= nums.length <= 10^4", "nums is sorted in ascending order.", "All integers are unique."],
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" }
    ],
    hints: ["Maintain left and right pointers and shrink the range by midpoint."],
    statement:
      "Given a sorted array of integers nums and an integer target, return the index if target is found. Otherwise, return -1.",
    starterCode: `function solve(input) {
  const { nums, target } = input;
  // write your code here
  return -1;
}`,
    referenceSolution: (input) => {
      let left = 0;
      let right = input.nums.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (input.nums[mid] === input.target) return mid;
        if (input.nums[mid] < input.target) left = mid + 1;
        else right = mid - 1;
      }
      return -1;
    },
    tests: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 }
    ]
  }
];

module.exports = problems;
