import MyProblems from '@/domain/myProblems/MyProblems';
import { FC } from 'react';

export interface RouteType {
  path: string;
  component: FC;
}

export const myProblemsRoutes: RouteType[] = [
  {
    path: '/my-problems',
    component: MyProblems,
  },
];
