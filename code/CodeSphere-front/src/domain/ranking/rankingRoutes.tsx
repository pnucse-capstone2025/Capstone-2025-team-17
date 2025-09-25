import Ranking from '@/domain/ranking/Ranking';
import { RouteType } from '../home/homeRoutes';

export const rankingRoutes: RouteType[] = [
  {
    path: '/ranking',
    component: Ranking,
  },
];
