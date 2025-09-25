import { Problem } from '../type/problem';
import ProblemSummary from './ProblemSummary';

import { Card, CardContent } from '@/share/components/ui/Card';

export function ProblemList({
  category,
  problemData,
}: {
  category: 'recommended' | 'popular';
  problemData: Problem[] | [];
}) {
  if (problemData.length === 0) {
    return <div className="text-center text-gray-500">문제가 없습니다.</div>;
  }

  return (
    <>
      {problemData.map((problem) => (
        <Card
          key={problem.real_pid}
          className={`cursor-pointer transition-shadow hover:shadow-md ${problem.user_result === 'PASS' ? 'bg-green-50/70' : 'bg-white'}`}
        >
          <CardContent className="p-6">
            <ProblemSummary problem={problem} category={category} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
