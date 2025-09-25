export type ProblemSortBy =
  | 'real_pid'
  | 'title'
  | 'level'
  | 'acceptance_rate'
  | 'submitters'
  | 'submit_count';

export type SolvedStatus = 'solved' | 'unsolved';

export type ProblemDifficulty = '쉬움' | '보통' | '어려움';

export const ALL_PROBLEM_TAGS = [
  'dfs',
  'bfs',
  'dijkstra',
  'dp',
  'dynamic programming',
  'two pointers',
  'greedy',
  'binary search',
  'union find',
  'topological sort',
  'tree',
  'segment tree',
  'prefix sum',
  'math',
  'heap',
  'hash table',
  'trie',
  'stack / queue',
  'minimum spanning tree',
  'floyd-warshall',
  'backtracking',
  'divide and conquer',
  'string',
  'bitmask',
  'implementation',
  'combinatorics',
] as const;

export type ProblemTagKey = (typeof ALL_PROBLEM_TAGS)[number];
