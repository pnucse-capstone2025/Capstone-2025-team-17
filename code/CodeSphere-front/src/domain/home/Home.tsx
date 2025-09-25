'use client';

import { getRecommendProblems } from '@/share/api/problems.api';
import { Button } from '@/share/components/ui/Button';
import Text from '@/share/components/ui/Text';
import { useAuthStore } from '@/share/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProblemList } from '../../share/components/ProblemList';
import { Problem } from '../../share/type/problem';
import { AuthCard } from './components/AuthCard';
import LearningStatusCard from './components/LearningStatusCard';
import TopRankersCard from './components/TopRankersCard';

export default function Home() {
  const navigate = useNavigate();

  const [recommendedProblems, setRecommendedProblems] = useState<Problem[]>([]);
  const { accessToken } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['recommendProblems'],
    queryFn: () =>
      getRecommendProblems({ auth: accessToken ? accessToken : undefined }),
  });

  const moveToProblemBoard = () => {
    navigate(`/problems/board`);
  };

  useEffect(() => {
    setRecommendedProblems(data || []);
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 통계 및 광고 */}
          {/* <div className="space-y-6">
            <DailyStatsCard />
            <PremiumAdCard />
          </div> */}

          {/* 추천 문제 */}
          <div className="space-y-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <Text as="h1">오늘의 추천 문제</Text>
              <Button variant="outline" size="sm" onClick={moveToProblemBoard}>
                더 보기
              </Button>
            </div>

            <div className="grid gap-4">
              <ProblemList
                category="recommended"
                problemData={recommendedProblems}
              />
            </div>
          </div>

          {/* 로그인 및 랭킹 */}
          <div className="space-y-6">
            <AuthCard />
            <TopRankersCard />
            <LearningStatusCard />
          </div>
        </div>
      </div>
    </div>
  );
}
