import { useEffect, useRef, useState } from 'react';

export function useContainerWidth(threshold: number = 300) {
  const ref = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setIsCompact(entry.contentRect.width < threshold);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, ref.current]);

  return { ref, isCompact };
}
