import ProblemCheckBox from '@/domain/problemBoard/components/ProblemCheckBox';
import { TAG_LABELS } from '@/domain/problemBoard/mock/tagLables';
import { Button } from '@/share/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/share/components/ui/Select';
import {
  ALL_PROBLEM_TAGS,
  ProblemDifficulty,
  ProblemTagKey,
  SolvedStatus,
} from '@/share/type/problemSort';
import { Filter } from 'lucide-react';
import { memo } from 'react';

interface ProblemFilterCardProps {
  setSearchQuery: (query: string) => void;

  selectedDifficulty: ProblemDifficulty | null;
  setSelectedDifficulty: (difficulty: ProblemDifficulty | null) => void;

  selectedStatus: SolvedStatus | null;
  setSelectedStatus: (status: SolvedStatus | null) => void;

  selectedTags: ProblemTagKey[];
  setSelectedTags: (tags: ProblemTagKey[]) => void;
  handleTagToggle: (tag: ProblemTagKey) => void;
}

export default memo(function ProblemFilterCard({
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedStatus,
  setSelectedStatus,
  selectedTags,
  setSelectedTags,
  handleTagToggle,
}: ProblemFilterCardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            필터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 난이도 필터 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              난이도
            </label>
            <Select
              value={selectedDifficulty || ''}
              onValueChange={(val) =>
                setSelectedDifficulty(val as ProblemDifficulty | null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="난이도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="쉬움">쉬움</SelectItem>
                <SelectItem value="보통">보통</SelectItem>
                <SelectItem value="어려움">어려움</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 해결 상태 필터 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              해결 상태
            </label>
            <Select
              value={selectedStatus || ''}
              onValueChange={(val) =>
                setSelectedStatus(val as SolvedStatus | null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="solved">해결됨</SelectItem>
                <SelectItem value="unsolved">미시도</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 태그 필터 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              태그
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {ALL_PROBLEM_TAGS.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <ProblemCheckBox
                    tag={tag}
                    label={TAG_LABELS[tag]}
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 초기화 버튼 */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setSelectedDifficulty(null);
              setSelectedStatus(null);
              setSelectedTags([]);
              setSearchQuery('');
            }}
          >
            필터 초기화
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});
