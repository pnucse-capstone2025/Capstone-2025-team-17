import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { TrendingUp } from 'lucide-react';
import { DailyStatsItem } from './DailyStatsItem';

const ACTIVE_USERS = 1234;
const SUBMITTED_SOLUTIONS = 5678;
const NEW_PROBLEMS = 12;

export function DailyStatsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
          오늘의 통계
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DailyStatsItem
          label="활성 사용자"
          value={`${ACTIVE_USERS.toLocaleString()}명`}
          color="blue"
        />
        <DailyStatsItem
          label="제출된 풀이"
          value={`${SUBMITTED_SOLUTIONS.toLocaleString()}개`}
          color="green"
        />
        <DailyStatsItem
          label="새로운 문제"
          value={`${NEW_PROBLEMS}개`}
          color="purple"
        />
      </CardContent>
    </Card>
  );
}
