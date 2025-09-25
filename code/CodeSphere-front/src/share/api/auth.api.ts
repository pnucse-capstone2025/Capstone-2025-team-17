import { apiClient } from '@/share/api/apiClient';

interface PostAuthLoginParams {
  login_id: string;
  password: string;
}

export function postAuthLogin({ login_id, password }: PostAuthLoginParams) {
  try {
    const data = apiClient.post('/auth/login', {
      login_id,
      password,
    });
    if (!data) {
      throw new Error('로그인 응답이 유효하지 않습니다.');
    }
    return data;
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    throw error;
  }
}

interface PostAuthRegisterParams {
  refresh_token: string;
}

export function postAuthRefresh({ refresh_token }: PostAuthRegisterParams) {
  return apiClient.post('/auth/refresh', { refresh_token });
}
