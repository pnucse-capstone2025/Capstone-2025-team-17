import { solvedProblems } from '@/domain/myProblems/mocks/solvedProblems';
import { AlertCircle, CheckCircle } from 'lucide-react';

// const [selectedFilter, setSelectedFilter] = useState('all');
// const [selectedDifficulty, setSelectedDifficulty] = useState('all');

const stats = {
  totalSolved: solvedProblems.filter((p) => p.status === 'solved').length,
  totalAttempted: solvedProblems.filter((p) => p.status === 'attempted').length,
  averageScore: Math.round(
    solvedProblems.reduce((sum, p) => sum + p.score, 0) / solvedProblems.length,
  ),
  favoriteLanguage: 'Python',
  totalScore: solvedProblems.reduce((sum, p) => sum + p.score, 0),
  streak: 5,
};

const difficultyStats = {
  쉬움: solvedProblems.filter(
    (p) => p.difficulty === '쉬움' && p.status === 'solved',
  ).length,
  보통: solvedProblems.filter(
    (p) => p.difficulty === '보통' && p.status === 'solved',
  ).length,
  어려움: solvedProblems.filter(
    (p) => p.difficulty === '어려움' && p.status === 'solved',
  ).length,
};

// const filteredProblems = solvedProblems.filter((problem) => {
//   const matchesFilter =
//     selectedFilter === 'all' || problem.status === selectedFilter;
//   const matchesDifficulty =
//     selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
//   const matchesSearch =
//     problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     problem.tags.some((tag) =>
//       tag.toLowerCase().includes(searchQuery.toLowerCase()),
//     );

//   return matchesFilter && matchesDifficulty && matchesSearch;
// });

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case '쉬움':
      return 'bg-green-100 text-green-800';
    case '보통':
      return 'bg-yellow-100 text-yellow-800';
    case '어려움':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  return status === 'solved' ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : (
    <AlertCircle className="h-4 w-4 text-yellow-600" />
  );
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const myProblemsUtils = {
  stats,
  difficultyStats,
  getDifficultyColor,
  getStatusIcon,
  getScoreColor,
};

// 이후 수정 및 확장 필요
