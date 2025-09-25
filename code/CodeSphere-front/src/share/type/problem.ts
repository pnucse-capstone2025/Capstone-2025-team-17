export interface UserProblem extends ProblemFake {
  status: 'solved' | 'attempted' | 'unsolved';
  bookmarked: boolean;
  category: string;
}

export interface ProblemFake {
  id: number;
  title: string;
  difficulty: '쉬움' | '보통' | '어려움';
  successRate: number;
  tags: string[];
  submissions: number;
  likes: number;
  estimatedTime: string;
}

// ---- 위에껀 사용 안됨 -----
export interface Problem {
  real_pid: string;
  title: string;
  tag: string[];
  submit_count: number;
  user_result: 'PASS' | 'FAIL' | 'NONE';
  correct_rate: number;
  level: number;
}

export interface ProblemDetail {
  real_pid: string;
  title: string;
  body: string;
  example_io: ExampleIo[];
  level: number;
  tag: string[];
  input: string;
  output: string;
  problem_constraint: string;
}

export interface ExampleIo {
  input: string;
  output: string;
}
