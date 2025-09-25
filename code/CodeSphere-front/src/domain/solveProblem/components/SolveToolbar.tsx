import { CodeTimer } from '@/domain/solveProblem/components/CodeTimer';
import { Button } from '@/share/components/ui/Button';
import { useAuthStore } from '@/share/store/authStore';
import { Lightbulb, Play, Send } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useContainerWidth } from '@/domain/solveProblem/hook/useContainerWidth';

export default function SolveToolbar({
  language,
  setLanguage,
  onRun,
  openHintModal,
  onSubmit,
  isSubmitting,
}: {
  language: string;
  setLanguage: (lang: string) => void;
  onRun: () => void;
  openHintModal: () => void;
  onSubmit: () => void;
  hintCount: number;
  isSubmitting: boolean;
}) {
  const { user } = useAuthStore();
  const { ref, isCompact } = useContainerWidth(560);

  return (
    <div ref={ref} className="border-b bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LanguageSelector language={language} setLanguage={setLanguage} />

          {user && (
            <Button variant="outline" size="sm" onClick={onRun}>
              <Play className="h-4 w-4" />
              {!isCompact && <div className="ml-2">실행</div>}
            </Button>
          )}
          <CodeTimer isCompact={isCompact} />
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openHintModal}>
              <Lightbulb className="h-4 w-4" />
              {!isCompact && <div className="ml-2">힌트보기</div>}
            </Button>

            <Button onClick={onSubmit} disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              {!isCompact && (
                <div className="ml-2">
                  {isSubmitting ? '제출 중...' : '제출'}
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
