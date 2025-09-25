import { Badge } from '@/share/components/ui/Badge';
import { Button } from '@/share/components/ui/Button';
import { CheckCircle, XCircle, Clock, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MyProblem {
  submission_id: number;
  real_pid: string | number;
  result: 'PASS' | 'FAIL' | string;
  memory_kb: number;
  runtime_ms: number;
  language: string;
  created_at: string; // ISO
}

export default function MyProblemSummary({ problem }: { problem: MyProblem }) {
  const navigate = useNavigate();

  const pid = String(problem.real_pid);
  const isPass = problem.result === 'PASS';

  const handleProblemClick = (problemId: string) => {
    navigate(`/problems/solve/${problemId}`);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className="flex w-full cursor-pointer flex-col justify-between rounded-xl transition"
      onClick={() => handleProblemClick(pid)}
      role="button"
      aria-label={`문제 ${pid}로 이동`}
    >
      <div className="mb-4 flex items-center gap-3">
        {isPass ? (
          <CheckCircle className="h-5 w-5 text-green-600" aria-label="정답" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" aria-label="오답" />
        )}
        <span className="text-lg font-semibold text-gray-900">문제 #{pid}</span>
        <Badge variant="outline" className="px-2 py-0.5">
          {problem.result}
        </Badge>
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-700">
          <Badge
            variant="secondary"
            className="bg-red-50 font-medium text-red-700"
          >
            {problem.language?.toUpperCase()}
          </Badge>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            실행시간:
            <strong className="ml-1">{problem.runtime_ms}ms</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-4 w-4" />
            메모리:
            <strong className="ml-1">{problem.memory_kb}KB</strong>
          </span>
          <span className="text-gray-500">
            제출: {formatDate(problem.created_at)}
          </span>
        </div>

        <Button
          size="sm"
          className="bg-black text-white hover:bg-gray-800"
          onClick={(e) => {
            e.stopPropagation();
            handleProblemClick(pid);
          }}
        >
          문제 풀기
        </Button>
      </div>
    </div>
  );
}
