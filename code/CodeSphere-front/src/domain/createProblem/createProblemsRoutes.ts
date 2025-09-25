import CreateProblem from '@/domain/createProblem/CreateProblem';
import { FC } from 'react';

export interface RouteType {
  path: string;
  component: FC;
}

export const createProblemsRoutes: RouteType[] = [
  {
    path: '/create-problem',
    component: CreateProblem,
  },
];
