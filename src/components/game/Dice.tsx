
import React from 'react';
import { cn } from '@/lib/utils';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, disabled }) => {
  const getDiceFace = (num: number | null) => {
    if (!num) return '?';
    
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[num - 1] || '?';
  };

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
      <div className="grid grid-cols-3 gap-1 p-3 h-full w-full">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-200',
              dots.includes(i) ? 'bg-gray-800 shadow-sm' : 'bg-transparent'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dice-container flex flex-col items-center space-y-4">
      <div
        className={cn(
          'dice relative w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-gray-300 rounded-xl shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center',
          isRolling && 'animate-spin pointer-events-none border-blue-400',
          disabled && 'opacity-60 cursor-not-allowed',
          !disabled && !isRolling && 'hover:scale-105 hover:shadow-xl hover:border-blue-400'
        )}
        onClick={!disabled && !isRolling ? onRoll : undefined}
      >
        {isRolling ? (
          <div className="text-4xl animate-bounce">🎲</div>
        ) : value ? (
          renderDots()
        ) : (
          <div className="text-2xl text-gray-400">?</div>
        )}
        
        {/* Dice shine effect */}
        <div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full pointer-events-none"></div>
      </div>
      
      <button
        className={cn(
          'px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 shadow-md',
          disabled || isRolling 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg active:scale-95'
        )}
        onClick={onRoll}
        disabled={disabled || isRolling}
      >
        {isRolling ? (
          <span className="flex items-center space-x-2">
            <span className="animate-spin">🎲</span>
            <span>Rolling...</span>
          </span>
        ) : (
          'Roll Dice'
        )}
      </button>
      
      {value && !isRolling && (
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-700">{value}</div>
        </div>
      )}
    </div>
  );
};
