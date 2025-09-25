import { useCodeTimer } from '@/domain/solveProblem/hook/useCodeTimer';
import { Button } from '@/share/components/ui/Button';
import { Clock, RotateCcw, Square } from 'lucide-react';

export function CodeTimer({ isCompact }: { isCompact: boolean }) {
  const {
    hasStarted,
    isTimerRunning,
    timerSeconds,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  } = useCodeTimer();

  return (
    <div className="flex items-center justify-center lg:justify-end">
      {!hasStarted ? (
        <Button
          variant="outline"
          size="sm"
          onClick={startTimer}
          className="h-9 w-full border-green-200 bg-transparent text-green-600 hover:bg-green-50 sm:w-auto"
        >
          <Clock className="h-4 w-4" />
          {!isCompact && <div className="ml-2">Start Timer</div>}
        </Button>
      ) : (
        <div className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border bg-white px-2 sm:w-auto sm:gap-3 sm:px-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="font-mono text-sm font-bold text-gray-800">
              {formatTime(timerSeconds)}
            </span>
            {isTimerRunning ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            ) : (
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300"></div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isTimerRunning ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopTimer}
                className="h-7 border-red-200 bg-transparent px-2 text-xs text-red-600 hover:bg-red-50 sm:text-sm"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={startTimer}
                className="h-7 border-green-200 bg-transparent px-2 text-xs text-green-600 hover:bg-green-50 sm:text-sm"
              >
                <Clock className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetTimer}
              className="h-7 border-gray-200 bg-transparent px-2 text-xs text-gray-600 hover:bg-gray-50 sm:text-sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
