import { useAutoSave } from '@/domain/solveProblem/hook/useAutoSave';
import { formatConsoleResult } from '@/domain/solveProblem/utils/formatConsoleResult';
import { getProblemDetail } from '@/share/api/problems.api';
import {
  getSubmissionsLoad,
  postSubmissions,
  postSubmissionsTest,
  SubmissionResult,
} from '@/share/api/submissions.api';
import { Badge } from '@/share/components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { ScrollArea } from '@/share/components/ui/Scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/share/components/ui/Tabs';
import { useAuthStore } from '@/share/store/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProblemDetail } from '../../share/type/problem';
import CodeEditor from './components/CodeEditor';
import HintDialog from './components/HintDialog';
import NotFoundPage from './components/NotFountPage';
import ProblemViewer from './components/ProblemViewer';
import SolveToolbar from './components/SolveToolbar';
import TestResultDialog from './components/TestResultDialog';
import { EmptyCode, InitCode } from './constants/initCode';
import { useContainerWidth } from '@/domain/solveProblem/hook/useContainerWidth';

interface TotalSubmissionResult extends SubmissionResult {}
type TabState = 'editor' | 'console';

export default function SolveProblem() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [showConsole, setShowConsole] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<TotalSubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemDetail, setProblemDetail] = useState<ProblemDetail | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabState>('editor');
  const [initCode, setInitCode] = useState('');

  const { ref, isCompact } = useContainerWidth(700);

  const { problemId } = useParams();
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['problemDetail', problemId],
    queryFn: () => getProblemDetail({ id: problemId ?? '' }),
  });

  const { mutate: postSubmission } = useMutation({
    mutationKey: ['problemDetail', problemId],
    mutationFn: () =>
      postSubmissions({
        real_pid: problemDetail?.real_pid || '',
        language: 'python',
        code,
        auth: accessToken ? accessToken : '',
      }),
    onSuccess: (data) => {
      setSubmissionResult(data);
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabState);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleRunCode = async () => {
    setShowConsole(true);
    setActiveTab('console');
    setConsoleOutput('코드 실행 중...!');
    const response = await postSubmissionsTest({
      real_pid: problemDetail?.real_pid || '',
      language: 'python',
      code,
      auth: accessToken ? accessToken : '',
    });

    setConsoleOutput(formatConsoleResult(response));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowResult(false);

    postSubmission();
    setIsSubmitting(false);
    setShowResult(true);
  };

  const handleOpenHintModal = async () => {
    setShowHint(true);
  };

  useAutoSave({
    code,
    real_pid: problemId || '',
    language: 'python',
    accessToken: accessToken || '',
  });

  useEffect(() => {
    if (data) {
      setProblemDetail(data);
    }
  }, [data]);

  useEffect(() => {
    if (!accessToken && problemId) {
      setInitCode(InitCode(problemId));
      setCode(InitCode(problemId));
      return;
    }

    const getPreviousCode = async () => {
      if (problemId) {
        const { code, hint_count } = await getSubmissionsLoad({
          real_pid: problemId,
          auth: accessToken || '',
        });
        const prevCode = code || InitCode(problemId);
        setHintCount(hint_count);
        setInitCode(() => prevCode);
        setCode(() => prevCode);
      }
    };

    getPreviousCode();
  }, [problemId, accessToken]);

  return (
    <div className="flex h-screen" ref={ref}>
      <div
        className={`flex ${isCompact ? 'flex-4 flex-col' : 'flex-1 flex-row'} border`}
      >
        {/* 문제 영역 */}
        <div className="w-full border-r bg-gray-50 p-4">
          <ScrollArea className="h-full">
            {problemDetail ? (
              <ProblemViewer problemDetail={problemDetail} />
            ) : (
              <NotFoundPage />
            )}
          </ScrollArea>
        </div>

        {/* 오른쪽 코드 영역 */}
        <div className="flex w-full flex-col">
          {/* 상단 도구 모음 */}
          <SolveToolbar
            language={language}
            setLanguage={setLanguage}
            onRun={handleRunCode}
            openHintModal={handleOpenHintModal}
            onSubmit={handleSubmit}
            hintCount={hintCount}
            isSubmitting={isSubmitting}
          />

          {/* 코드 에디터와 콘솔 */}
          <div className="flex flex-1 flex-col">
            <Tabs
              defaultValue="editor"
              value={activeTab}
              className="flex flex-1 flex-col"
              onValueChange={handleTabChange}
            >
              <TabsList className="mx-4 mt-2 w-fit">
                <TabsTrigger value="editor">코드 에디터</TabsTrigger>
                <TabsTrigger value="console">
                  콘솔
                  {showConsole && (
                    <Badge className="ml-2 h-4 w-4 bg-green-500 p-0" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="m-4 mt-2 flex-1">
                {isLoading ? (
                  <CodeEditor
                    key="emptyCode"
                    initialCode={EmptyCode}
                    readOnly
                  />
                ) : (
                  <CodeEditor
                    key="loadedCode"
                    initialCode={initCode}
                    onChange={handleCodeChange}
                  />
                )}
              </TabsContent>

              <TabsContent value="console" className="m-4 mt-2 flex-1">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">콘솔 출력</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-132 min-h-64 overflow-auto rounded bg-black p-4 font-mono text-sm whitespace-pre text-green-400">
                      {consoleOutput ||
                        '코드를 실행하면 결과가 여기에 표시됩니다.'}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* 힌트 모달 */}

      <HintDialog
        code={code}
        open={showHint}
        onOpenChange={setShowHint}
        setHintCount={setHintCount}
        real_pid={problemId ? problemId : '0'}
        hintCount={hintCount}
        maxHints={3}
        language={language}
      />

      {/* 제출 결과 모달 */}

      <TestResultDialog
        showResult={showResult}
        setShowResult={setShowResult}
        submissionResult={submissionResult}
      />
    </div>
  );
}
