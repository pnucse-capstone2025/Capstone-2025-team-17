import { refreshAccessToken } from '@/share/utils/refreshAccessToken';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = {
  get: (url: string, auth?: string) => {
    return baseClient({
      url,
      method: 'GET',
      auth,
    });
  },
  post: (url: string, data: Record<string, any>, auth?: string) => {
    return baseClient({
      url,
      method: 'POST',
      data,
      auth,
    });
  },
};

interface BaseClientParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  auth?: string;
}

function isAuthEndpoint(url: string) {
  return /\/auth\/(login)/.test(url);
}

async function baseClient({
  url,
  method = 'GET',
  headers = {},
  data,
  auth,
}: BaseClientParams): Promise<any> {
  const params = { url, method, headers, data, auth };

  if (!baseURL) {
    throw new Error('Missing VITE_API_BASE_URL');
  }

  const fullUrl = `${baseURL}${url}`;
  const fetchOptions = getFetchOptions(params);

  try {
    const response = await fetch(fullUrl, fetchOptions);

    if (
      !isAuthEndpoint(url) &&
      (response.status === 401 || response.status === 403)
    ) {
      reFetchWithRefreshToken({ url: fullUrl, method, headers, data });
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

async function reFetchWithRefreshToken({
  url,
  method = 'GET',
  headers = {},
  data,
}: BaseClientParams): Promise<any> {
  try {
    const newAccess = await refreshAccessToken();
    const params = { url, method, headers, data, auth: newAccess };

    if (!baseURL) {
      throw new Error('Missing VITE_API_BASE_URL');
    }
    const fetchOptions = getFetchOptions(params);

    const retryRes = await fetch(url, fetchOptions);

    if (!retryRes.ok)
      throw new Error(`HTTP ${retryRes.status}: ${await retryRes.text()}`);

    const contentType = retryRes.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      return await retryRes.json();
    }

    return await retryRes.text();
  } catch (error) {
    console.error('리프레시 토큰 재발금 실패', error);
    throw new Error('리프레시 토큰 재발금 실패');
  }
}

function getFetchOptions(params: BaseClientParams) {
  const { method, headers, data, auth } = params;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      authorization: auth ? `Bearer ${auth}` : '',
      ...headers,
    },
  };

  if (method !== 'GET' && data) {
    fetchOptions.body = JSON.stringify(data);
  }

  return fetchOptions;
}
