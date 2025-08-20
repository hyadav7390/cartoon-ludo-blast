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
      <div className="grid grid-cols-3 gap-1 p-2 h-full">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              dots.includes(i) ? 'bg-foreground' : 'bg-transparent'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dice-container">
      <div className="flex flex-col items-center space-y-4">
        <div
          className={cn(
            'dice w-16 h-16 md:w-20 md:h-20 flex items-center justify-center cursor-pointer transition-all duration-300',
            isRolling && 'rolling pointer-events-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={!disabled && !isRolling ? onRoll : undefined}
        >
          {isRolling ? (
            <div className="animate-spin text-2xl">🎲</div>
          ) : (
            renderDots()
          )}
        </div>
        
        <button
          className={cn(
            'game-button text-primary-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={onRoll}
          disabled={disabled || isRolling}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>
    </div>
  );
};