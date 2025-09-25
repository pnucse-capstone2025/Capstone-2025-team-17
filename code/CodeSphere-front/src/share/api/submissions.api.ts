import { apiClient } from '@/share/api/apiClient';

export interface PostSubmissionsParams {
  real_pid: string;
  language: 'python';
  code: string;
  auth: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtime_ms: number;
  memory_kb: number;
}

export interface SubmissionResult {
  result: string;
  passed: number;
  total: number;
  runtime_ms: number;
  memory_kb: number;
  testCases: TestCase[];
}

export async function postSubmissions({
  real_pid,
  language,
  code,
  auth,
}: PostSubmissionsParams): Promise<SubmissionResult> {
  try {
    const response = await apiClient.post(
      '/submissions/submit',
      {
        real_pid,
        language,
        code,
      },
      auth,
    );
    return response;
  } catch (error) {
    console.error('제출 중 오류 발생:', error);
    throw error;
  }
}

export async function postSubmissionsTest({
  real_pid,
  language,
  code,
  auth,
}: PostSubmissionsParams): Promise<SubmissionResult> {
  try {
    const response = await apiClient.post(
      '/submissions/test',
      {
        real_pid,
        language,
        code,
      },
      auth,
    );
    return response;
  } catch (error) {
    console.error('제출 테스트 중 오류 발생:', error);
    throw error;
  }
}

export async function postSubmissionsSave({
  real_pid,
  language,
  code,
  auth,
}: PostSubmissionsParams): Promise<string> {
  try {
    const response = await apiClient.post(
      '/submissions/save',
      {
        real_pid,
        language,
        code,
      },
      auth,
    );
    return response;
  } catch (error) {
    console.error('초안 저장 중 오류 발생:', error);
    throw error;
  }
}

interface GetSubmissionsLoadParams {
  real_pid: string;
  auth?: string;
}

export interface SubmissionLoadResult {
  real_pid: string;
  code: string;
  language: string;
  updated_at: string;
  hint_count: number;
}

export async function getSubmissionsLoad({
  real_pid,
  auth,
}: GetSubmissionsLoadParams): Promise<SubmissionLoadResult> {
  try {
    const response = await apiClient.get(`/submissions/load/${real_pid}`, auth);
    return response;
  } catch (error) {
    console.error('초안 불러오기 중 오류 발생:', error);
    throw error;
  }
}
