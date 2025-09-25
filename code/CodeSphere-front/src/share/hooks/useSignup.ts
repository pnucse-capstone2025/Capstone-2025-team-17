import { postAuthSignup } from '@/share/api/users.api';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export default function useSignup() {
  const [signupForm, setSignupForm] = useState({
    login_id: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { mutate } = useMutation({
    mutationFn: () => postAuthSignup(signupForm),
    onSuccess: () => {
      console.log('회원가입 성공');
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });

  const handleSignupForm = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    setSignupForm({
      ...signupForm,
      [name]: e.target.value,
    });
  };

  const handleInputChange = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return {
    signupForm,
    handleSignupForm,
    handleInputChange,
    mutate,
  };
}
