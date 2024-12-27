import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
}

export function Notification({ type, message }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-400" />,
    },
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${styles.bg} ${styles.text} p-4 rounded-md shadow-lg max-w-md`}>
      <div className="flex items-center">
        {styles.icon}
        <span className="ml-2">{message}</span>
      </div>
    </div>
  );
}