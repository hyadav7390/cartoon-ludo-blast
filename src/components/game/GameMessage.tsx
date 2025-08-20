import React from 'react';
import { cn } from '@/lib/utils';

interface GameMessageProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const GameMessage: React.FC<GameMessageProps> = ({ message, type = 'info' }) => {
  const getMessageStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={cn(
      'game-card border-2 text-center animate-fade-in-scale',
      getMessageStyle()
    )}>
      <div className="flex items-center justify-center space-x-2">
        <span className="text-lg">{getIcon()}</span>
        <p className="font-semibold text-shadow">{message}</p>
      </div>
    </div>
  );
};