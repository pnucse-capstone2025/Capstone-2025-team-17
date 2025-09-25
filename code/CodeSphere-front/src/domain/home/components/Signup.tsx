import { Button } from '@/share/components/ui/Button';
import FormField from './FormField';
import useSignup from '@/share/hooks/useSignup';

export default function Signup() {
  const { signupForm, handleSignupForm, handleInputChange } = useSignup();
  return (
    <form onSubmit={handleInputChange} className="space-y-4">
      <FormField
        handleInputChange={(e) => handleSignupForm(e, 'login_id')}
        label="아이디"
        placeholder="아이디를 입력하세요"
        fieldId="signup-login_id"
        value={signupForm.login_id}
      />

      <FormField
        handleInputChange={(e) => handleSignupForm(e, 'email')}
        label="이메일"
        placeholder="이메일을 입력하세요"
        fieldId="email"
        value={signupForm.email}
        type="email"
      />

      <FormField
        handleInputChange={(e) => handleSignupForm(e, 'password')}
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        fieldId="signup-password"
        value={signupForm.password}
        type="password"
      />

      <FormField
        handleInputChange={(e) => handleSignupForm(e, 'confirmPassword')}
        label="비밀번호 확인"
        placeholder="비밀번호를 다시 입력하세요"
        fieldId="confirm-password"
        value={signupForm.confirmPassword}
        type="password"
      />

      <Button className="w-full" type="submit">
        회원가입
      </Button>
    </form>
  );
}
