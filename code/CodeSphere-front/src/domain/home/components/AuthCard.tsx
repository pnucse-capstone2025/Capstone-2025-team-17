import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/share/components/ui/Tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { User } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';
import { useAuthStore } from '@/share/store/authStore';

export function AuthCard() {
  const { user } = useAuthStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <User className="mr-2 h-5 w-5 text-blue-600" />
          로그인
        </CardTitle>
      </CardHeader>
      <CardContent>
        {user ? (
          <div>
            환영합니다! <p>{user.login_id}님</p>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4 space-y-4">
              <Login />
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-4">
              <Signup />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
