import { apiClient } from '@/share/api/apiClient';

export interface GenerateProblemRequest {
  algorithm_type: string;
  difficulty: string;
  auth?: string;
}

export interface Root {
  success: boolean;
  real_pid: number;
  title: string;
  description: string;
  example_io: ExampleIo[];
  test_io: TestIo[];
  solve_code: string;
  tag: string[];
  level: number;
  personalized_level: number;
  similarity: number;
  error_report: string;
  raw_markdown: string;
}

export interface ExampleIo {
  input: string;
  output: string;
}

export interface TestIo {
  input: string;
  output: string;
}

export async function postGenerateProblem({
  algorithm_type,
  difficulty,
  auth,
}: GenerateProblemRequest) {
  try {
    const response = await apiClient.post(
      '/generator/generate/new',
      {
        algorithm_type,
        difficulty,
      },
      auth,
    );
    return response;
  } catch (error) {
    console.error('문제 생성 중 오류 발생:', error);
    throw new Error('문제 생성에 실패했습니다. 나중에 다시 시도해주세요.');
  }
}

interface GetGeneratedMyProblemsParams {
  auth: string;
}

export async function getGeneratedMyProblems({
  auth,
}: GetGeneratedMyProblemsParams) {
  try {
    const data = await apiClient.get('/generator/my-problems', auth);

    return data;
  } catch (error) {
    console.error('내가 생성한 문제 목록 조회 중 오류 발생:', error);
    throw error;
  }
}
