import { getSolvedDays } from '@/share/api/users.api';
import { Button } from '@/share/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { useAuthStore } from '@/share/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function LearningStatusCard() {
  const { accessToken } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: solvedDays, isLoading } = useQuery({
    queryKey: ['solved-days'],
    queryFn: () =>
      getSolvedDays({
        auth: accessToken ?? '',
      }),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

  if (!accessToken) {
    return (
      <div className="pt-2 text-center">
        <Button
          size="sm"
          variant="outline"
          className="border-gray-300 bg-transparent text-gray-700"
        >
          로그인하기
        </Button>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const today = new Date();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <Card className="border-gray-200 bg-gradient-to-br">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Star className="mr-2 h-4 w-5" />
          학습 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              ◀
            </button>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-800">
                {year}년 {month + 1}월
              </div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={index}
                className="py-2 text-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: 42 }, (_, i) => {
              const date = new Date(startDate);
              date.setDate(startDate.getDate() + i);
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === today.toDateString();

              const dateStr = formatDate(date);
              const isSolved = solvedDays.dates.includes(dateStr);

              return (
                <div
                  key={i}
                  className={`relative flex h-8 w-8 items-center justify-center rounded text-sm transition-colors ${
                    !isCurrentMonth
                      ? 'text-gray-300'
                      : isToday
                        ? 'bg-blue-100 font-semibold text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {date.getDate()}

                  {isSolved && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                        <svg
                          className="h-3.5 w-3.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {solvedDays.dates.length}개 해결
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
