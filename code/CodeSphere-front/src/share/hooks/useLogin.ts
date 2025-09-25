import { postAuthLogin } from '@/share/api/auth.api';
import { useAuthStore } from '@/share/store/authStore';
import { AuthLoginResponse } from '@/share/type/auth';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export function useLogin() {
  const [loginForm, setLoginForm] = useState({ login_id: '', password: '' });

  const { setAuth } = useAuthStore();

  const { mutate: loginMutate, isPending } = useMutation({
    mutationKey: ['authLogin'],
    mutationFn: () => postAuthLogin(loginForm),
    onSuccess: (data: AuthLoginResponse) => {
      setAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: {
          user_id: data.user_id,
          login_id: data.login_id,
          email: data.email,
        },
      });
    },
    onError: () => {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      setAuth({
        accessToken: null,
        refreshToken: null,
        user: null,
      });
      setLoginForm({ login_id: '', password: '' });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutate();
  };

  const handleLoginForm = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    setLoginForm({
      ...loginForm,
      [name]: e.target.value,
    });
  };

  return {
    loginForm,
    handleLoginForm,
    handleLogin,
    isPending,
    loginMutate,
  };
}
