import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'soul_countdown_end_time';

export const useCountdown = (initialCount: number = 60) => {
  const [count, setCount] = useState(() => {
    const storedEndTime = sessionStorage.getItem(STORAGE_KEY);
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const remaining = Math.ceil((endTime - now) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });
  const [isCounting, setIsCounting] = useState(() => {
    const storedEndTime = sessionStorage.getItem(STORAGE_KEY);
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const remaining = Math.ceil((endTime - now) / 1000);
      return remaining > 0;
    }
    return false;
  });
  const timerRef = useRef<number | null>(null);

  const calculateRemaining = useCallback((endTime: number) => {
    const now = Date.now();
    const remaining = Math.ceil((endTime - now) / 1000);
    return remaining > 0 ? remaining : 0;
  }, []);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCounting(false);
    setCount(0);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const start = useCallback(() => {
    const endTime = Date.now() + initialCount * 1000;
    sessionStorage.setItem(STORAGE_KEY, endTime.toString());
    setCount(initialCount);
    setIsCounting(true);
  }, [initialCount]);


  useEffect(() => {
    if (isCounting) {
      timerRef.current = window.setInterval(() => {
        const storedEndTime = sessionStorage.getItem(STORAGE_KEY);
        if (storedEndTime) {
          const remaining = calculateRemaining(parseInt(storedEndTime, 10));
          if (remaining <= 0) {
            stopCountdown();
          } else {
            setCount(remaining);
          }
        } else {
          stopCountdown();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isCounting, calculateRemaining, stopCountdown]);

  return {
    count,
    isCounting,
    start,
  };
};
