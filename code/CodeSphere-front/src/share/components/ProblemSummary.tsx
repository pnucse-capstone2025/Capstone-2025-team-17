import { Badge } from '@/share/components/ui/Badge';
import { Button } from '@/share/components/ui/Button';
import { Problem } from '@/share/type/problem';
import { CheckCircle, Target, Users, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLevelColor } from '../utils/getLevelColor';

export default function ProblemSummary({
  problem,
  category,
}: {
  problem: Problem;
  category: 'recommended' | 'popular';
}) {
  const navigate = useNavigate();
  const handleProblemClick = (problemId: string) => {
    navigate(`/problems/solve/${problemId}`);
  };

  return (
    <div
      className={`flex w-full flex-col justify-between`}
      onClick={() => handleProblemClick(problem.real_pid)}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 flex gap-4 text-lg font-semibold text-gray-900">
            <p>{problem.title}</p>

            <div className="flex items-center space-x-2">
              {/* {getStatusIcon(problem.status)} */}
              {problem.user_result === 'PASS' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                problem.user_result === 'FAIL' && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )
              )}
              <span className="font-mono text-sm text-gray-500">
                #{problem.real_pid}
              </span>
            </div>
          </h3>

          <div className="mb-3 flex items-center space-x-3">
            {/* <span
              className={`text-sm font-medium ${getSuccessRateColor(problem.successRate)}`}
            >
              정답률 {problem.successRate}%
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              {problem.estimatedTime}
            </div> */}
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {problem.tag.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between text-sm text-gray-500 ${category === 'popular' && 'gap-4'}`}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <Users className="mr-1 h-4 w-4 text-green-600" />
            <span className="mr-2">제출 횟수 : </span>
            {problem.submit_count.toLocaleString()}
          </div>
          <div className="flex items-center text-gray-600">
            <Target className="mr-1 h-4 w-4 text-blue-600" />
            <span className="mr-2">정답률 : </span>
            {(problem.correct_rate * 100).toFixed(2)}%
          </div>
          <Badge className={getLevelColor(problem.level)}>
            Lv. {problem.level}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // 북마크 토글 로직
            }}
          >
            {'bookmarked' in problem && problem.bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Bookmark className="h-4 w-4 text-gray-400" />
            )}
          </Button> */}
          <Button
            size="sm"
            onClick={() => handleProblemClick(problem.real_pid)}
          >
            문제 풀기
          </Button>
        </div>
      </div>
    </div>
  );
}
