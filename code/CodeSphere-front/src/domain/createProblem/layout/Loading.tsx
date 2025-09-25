import { Card, CardContent } from '@/share/components/ui/Card';
import { Loader2, Sparkles } from 'lucide-react';

export default function Loading({
  algorithmType,
  difficulty,
}: {
  algorithmType: string;
  difficulty: string;
}) {
  return (
    <Card className="mt-6">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 animate-pulse text-yellow-500" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              AI가 문제를 생성하고 있습니다
            </h3>
            <p className="text-gray-600">
              {algorithmType} 알고리즘 기반의 {difficulty} 난이도 문제를 만들고
              있어요...
            </p>
          </div>
          {/* <div className="h-2 w-full max-w-xs rounded-full bg-gray-200">
            <div
              className="h-2 animate-pulse rounded-full bg-blue-600"
              style={{ width: '60%' }}
            />
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
