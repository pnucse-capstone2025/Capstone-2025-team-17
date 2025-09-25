interface SolvedProblem {
  id: number;
  title: string;
  difficulty: '쉬움' | '보통' | '어려움';
  tags: string[];
  solvedAt: string;
  attempts: number;
  score: number;
  executionTime: string;
  memoryUsage: string;
  language: string;
  status: 'solved' | 'attempted';
  accuracy: number;
}

export const solvedProblems: SolvedProblem[] = [
  {
    id: 1001,
    title: '두 수의 합',
    difficulty: '쉬움',
    tags: ['수학', '구현'],
    solvedAt: '2024-01-15 14:30',
    attempts: 1,
    score: 100,
    executionTime: '0.001s',
    memoryUsage: '2.1MB',
    language: 'Python',
    status: 'solved',
    accuracy: 100,
  },
  {
    id: 1005,
    title: '문자열 뒤집기',
    difficulty: '쉬움',
    tags: ['문자열', '구현'],
    solvedAt: '2024-01-14 16:45',
    attempts: 2,
    score: 85,
    executionTime: '0.002s',
    memoryUsage: '2.3MB',
    language: 'Python',
    status: 'solved',
    accuracy: 50,
  },
  {
    id: 1009,
    title: '해시 테이블',
    difficulty: '보통',
    tags: ['해시', '자료구조'],
    solvedAt: '2024-01-13 10:20',
    attempts: 3,
    score: 75,
    executionTime: '0.015s',
    memoryUsage: '4.2MB',
    language: 'Java',
    status: 'solved',
    accuracy: 33,
  },
  {
    id: 1002,
    title: '피보나치 수열',
    difficulty: '보통',
    tags: ['동적계획법', '수학'],
    solvedAt: '2024-01-12 09:15',
    attempts: 5,
    score: 60,
    executionTime: '0.008s',
    memoryUsage: '3.1MB',
    language: 'C++',
    status: 'attempted',
    accuracy: 20,
  },
  {
    id: 1006,
    title: '정렬 알고리즘 구현',
    difficulty: '보통',
    tags: ['정렬', '알고리즘'],
    solvedAt: '2024-01-11 15:30',
    attempts: 2,
    score: 90,
    executionTime: '0.012s',
    memoryUsage: '3.8MB',
    language: 'Python',
    status: 'solved',
    accuracy: 50,
  },
];
