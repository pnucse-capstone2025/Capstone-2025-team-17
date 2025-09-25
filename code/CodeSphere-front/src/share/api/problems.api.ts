import { apiClient } from '@/share/api/apiClient';
import { Problem } from '@/share/type/problem';
import {
  ProblemDifficulty,
  ProblemSortBy,
  ProblemTagKey,
  SolvedStatus,
} from '@/share/type/problemSort';

interface GetProblemsParams {
  limit?: number;
  page?: number;
  auth: string;
}

interface GetProblemDetailParams {
  id: number | string;
}

export interface GetProblemListParams {
  search?: string | null;
  difficulty?: ProblemDifficulty | null;
  tags?: ProblemTagKey | null;
  solved_status?: SolvedStatus | null;
  sort_by?: ProblemSortBy | null;
  skip?: number;
  limit?: number;
  auth?: string;
}

export interface GetProblemListResponse {
  data: Problem[];
  total: number;
}

export async function getProblemDetail({ id }: GetProblemDetailParams) {
  try {
    const data = await apiClient.get(`/problems/${id}`);
    return data;
  } catch (error) {
    console.error('문제 상세 조회 중 오류 발생:', error);
    throw error;
  }
}

export async function getProblems({
  limit = 10,
  page = 1,
  auth,
}: GetProblemsParams) {
  try {
    const data = await apiClient.get(
      `/problems/list?limit=${limit}&page=${page}`,
      auth ? auth : undefined,
    );

    return data;
  } catch (error) {
    console.error('문제 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

export async function getRecommendProblems({
  auth,
}: {
  auth: string | undefined;
}) {
  try {
    const data = await apiClient.get(
      '/problems/recommend_problems',
      auth ? auth : undefined,
    );
    return data;
  } catch (error) {
    console.error('recommended problems 가져오기 중 오류', error);
    throw error;
  }
}

export async function getProblemListNew({
  search,
  difficulty,
  tags,
  solved_status,
  sort_by,
  skip = 0,
  limit = 100,
  auth,
}: GetProblemListParams): Promise<GetProblemListResponse> {
  try {
    const searchParams = new URLSearchParams();

    const queryParams = {
      search,
      difficulty,
      tags,
      solved_status,
      sort_by,
      skip,
      limit,
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response = await apiClient.get(
      `/problems/new-list?${searchParams.toString()}`,
      auth ? auth : undefined,
    );

    return response;
  } catch (error) {
    console.error('문제 목록 조회 중 오류 발생:', error);
    throw error;
  }
}
