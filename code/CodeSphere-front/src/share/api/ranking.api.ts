import { apiClient } from '@/share/api/apiClient';

type GetRankingParams = {
  skip?: number;
  limit?: number;
  auth?: string;
};

export interface RankingType {
  rank: number;
  login_id: string;
  total_score: number;
  solved_count: number;
}

export interface GetRankingResponse {
  ranks: RankingType[];
}

export interface MyRankResponse {
  rank: number;
  login_id: string;
  total_score: number;
  solved_count: number;
}
interface GetMyRankParams {
  auth: string;
}

export async function getRanking({
  skip = 0,
  limit = 100,
  auth,
}: GetRankingParams) {
  try {
    const data = await apiClient.get(
      `/ranking?skip=${skip}&limit=${limit}`,
      auth ? auth : undefined,
    );

    return data;
  } catch (error) {
    console.error('사용자 랭킹 조회 중 오류 발생:', error);
    throw error;
  }
}

export async function getMyRank({ auth }: GetMyRankParams) {
  try {
    const data = await apiClient.get(
      '/ranking/my-rank',
      auth ? auth : undefined,
    );
    return data;
  } catch (error) {
    console.error('내 랭킹 정보 조회 중 오류 발생:', error);
    throw error;
  }
}
