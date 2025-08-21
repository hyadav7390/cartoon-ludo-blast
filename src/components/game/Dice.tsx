
import React from 'react';
import { cn } from '@/lib/utils';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, disabled }) => {
  const getDiceDots = (num: number | null) => {
    if (!num) return [];
    
    const dotPatterns: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    
    return dotPatterns[num] || [];
  };

  const renderDots = () => {
    const dots = getDiceDots(value);
    return (
      <div className="grid grid-cols-3 gap-0.5 p-2 h-full w-full">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200',
              dots.includes(i) ? 'bg-[hsl(var(--foreground))] shadow-sm' : 'bg-transparent'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dice-container flex flex-col items-center space-y-3">
      <div
        className={cn(
          'dice relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer transition-all duration-300 flex items-center justify-center',
          isRolling && 'animate-spin pointer-events-none',
          disabled && 'opacity-60 cursor-not-allowed',
          !disabled && !isRolling && 'hover:scale-105'
        )}
        onClick={!disabled && !isRolling ? onRoll : undefined}
      >
        {isRolling ? (
          <div className="text-3xl">🎲</div>
        ) : value ? (
          renderDots()
        ) : (
          <div className="text-xl text-muted-foreground font-bold">?</div>
        )}
      </div>
      
      <button
        className={cn(
          'px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 shadow-md border-2',
          disabled || isRolling 
            ? 'bg-muted text-muted-foreground border-border cursor-not-allowed' 
            : 'game-button'
        )}
        onClick={onRoll}
        disabled={disabled || isRolling}
      >
        {isRolling ? (
          <span className="flex items-center space-x-1">
            <span className="animate-spin text-sm">🎲</span>
            <span>Rolling...</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1">
            <span>🎲</span>
            <span>ROLL</span>
          </span>
        )}
      </button>
      
      {value && !isRolling && (
        <div className="text-center game-card">
          <div className="text-xl font-bold mb-1">{value}</div>
          <div className="text-xs text-muted-foreground font-medium">
            {value === 6 ? 'Extra Turn!' : 'Good Roll!'}
          </div>
        </div>
      )}
    </div>
  );
};
