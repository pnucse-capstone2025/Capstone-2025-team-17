import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/share/components/ui/Avatar';
import { RankingType } from '@/share/api/ranking.api';

export default function TopRankersItem({ ranker }: { ranker: RankingType }) {
  return (
    <div
      key={ranker.rank}
      className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
    >
      <div className="text-2xl">{ranker.rank}</div>
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={ranker.login_id || '/placeholder.svg'}
          alt={ranker.login_id}
        />
        <AvatarFallback>{ranker.login_id[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {ranker.login_id}
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{ranker.total_score}점</span>
          <span>•</span>
          <span>{ranker.solved_count}문제</span>
        </div>
      </div>
    </div>
  );
}
