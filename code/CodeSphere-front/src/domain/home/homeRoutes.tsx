import Home from '@/domain/home/Home';
import { FC } from 'react';

export interface RouteType {
  path: string;
  component: FC;
}

export const homeRoutes: RouteType[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/home',
    component: Home,
  },
];
