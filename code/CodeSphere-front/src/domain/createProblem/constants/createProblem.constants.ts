export const algorithmTypes = [
  { value: 'dfs', label: 'DFS' },
  { value: 'bfs', label: 'BFS' },
  { value: 'dijkstra', label: '다익스트라' },
  { value: 'dp', label: '동적 계획법 (DP)' },
  { value: 'dynamic programming', label: '동적 계획법 (Dynamic Programming)' },
  { value: 'two pointers', label: '투 포인터' },
  { value: 'greedy', label: '그리디' },
  { value: 'binary search', label: '이분 탐색' },
  { value: 'union find', label: '유니온 파인드' },
  { value: 'topological sort', label: '위상 정렬' },
  { value: 'tree', label: '트리' },
  { value: 'segment tree', label: '세그먼트 트리' },
  { value: 'prefix sum', label: '누적 합' },
  { value: 'math', label: '수학' },

  // 🔽 추가된 항목들
  { value: 'heap', label: '힙 (Heap)' },
  { value: 'priority-queue', label: '우선순위 큐' },
  { value: 'hash table', label: '해시 테이블' },
  { value: 'hash-map', label: '해시 맵' },
  { value: 'trie', label: '트라이 (Trie)' },
  { value: 'prefix-tree', label: 'Prefix Tree' },
  { value: 'stack', label: '스택' },
  { value: 'queue', label: '큐' },
  { value: 'minimum spanning tree', label: '최소 신장 트리' },
  { value: 'mst', label: 'MST' },
  { value: 'floyd-warshall', label: '플로이드-워셜' },
  { value: 'shortest-path', label: '최단 경로' },
  { value: 'backtracking', label: '백트래킹' },
  { value: 'divide and conquer', label: '분할 정복' },
  { value: 'string', label: '문자열' },
  { value: 'string-manipulation', label: '문자열 처리' },
  { value: 'bitmask', label: '비트마스크' },
  { value: 'bit-manipulation', label: '비트 연산' },
  { value: 'implementation', label: '구현' },
  { value: 'simulation', label: '시뮬레이션' },
  { value: 'combinatorics', label: '조합론' },
];

export const difficultyOptions = [
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '중간' },
  { value: 'hard', label: '어려움' },
] as const;

export type DifficultyValue = (typeof difficultyOptions)[number]['value'];
