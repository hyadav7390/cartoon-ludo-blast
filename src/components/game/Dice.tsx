
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
      <div className="grid grid-cols-3 gap-2 p-4 h-full w-full">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-200',
              dots.includes(i) ? 'bg-gray-800 shadow-lg' : 'bg-transparent'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dice-container flex flex-col items-center space-y-6 bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-2xl border-4 border-gray-200">
      <div
        className={cn(
          'dice relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-4 border-gray-400 rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 flex items-center justify-center',
          isRolling && 'animate-spin pointer-events-none border-blue-500 shadow-blue-300',
          disabled && 'opacity-60 cursor-not-allowed',
          !disabled && !isRolling && 'hover:scale-110 hover:shadow-2xl hover:border-blue-500 transform-gpu'
        )}
        onClick={!disabled && !isRolling ? onRoll : undefined}
      >
        {isRolling ? (
          <div className="text-5xl animate-bounce">🎲</div>
        ) : value ? (
          renderDots()
        ) : (
          <div className="text-3xl text-gray-400 font-bold">?</div>
        )}
        
        {/* Enhanced dice shine effect */}
        <div className="absolute top-2 left-2 w-6 h-6 bg-white/60 rounded-full pointer-events-none shadow-sm"></div>
        <div className="absolute top-3 left-3 w-3 h-3 bg-white/40 rounded-full pointer-events-none"></div>
      </div>
      
      <button
        className={cn(
          'px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-200 shadow-lg border-2',
          disabled || isRolling 
            ? 'bg-gray-400 border-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95 transform-gpu'
        )}
        onClick={onRoll}
        disabled={disabled || isRolling}
      >
        {isRolling ? (
          <span className="flex items-center space-x-3">
            <span className="animate-spin text-2xl">🎲</span>
            <span>Rolling...</span>
          </span>
        ) : (
          <span className="flex items-center space-x-2">
            <span>🎲</span>
            <span>Roll Dice</span>
          </span>
        )}
      </button>
      
      {value && !isRolling && (
        <div className="text-center bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-4 border-2 border-yellow-300 shadow-md">
          <div className="text-4xl font-bold text-gray-800 mb-1">{value}</div>
          <div className="text-sm text-gray-600 font-medium">
            {value === 6 ? '🎉 Extra Turn!' : 'Good Roll!'}
          </div>
        </div>
      )}
    </div>
  );
};
