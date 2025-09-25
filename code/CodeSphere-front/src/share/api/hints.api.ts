import { apiClient } from '@/share/api/apiClient';

interface GetMyHintParams {
  auth: string;
  real_pid: string;
}

export async function getMyHint({ real_pid, auth }: GetMyHintParams) {
  try {
    const data = await apiClient.get(`/hints/myhint/${real_pid}`, auth);
    return data;
  } catch (error) {
    console.error('내 힌트 조회 중 오류 발생:', error);
    throw error;
  }
}

interface PostHintParams {
  real_pid: string;
  user_code: string;
  language: string;
  auth: string;
}

export async function postHint({
  real_pid,
  auth,
  user_code,
  language,
}: PostHintParams) {
  try {
    const data = await apiClient.post(
      `/hints/request`,
      {
        real_pid,
        user_code,
        language,
      },
      auth,
    );
    return data;
  } catch (error) {
    console.error('힌트 요청 중 오류 발생:', error);
    throw error;
  }
}
