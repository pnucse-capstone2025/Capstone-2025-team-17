import Roadmap from '@/domain/roadmap/Roadmap';
import { RouteType } from '../home/homeRoutes';

export const roadmapRoutes: RouteType[] = [
  {
    path: '/roadmap',
    component: Roadmap,
  },
];
