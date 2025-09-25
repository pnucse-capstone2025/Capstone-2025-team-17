import { Badge } from '@/share/components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { Separator } from '@/share/components/ui/Separator';
// import { problemDetail } from '../mock/problemViewer.mock';
// import { getDifficultyColor } from '@/domain/common/utils/getLevelColor';
import ProblemDescription from './ProblemDescription';
import ProblemExamples from './ProblemExamples';
import { getLevelColor } from '@/share/utils/getLevelColor';
import { ProblemDetail } from '@/share/type/problem';

interface ProblemViewerProps {
  problemDetail: ProblemDetail;
}

export default function ProblemViewer({ problemDetail }: ProblemViewerProps) {
  return (
    <Card className="min-h-[700px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{problemDetail.title}</CardTitle>
          <Badge className={getLevelColor(problemDetail.level)}>
            LV. {problemDetail.level}
          </Badge>
        </div>
        <div className="flex gap-2">
          {problemDetail.tag.map((item, index) => (
            <Badge key={index} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <ProblemDescription label="문제" description={problemDetail.body} />
        <br /> <Separator />
        <ProblemDescription label="입력" description={problemDetail.input} />
        <ProblemDescription label="출력" description={problemDetail.output} />
        <Separator />
        <div>
          <h3 className="mb-2 font-semibold">예제</h3>
          {problemDetail.example_io.map((example, index) => (
            <ProblemExamples index={index} example={example} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
