import ProblemsBoard from '@/domain/problemBoard/ProblemsBoard';
import SolveProblem from '../solveProblem/SolveProblem';
import { RouteType } from '../home/homeRoutes';

export const problemRoutes: RouteType[] = [
  {
    path: '/problems/board',
    component: ProblemsBoard,
  },
  {
    path: '/problems/solve/:problemId',
    component: SolveProblem,
  },
];
