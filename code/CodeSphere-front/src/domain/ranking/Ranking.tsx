'use client';

import {
  getMyRank,
  getRanking,
  GetRankingResponse,
  MyRankResponse,
} from '@/share/api/ranking.api';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/share/components/ui/Avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { useAuthStore } from '@/share/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Crown, Trophy } from 'lucide-react';

export default function Ranking() {
  const { accessToken } = useAuthStore();
  const { data: rankers } = useQuery<GetRankingResponse>({
    queryKey: ['ranking'],
    queryFn: () =>
      getRanking({
        skip: 0,
        limit: 10,
        auth: accessToken ? accessToken : '',
      }),
  });

  const { data: myRank } = useQuery<MyRankResponse>({
    queryKey: ['my-rank'],
    queryFn: () =>
      getMyRank({
        auth: accessToken ? accessToken : '',
      }),
    enabled: !!accessToken,
  });

  console.log('rankers', rankers, myRank);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 제목 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 flex items-center justify-center text-3xl font-bold text-gray-900">
            <Trophy className="mr-3 h-8 w-8 text-yellow-600" />
            랭킹
          </h1>
          <p className="text-gray-600">
            알고리즘 마스터들의 순위를 확인해보세요!
          </p>
        </div>

        {/* 내 순위 (상단 하이라이트) */}
        {accessToken && (
          <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Crown className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700">내 순위</p>
                    <p className="text-2xl font-bold text-blue-900">
                      #{myRank?.rank}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">점수</p>
                  <p className="text-xl font-bold text-blue-900">
                    {myRank?.total_score}점
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">해결 문제</p>
                  <p className="text-xl font-bold text-blue-900">
                    {myRank?.solved_count}개
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 랭킹 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">전체 랭킹</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankers?.ranks.length &&
                rankers.ranks.map((ranker) => (
                  <div
                    key={ranker.rank}
                    className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                      ranker.rank <= 3
                        ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
                        : 'bg-white'
                    } ${ranker.login_id === '나의닉네임' ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* 순위 */}
                      <div className="flex w-16 items-center space-x-2">
                        <span className="text-2xl">
                          {getRankIcon(ranker.rank) || `#${ranker.rank}`}
                        </span>
                      </div>

                      {/* 사용자 정보 */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={ranker.login_id || '/placeholder.svg'}
                          alt={ranker.login_id}
                        />
                        <AvatarFallback>{ranker.login_id[0]}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="mb-1 flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">
                            {ranker.login_id}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {ranker.solved_count}문제 해결
                        </p>
                      </div>
                    </div>

                    {/* 점수 */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {ranker.total_score}
                      </div>
                      <div className="text-sm text-gray-500">점</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
