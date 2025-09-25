'use client';

import { getProblemListNew } from '@/share/api/problems.api';
import { useAuthStore } from '@/share/store/authStore';
import {
  ProblemDifficulty,
  ProblemSortBy,
  ProblemTagKey,
  SolvedStatus,
} from '@/share/type/problemSort';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ProblemList } from '../../share/components/ProblemList';
import Pagination from './components/Pagination';
import ProblemFilterCard from './components/ProblemFilterCard';
import { ProblemSearchSortBar } from './components/ProblemSearchSortBar';

const itemsPerPage = 10;

export default function ProblemsBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<ProblemDifficulty | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SolvedStatus | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<ProblemSortBy>('real_pid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<ProblemTagKey[]>([]);

  const { accessToken } = useAuthStore();

  // const { data: problemList } = useQuery({
  //   queryKey: ['problems', { page: currentPage }],
  //   queryFn: () =>
  //     getProblems({
  //       limit: itemsPerPage,
  //       page: currentPage,
  //       auth: accessToken ?? '',
  //     }),
  // });

  const { data: filteredProblemList, isLoading } = useQuery({
    queryKey: [
      'problems',
      {
        page: currentPage,
        searchQuery,
        selectedDifficulty,
        selectedStatus,
        selectedTags,
        sortBy,
      },
    ],
    queryFn: () =>
      getProblemListNew({
        search: searchQuery || null,
        difficulty: selectedDifficulty,
        tags: selectedTags.length > 0 ? selectedTags[0] : null,
        solved_status: selectedStatus,
        sort_by: sortBy,
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        auth: accessToken || undefined,
      }),
  });

  const totalPages = Math.ceil(
    (filteredProblemList?.total || 0) / itemsPerPage,
  );

  const handleTagToggle = (tag: ProblemTagKey) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 제목 및 통계 */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">전체 문제</h1>
          <div className="space--6 flex items-center text-sm text-gray-600">
            {/* <span>총 {problemList?.total ?? 0}개 문제</span>
            <span>•</span>
            <span>검색 결과: {filteredProblemList?.total ?? 0}개</span> */}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 왼쪽 필터 사이드바 */}
          <ProblemFilterCard
            setSearchQuery={setSearchQuery}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            handleTagToggle={handleTagToggle}
          />

          {/* 메인 콘텐츠 */}
          <div className="space-y-6 lg:col-span-3">
            {/* 검색 및 정렬 */}
            <ProblemSearchSortBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* 문제 리스트 */}
            {isLoading && <p>문제를 불러오는 중...</p>}
            {filteredProblemList?.data &&
              filteredProblemList.data.length === 0 && (
                <p>조건에 맞는 문제가 없습니다.</p>
              )}
            {!isLoading && filteredProblemList?.data && (
              <div className="space-y-3">
                <ProblemList
                  category="popular"
                  problemData={filteredProblemList?.data ?? []}
                />
              </div>
            )}

            {/* 페이지네이션 */}
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
