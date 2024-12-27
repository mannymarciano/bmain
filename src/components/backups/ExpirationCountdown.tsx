import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ExpirationCountdownProps {
  expiresAt: string;
}

export function ExpirationCountdown({ expiresAt }: ExpirationCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const expiration = new Date(expiresAt);
      if (expiration > new Date()) {
        setTimeLeft(`Expires in ${formatDistanceToNow(expiration)}`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className={timeLeft === 'Expired' ? 'text-red-500' : 'text-gray-500'}>
      {timeLeft}
    </span>
  );
}