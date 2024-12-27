import React, { useEffect, useState } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  targetDate: Date;
  onComplete: () => void;
}

export function Timer({ targetDate, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(interval);
        onComplete();
        return;
      }

      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  return (
    <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-md">
      <TimerIcon className="w-4 h-4" />
      <span className="font-mono">{timeLeft}</span>
    </div>
  );
}