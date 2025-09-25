import { useEffect, useRef, useState } from 'react';

export function useCodeTimer() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setHasStarted(true);

      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimerSeconds(0);
    setHasStarted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    hasStarted,
    isTimerRunning,
    timerSeconds,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
}
