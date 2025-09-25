import {
  algorithmTypes,
  difficultyOptions,
} from '@/domain/createProblem/constants/createProblem.constants';
import Loading from '@/domain/createProblem/layout/Loading';
import { Button } from '@/share/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { Label } from '@/share/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/share/components/ui/Select';
import { AlertCircle, Loader2, Settings, Sparkles } from 'lucide-react';

export default function ProblemBuilder({
  error,
  isGenerating,
  handleGenerate,
  algorithmType,
  setAlgorithmType,
  difficulty,
  setDifficulty,
}: {
  error?: string;
  isGenerating: boolean;
  handleGenerate: () => void;
  algorithmType: string;
  setAlgorithmType: (type: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* 문제 생성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-blue-600" />
            문제 생성 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 알고리즘 유형 선택 */}
          <div className="space-y-2">
            <Label htmlFor="algorithm">알고리즘 유형</Label>
            <Select value={algorithmType} onValueChange={setAlgorithmType}>
              <SelectTrigger>
                <SelectValue placeholder="알고리즘 유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {algorithmTypes.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 난이도 선택 */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">난이도</Label>
            <Select
              value={difficulty} // 'easy' | 'medium' | 'hard'
              onValueChange={setDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="난이도를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 최대 시도 횟수 */}
          {/* <div className="space-y-2">
            <Label htmlFor="attempts">최대 시도 횟수</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number.parseInt(e.target.value))}
            />
          </div> */}

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center space-x-2 rounded bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 생성 버튼 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !algorithmType || !difficulty}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                문제 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                문제 생성하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {isGenerating && (
        <Loading algorithmType={algorithmType} difficulty={difficulty} />
      )}
    </div>
  );
}
