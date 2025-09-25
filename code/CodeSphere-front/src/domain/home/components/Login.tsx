import { Button } from '@/share/components/ui/Button';
import { useLogin } from '@/share/hooks/useLogin';
import FormField from './FormField';

export default function Login() {
  const { loginForm, handleLoginForm, handleLogin, isPending } = useLogin();

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <FormField
        handleInputChange={(e) => handleLoginForm(e, 'login_id')}
        label="아이디"
        placeholder="아이디를 입력하세요"
        fieldId="login_id"
        value={loginForm.login_id}
      />
      <FormField
        handleInputChange={(e) => handleLoginForm(e, 'password')}
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        fieldId="password"
        value={loginForm.password}
        type="password"
      />
      <Button className="w-full" type="submit">
        {isPending ? '로그인 중...' : '로그인'}
      </Button>
      <div className="text-center">
        <Button variant="link" size="sm" className="text-xs">
          비밀번호를 잊으셨나요?
        </Button>
      </div>
    </form>
  );
}
