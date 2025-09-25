import FormField from '@/domain/home/components/FormField';
import { Button } from '@/share/components/ui/Button';
import { DialogHeader } from '@/share/components/ui/Dialog';
import { useLogin } from '@/share/hooks/useLogin';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';

export default function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (show: boolean) => void;
}) {
  const { loginForm, handleLoginForm, handleLogin, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleLogin(e);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" />

      <DialogContent
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none"
        onOpenAutoFocus={() => {
          document.body.style.overflow = 'hidden';
        }}
        onCloseAutoFocus={() => {
          document.body.style.overflow = '';
        }}
      >
        <DialogHeader>
          <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
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
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
