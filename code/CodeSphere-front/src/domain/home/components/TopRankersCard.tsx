import { getRanking, GetRankingResponse } from '@/share/api/ranking.api';
import { Button } from '@/share/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { useAuthStore } from '@/share/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import TopRankersItem from './TopRankerItem';
import { useNavigate } from 'react-router-dom';

export default function TopRankersCard() {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const handleMoveToRankingPage = () => {
    navigate('/ranking');
  };
  const { data } = useQuery<GetRankingResponse>({
    queryKey: ['ranking'],
    queryFn: () =>
      getRanking({
        skip: 0,
        limit: 3,
        auth: accessToken ? accessToken : '',
      }),
  });
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
          이달의 랭커
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.ranks.length &&
          data.ranks.map((ranker) => <TopRankersItem ranker={ranker} />)}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleMoveToRankingPage}
        >
          전체 랭킹 보기
        </Button>
      </CardContent>
    </Card>
  );
}
