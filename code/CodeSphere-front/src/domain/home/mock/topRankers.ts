export interface RankerUser {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  solvedProblems: number;
  badge: string;
}

export const topRankers: RankerUser[] = [
  {
    rank: 1,
    name: '알고마스터',
    avatar: '/placeholder.svg?height=40&width=40',
    score: 2847,
    solvedProblems: 156,
    badge: '🏆',
  },
  {
    rank: 2,
    name: '코딩천재',
    avatar: '/placeholder.svg?height=40&width=40',
    score: 2634,
    solvedProblems: 142,
    badge: '🥈',
  },
  {
    rank: 3,
    name: '문제해결사',
    avatar: '/placeholder.svg?height=40&width=40',
    score: 2521,
    solvedProblems: 138,
    badge: '🥉',
  },
];
