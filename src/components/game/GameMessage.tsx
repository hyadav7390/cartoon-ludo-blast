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
        return 'bg-gradient-to-br from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30';
      case 'warning':
        return 'bg-gradient-to-br from-[hsl(var(--warning))]/20 to-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30';
      case 'error':
        return 'bg-gradient-to-br from-[hsl(var(--destructive))]/20 to-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30';
      default:
        return 'bg-gradient-to-br from-[hsl(var(--accent))]/20 to-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/30';
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
      'game-card border-2 text-center rounded-lg p-3 shadow-md',
      getMessageStyle()
    )}>
      <div className="flex items-center justify-center space-x-2">
        <span className="text-lg">{getIcon()}</span>
        <p className="font-semibold text-sm">{message}</p>
      </div>
    </div>
  );
};