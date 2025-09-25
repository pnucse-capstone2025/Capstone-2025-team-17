import { useMemo } from 'react';
import { userProblems } from '../mock/userProblems.mock';

const difficultyOrder: Record<'쉬움' | '보통' | '어려움', number> = {
  쉬움: 1,
  보통: 2,
  어려움: 3,
};
type Difficulty = keyof typeof difficultyOrder;

export function useFilteredProblems({
  // userProblems,
  searchQuery,
  selectedDifficulty,
  selectedCategory,
  selectedStatus,
  selectedTags,
  sortBy,
  sortOrder,
}: {
  // userProblems: UserProblem[];
  searchQuery: string;
  selectedDifficulty: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedTags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  return useMemo(() => {
    const filtered = userProblems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        problem.difficulty === selectedDifficulty;
      const matchesCategory =
        selectedCategory === 'all' || problem.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'all' || problem.status === selectedStatus;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => problem.tags.includes(tag));

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory &&
        matchesStatus &&
        matchesTags
      );
    });

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'difficulty':
          aValue = difficultyOrder[a.difficulty as Difficulty];
          bValue = difficultyOrder[b.difficulty as Difficulty];
          break;
        case 'successRate':
          aValue = a.successRate;
          bValue = b.successRate;
          break;
        case 'submissions':
          aValue = a.submissions;
          bValue = b.submissions;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    searchQuery,
    selectedDifficulty,
    selectedCategory,
    selectedStatus,
    selectedTags,
    sortBy,
    sortOrder,
  ]);
}
