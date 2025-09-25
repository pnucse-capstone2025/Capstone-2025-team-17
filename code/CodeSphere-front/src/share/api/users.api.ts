import { apiClient } from '@/share/api/apiClient';
import { SubmissionResultFilter } from '@/share/type/submissionResultFilter';

interface PostAuthSignupParams {
  login_id: string;
  password: string;
  email: string;
  confirmPassword: string;
}

export interface GetMySubmitParams {
  result_filter?: SubmissionResultFilter | null | 'all';
  auth: string;
}

export interface UserSubmission {
  submit_id: number;
  problem_id: number;
  result: SubmissionResultFilter;
  runtime: number;
  memory: number;
  submitted_at: string;
}

export interface GetMySubmitResponse {
  submissions: UserSubmission[];
  total: number;
}

export interface GetSolvedDaysParams {
  auth: string;
}

export interface GetSolvedDaysResponse {
  solved_days: string[];
}

export function postAuthSignup({
  login_id,
  password,
  email,
}: PostAuthSignupParams) {
  try {
    const data = apiClient.post('/users/signup', {
      login_id,
      password,
      email,
    });
    return data;
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    throw error;
  }
}

interface GetMySubmissionsParams {
  auth: string;
}

export async function getMySubmissions({ auth }: GetMySubmissionsParams) {
  try {
    const data = await apiClient.get('/users/mysubmissions', auth);

    return data;
  } catch (error) {
    console.error('내 제출물 조회 중 오류 발생:', error);
    throw error;
  }
}

export async function getFilteredMySubmissions({
  result_filter,
  auth,
}: GetMySubmitParams) {
  try {
    const searchParams = new URLSearchParams();
    if (result_filter && result_filter !== 'all') {
      searchParams.append('result_filter', result_filter);
    }

    let data;
    if (result_filter) {
      data = await apiClient.get(
        `/users/new-mysubmit?${searchParams.toString()}`,
        auth,
      );
    } else {
      data = await apiClient.get('/users/new-mysubmit', auth);
    }

    return data;
  } catch (error) {
    console.error('내 제출 기록 조회 중 오류 발생:', error);
    throw error;
  }
}

export async function getSolvedDays({ auth }: GetSolvedDaysParams) {
  try {
    const data = await apiClient.get('/users/solved-days', auth);
    return data;
  } catch (error) {
    console.error('Solved days 조회 중 오류 발생:', error);
    throw error;
  }
}
