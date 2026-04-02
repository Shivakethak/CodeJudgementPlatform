const state = {
  token: localStorage.getItem("token") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  selectedProblemId: null,
  selectedLanguage: localStorage.getItem("selectedLanguage") || "java",
  problems: [],
  submissions: [],
  contests: [],
  problemPage: 1,
  submissionPage: 1,
  pageSize: 6,
  search: "",
  difficulty: "ALL",
  selectedContestId: null,
  contestTicker: null,
  playlists: []
};

const languageTemplates = {
  javascript: `function solve(input) {
  const { nums, target } = input;
  // Write your code here
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
};

// ... rest of the code remains the same ...
    await api("/api/contests", {
      method: "POST",
      body: JSON.stringify({ title, description, startTime, endTime, problemIds })
    });
    adminMsg.textContent = "Contest created.";
    loadContests();
  } catch (err) {
    adminMsg.textContent = err.message;
  }
});

renderAuth();
