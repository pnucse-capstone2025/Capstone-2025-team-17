import { Card, CardContent } from '@/share/components/ui/Card';
import { Input } from '@/share/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/share/components/ui/Select';
import { ProblemSortBy } from '@/share/type/problemSort';
import { Search } from 'lucide-react';

/**
 * 
 *  <ProblemSearchSortBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
      />
  * 사용 방법 참고
 */

export function ProblemSearchSortBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sortBy: ProblemSortBy) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="문제 제목이나 태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">문제 번호순</SelectItem>
              <SelectItem value="title">제목순</SelectItem>
              <SelectItem value="difficulty">난이도순</SelectItem>
              <SelectItem value="successRate">정답률순</SelectItem>
              <SelectItem value="submissions">제출자순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
