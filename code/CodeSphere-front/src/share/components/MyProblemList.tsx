import MyProblemSummary, {
  MyProblem,
} from '@/share/components/MyProblemSummary';

import { Card, CardContent } from '@/share/components/ui/Card';

export function MyProblemList({ problemData }: { problemData: MyProblem[] }) {
  if (problemData.length === 0) {
    return (
      <div className="text-center text-gray-500">풀이한 문제가 없습니다.</div>
    );
  }
  return (
    <>
      {problemData.map((problem) => (
        <Card
          key={problem.submission_id}
          className={`cursor-pointer transition-shadow hover:shadow-md ${problem.result === 'PASS' ? 'bg-green-50/70' : 'bg-red-50'}`}
        >
          <CardContent className="p-6">
            <MyProblemSummary problem={problem} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
