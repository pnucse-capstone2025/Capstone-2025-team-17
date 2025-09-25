import Pagination from '@/domain/problemBoard/components/Pagination';
import { getFilteredMySubmissions } from '@/share/api/users.api';
import { MyProblemList } from '@/share/components/MyProblemList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/share/components/ui/Select';
import { useAuthStore } from '@/share/store/authStore';
import {
  SubmissionResultFilter,
  SubmissionResultFilterLabels,
} from '@/share/type/submissionResultFilter';
import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';
import { useEffect, useState } from 'react';

const itemsPerPage = 10;

export default function MyProblems() {
  const [currentPage, setCurrentPage] = useState(1);
  const [myProblems, setMyProblems] = useState([]);
  const [resultFilter, setResultFilter] = useState<
    SubmissionResultFilter | null | 'all'
  >(null);

  const { accessToken } = useAuthStore();

  // const { data } = useQuery({
  //   queryKey: ['my-problems', { page: currentPage }],
  //   queryFn: () =>
  //     getMySubmissions({
  //       auth: accessToken ? accessToken : '',
  //     }),
  // });

  const { data, isLoading } = useQuery({
    queryKey: ['my-problems', { page: currentPage, resultFilter }],
    queryFn: () =>
      getFilteredMySubmissions({
        result_filter: resultFilter,
        auth: accessToken ? accessToken : '',
      }),
  });

  const totalPages = Math.ceil(data?.total / itemsPerPage);

  useEffect(() => {
    setMyProblems(data || []);
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center text-3xl font-bold text-gray-900">
            <Award className="mr-3 h-8 w-8 text-blue-600" />
            내가 푼 문제
          </h1>
          <p className="text-gray-600">
            지금까지 도전한 문제들과 성과를 확인해보세요!
          </p>
        </div>

        <div className="space-y-6 lg:col-span-3">
          {/* 검색 및 정렬 */}

          {/* <ProblemSearchSortBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
          /> */}

          <div className="mb-4 flex justify-end">
            <Select
              value={resultFilter || 'PASS'}
              onValueChange={(val) =>
                setResultFilter(val as SubmissionResultFilter | null | 'all')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="결과 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {Object.entries(SubmissionResultFilterLabels).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 문제 리스트 */}
          {isLoading ? (
            <div>데이터를 불러오는 중입니다</div>
          ) : (
            <div className="space-y-3">
              <MyProblemList problemData={myProblems} />
            </div>
          )}
          {/* 페이지네이션 */}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  학습 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalSolved}
                  </div>
                  <div className="text-sm text-green-700">해결한 문제</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded bg-yellow-50 p-3 text-center">
                    <div className="text-xl font-bold text-yellow-600">
                      {stats.totalAttempted}
                    </div>
                    <div className="text-xs text-yellow-700">시도한 문제</div>
                  </div>
                  <div className="rounded bg-blue-50 p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {stats.streak}
                    </div>
                    <div className="text-xs text-blue-700">연속 해결</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>평균 점수</span>
                    <span className="font-semibold">
                      {stats.averageScore}점
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>총 점수</span>
                    <span className="font-semibold">{stats.totalScore}점</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>주 언어</span>
                    <span className="font-semibold">
                      {stats.favoriteLanguage}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">난이도별 해결</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>쉬움</span>
                    <span className="font-semibold text-green-600">
                      {difficultyStats.쉬움}개
                    </span>
                  </div>
                  <Progress
                    value={(difficultyStats.쉬움 / stats.totalSolved) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>보통</span>
                    <span className="font-semibold text-yellow-600">
                      {difficultyStats.보통}개
                    </span>
                  </div>
                  <Progress
                    value={(difficultyStats.보통 / stats.totalSolved) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>어려움</span>
                    <span className="font-semibold text-red-600">
                      {difficultyStats.어려움}개
                    </span>
                  </div>
                  <Progress
                    value={(difficultyStats.어려움 / stats.totalSolved) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="문제 제목이나 태그로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={selectedFilter}
                    onValueChange={setSelectedFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="solved">해결됨</SelectItem>
                      <SelectItem value="attempted">시도함</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDifficulty}
                    onValueChange={setSelectedDifficulty}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 난이도</SelectItem>
                      <SelectItem value="쉬움">쉬움</SelectItem>
                      <SelectItem value="보통">보통</SelectItem>
                      <SelectItem value="어려움">어려움</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">목록 보기</TabsTrigger>
                <TabsTrigger value="calendar">달력 보기</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {filteredProblems.map((problem) => (
                  <Card
                    key={problem.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(problem.status)}
                            <span className="font-mono text-sm text-gray-500">
                              #{problem.id}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-gray-900">
                              {problem.title}
                            </h3>
                            <div className="mt-1 flex items-center space-x-3">
                              <Badge
                                className={getDifficultyColor(
                                  problem.difficulty,
                                )}
                              >
                                {problem.difficulty}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {problem.language}
                              </span>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {problem.solvedAt}
                              </div>
                            </div>
                          </div>

                          <div className="hidden items-center space-x-6 text-sm md:flex">
                            <div className="text-center">
                              <div
                                className={`font-bold ${getScoreColor(problem.score)}`}
                              >
                                {problem.score}점
                              </div>
                              <div className="text-gray-500">점수</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold">
                                {problem.attempts}회
                              </div>
                              <div className="text-gray-500">시도</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold">
                                {problem.executionTime}
                              </div>
                              <div className="text-gray-500">실행시간</div>
                            </div>
                          </div>

                          <Button size="sm" variant="outline">
                            다시 풀기
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {problem.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      달력 보기
                    </h3>
                    <p className="text-gray-600">
                      문제 해결 기록을 달력 형태로 확인할 수 있는 기능이 곧
                      추가될 예정입니다.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div> */}
      </div>
    </div>
  );
}
