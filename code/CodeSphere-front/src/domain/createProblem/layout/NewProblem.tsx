import { GeneratedProblem } from '@/domain/createProblem/components/CreateProblemPage';
import { Badge } from '@/share/components/ui/Badge';
import { Button } from '@/share/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { Separator } from '@/share/components/ui/Separator';
import { AlertCircle, CheckCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewProblem({
  generatedProblem,
  onReset: handleReset,
  getDifficultyColor,
  difficulty,
}: {
  generatedProblem: GeneratedProblem;
  onReset: () => void;
  getDifficultyColor: (difficulty: string) => string;
  difficulty: string;
}) {
  const navigate = useNavigate();
  const handleProblemClick = () => {
    navigate(`/problems/solve/${generatedProblem.real_pid}`);
  };

  if (!generatedProblem.success)
    return (
      <div className="space-y-6">
        {/* 실패 메시지 */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">
                문제 생성에 실패했습니다. 잠시 후 다시 시도해주세요.
              </span>
            </div>

            <hr />
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <div>
                현재 문제 유형을 <strong> 3개 이상</strong>
                맞혔다면, 아래 '문제 생성하기' 버튼을 통해 학습을 평가할 새로운
                문제를 만들 수 있습니다.
              </div>
              <div className="font-bold">
                (※ 3문항 이상 정답 시에만 생성이 가능합니다.)
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleReset}
          >
            새 문제 생성
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 성공 메시지 */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">
              문제가 성공적으로 생성되었습니다!
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 문제 정보 */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  #{generatedProblem.real_pid}. {generatedProblem.title}
                </CardTitle>
                <Badge className={getDifficultyColor(difficulty)}>
                  {difficulty}
                </Badge>
              </div>
              <div className="flex gap-2">
                {generatedProblem.tag.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">문제 설명</h3>
                <p className="text-sm whitespace-pre-line text-gray-700">
                  {generatedProblem.body}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-semibold">입력</h3>
                <p className="text-sm whitespace-pre-line text-gray-700">
                  {generatedProblem.input}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">출력</h3>
                <p className="text-sm whitespace-pre-line text-gray-700">
                  {generatedProblem.output}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-semibold">예제</h3>
                {generatedProblem.example_io.map((example, index) => (
                  <div key={index} className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="mb-1 text-sm font-medium">
                          예제 입력 {index + 1}
                        </h4>
                        <div className="rounded bg-gray-100 p-2 font-mono text-sm whitespace-pre">
                          {example.input}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium">
                          예제 출력 {index + 1}
                        </h4>
                        <div className="rounded bg-gray-100 p-2 font-mono text-sm whitespace-pre">
                          {example.output}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* <div>
                <h3 className="mb-2 font-semibold"> ⚠️ 제약조건</h3>
                <p className="text-sm whitespace-pre-line text-gray-700">
                  <pre>{generatedProblem.problem_constraint}</pre>
                </p>
              </div> */}

              <div>
                <div className="overflow-x-auto rounded border-4 border-rose-50 p-4 font-mono text-sm text-rose-500">
                  <h3 className="mb-2 font-semibold text-black">⚠️ 제약조건</h3>
                  <pre>{generatedProblem.problem_constraint}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 정보 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">문제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">문제 ID</span>
                <span className="font-semibold">
                  #{generatedProblem.real_pid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">레벨</span>
                <span className="font-semibold">{generatedProblem.level}</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-sm text-gray-600">개인화 레벨</span>
                <span className="font-semibold">
                  {generatedProblem.personalized_level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">유사도</span>
                <span className="font-semibold">
                  {(generatedProblem.similarity * 100).toFixed(1)}%
                </span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">테스트 케이스</span>
                <span className="font-semibold">
                  {generatedProblem.example_io.length}개
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              className="w-full bg-blue-500"
              size="lg"
              onClick={handleProblemClick}
            >
              <Play className="mr-2 h-4 w-4" />
              문제 풀어보기
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleReset}
            >
              새 문제 생성
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
