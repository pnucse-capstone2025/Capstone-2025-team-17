import { getGeneratedMyProblems } from '@/share/api/generator.api';
import { Button } from '@/share/components/ui/Button';
import { Card, CardContent } from '@/share/components/ui/Card';
import { useAuthStore } from '@/share/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface GeneratedMyProblemResponse {
  title: string;
  real_pid: string;
  tag: string[];
  level: number;
}

export default function CreatedProblemList() {
  const { accessToken } = useAuthStore();

  const navigate = useNavigate();

  const handleProblemClick = (problemId: string) => {
    navigate(`/problems/solve/${problemId}`);
  };

  const { data } = useQuery({
    queryKey: ['generated-my-problems'],
    queryFn: () =>
      getGeneratedMyProblems({
        auth: accessToken ? accessToken : '',
      }),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          생성된 문제 목록
        </h2>
        <p className="text-gray-600">
          AI가 생성한 문제들을 확인하고 관리하세요
        </p>
      </div>

      {/* 통계 카드 */}
      {/* <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-2 text-3xl font-bold text-purple-600">
              {data.length}
            </div>
            <div className="text-sm text-gray-600">총 생성된 문제</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">
              {generatedProblems.filter((p) => p.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">완료된 문제</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-2 text-3xl font-bold text-blue-600">5</div>
            <div className="text-sm text-gray-600">이번 주 생성</div>
          </CardContent>
        </Card>
      </div> */}

      {/* 문제 목록 */}
      <div className="space-y-4">
        {data &&
          data.map((problem: GeneratedMyProblemResponse) => (
            <Card
              key={problem.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {problem.title}
                      </h3>
                      <div className="mt-1 flex items-center space-x-3">
                        {/* <Badge
                      // className={getDifficultyColor(problem.difficulty)}
                      >
                        {problem.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {problem.algorithm_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {problem.created_at}
                      </span> */}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProblemClick(problem.real_pid)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        풀어보기
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {/* {problem.tags.map((tag, index) => (
                  <Badge key={index} className="text-xs">
                    {tag}
                  </Badge>
                ))} */}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
