import { postAuthRefresh } from '@/share/api/auth.api';
import { useAuthStore } from '@/share/store/authStore';

let refreshPromise: Promise<string> | null = null;
export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const { refreshToken, user } = useAuthStore.getState();
  const { setAuth } = useAuthStore.getState();

  if (!refreshToken) throw new Error('No refresh token');

  refreshPromise = (async () => {
    const data = await postAuthRefresh({ refresh_token: refreshToken });
    const newAccess = data?.access_token;
    const newRefresh = data?.refresh_token;

    if (!newAccess || !newRefresh || !user)
      throw new Error('No access_token from refresh');

    setAuth({
      accessToken: newAccess,
      refreshToken: newRefresh,
    });
    return newAccess;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
