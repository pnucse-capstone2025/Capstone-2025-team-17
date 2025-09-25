import { getMyHint, postHint } from '@/share/api/hints.api';
import { Button } from '@/share/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/share/components/ui/Dialog';
import { useAuthStore } from '@/share/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/a11y-dark.css';
import { formatDate } from '@/domain/solveProblem/utils/formatDate';

export interface HintType {
  real_pid: number;
  content: string;
  created_at: string;
}

export default function HintDialog({
  open,
  onOpenChange,
  hintCount,
  setHintCount,
  maxHints,
  real_pid,
  code,
  language,
}: {
  code: string;
  real_pid: string;
  open: boolean;
  setHintCount: (count: number) => void;
  onOpenChange: (show: boolean) => void;
  hintCount: number;
  maxHints: number;
  language: string;
}) {
  const onGetHint = () => {
    if (hintCount < maxHints) {
      setHintCount(hintCount + 1);
      postHints({
        real_pid,
        user_code: code,
        language,
        auth: accessToken ? accessToken : '',
      });
    }
  };
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { mutate: postHints, isPending } = useMutation({
    mutationFn: (params: {
      real_pid: string;
      user_code: string;
      language: string;
      auth: string;
    }) =>
      postHint({
        real_pid: params.real_pid,
        user_code: params.user_code,
        language: params.language,
        auth: params.auth,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hints', real_pid] });
    },
  });

  const {
    data: hints,
    refetch: getHints,
    isLoading,
  } = useQuery<HintType[]>({
    queryKey: ['hints', real_pid],
    queryFn: () =>
      getMyHint({
        real_pid,
        auth: accessToken ? accessToken : '',
      }),
  });

  useEffect(() => {
    if (open) {
      getHints();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>
            힌트 {hintCount}/{maxHints}
          </DialogTitle>
        </DialogHeader>

        {isLoading && <p>힌트를 불러오는 중...</p>}
        <div className="py-4">
          {hints &&
            hints.map((hint) => {
              return (
                <div
                  key={hint.real_pid}
                  className="mb-8 flex flex-col gap-4 leading-normal whitespace-pre-line"
                >
                  <p className="text-md font-bold text-blue-500">
                    [ {hint.content.split('\n')[0].replace(/^###\s*/, '')} ]
                  </p>
                  <div className="max-w-[460px] text-sm text-gray-700">
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                      {hint.content.split('\n').slice(1).join('\n')}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(hint.created_at)}
                  </p>
                  <hr />
                </div>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onGetHint}
          disabled={hintCount >= 3 || isPending || isLoading}
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          {isPending
            ? '힌트를 가져오는 중..'
            : `힌트 사용하기(${hintCount} / 3)`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
