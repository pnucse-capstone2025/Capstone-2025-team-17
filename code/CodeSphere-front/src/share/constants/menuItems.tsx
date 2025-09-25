import { BookOpen, Trophy } from 'lucide-react';
import { JSX } from 'react';

export type menuNameType =
  | '홈'
  | '모든 문제'
  | '랭킹'
  | '학습로드맵'
  | '해결한 문제'
  | '문제생성';

export interface menuItemsType {
  name: menuNameType;
  to: string;
  icon?: JSX.Element | null;
}

export const menuItems: menuItemsType[] = [
  { name: '홈', to: '/', icon: null },
  {
    name: '모든 문제',
    to: '/problems/board',
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
  { name: '랭킹', to: '/ranking', icon: <Trophy className="mr-2 h-4 w-4" /> },
  // {
  //   name: '학습로드맵',
  //   to: '/roadmap',
  //   icon: <Target className="mr-2 h-4 w-4" />,
  // },
  {
    name: '해결한 문제',
    to: '/my-problems',
    icon: <BookOpen className="mr-2 h-4 w-4" />,
  },
  {
    name: '문제생성',
    to: '/create-problem',
    icon: <Trophy className="mr-2 h-4 w-4" />,
  },
];
