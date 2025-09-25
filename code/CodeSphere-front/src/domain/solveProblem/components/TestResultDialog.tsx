import { SubmissionResult } from '@/share/api/submissions.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/share/components/ui/Dialog';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestResultDialog({
  showResult,
  setShowResult,
  submissionResult,
}: {
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  submissionResult: SubmissionResult | null;
}) {
  if (!submissionResult) {
    return (
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>제출 실패</DialogTitle>
          </DialogHeader>
          <div> 제출 결과를 가져오는데 실패했습니다. 다시 시도해주세요</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showResult} onOpenChange={setShowResult}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {submissionResult?.passed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            제출 결과
          </DialogTitle>
        </DialogHeader>

        {submissionResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {submissionResult.passed}/{submissionResult.total}
                </div>
                <div className="text-sm text-gray-600">통과한 테스트</div>
              </div>
              <div className="rounded bg-gray-50 p-4 text-center">
                <div className="text-sm text-gray-600">실행 시간</div>
                <div className="font-bold">{submissionResult.runtime_ms}ms</div>
                <div className="text-sm text-gray-600">메모리</div>
                <div className="font-bold">{submissionResult.memory_kb}</div>
              </div>
            </div>

            {/* <Separator />

            <div>
              <h3 className="mb-2 font-semibold">테스트 케이스 결과</h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {submissionResult.testCases.map((testCase, index) => (
                    <div key={index} className="rounded border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">테스트 {index + 1}</span>
                        {testCase.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-gray-600">입력</div>
                          <div className="rounded bg-gray-100 p-1 font-mono">
                            {testCase.input}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">예상 출력</div>
                          <div className="rounded bg-gray-100 p-1 font-mono">
                            {testCase.expectedOutput}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">실제 출력</div>
                          <div className="rounded bg-gray-100 p-1 font-mono">
                            {testCase.actualOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div> */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
