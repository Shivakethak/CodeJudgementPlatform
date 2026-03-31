const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCode: `function solve(input) {
  const { nums, target } = input;
  // write your code here
  return [];
}`,
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
