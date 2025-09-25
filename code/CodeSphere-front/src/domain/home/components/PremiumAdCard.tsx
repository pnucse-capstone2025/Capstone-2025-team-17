import { Button } from '@/share/components/ui/Button';
import { Card, CardContent } from '@/share/components/ui/Card';
import { Zap } from 'lucide-react';

export default function PremiumAdCard() {
  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100">
      <CardContent className="p-6 text-center">
        <Zap className="mx-auto mb-3 h-12 w-12 text-blue-600" />
        <h3 className="mb-2 font-semibold text-gray-900">프리미엄 플랜</h3>
        <p className="mb-4 text-sm text-gray-600">
          무제한 힌트와 상세한 해설을 받아보세요!
        </p>
        <Button size="sm" className="w-full">
          자세히 보기
        </Button>
      </CardContent>
    </Card>
  );
}
