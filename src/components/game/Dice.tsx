
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
      <div className="grid grid-cols-3 gap-1 p-2 h-full w-full">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-200',
              dots.includes(i) 
                ? 'bg-slate-800 w-2 h-2 sm:w-3 sm:h-3 shadow-inner' 
                : 'bg-transparent w-1 h-1'
            )}
            style={{
              boxShadow: dots.includes(i) ? 'inset 0 1px 1px rgba(0,0,0,0.3)' : ''
            }}
          />
        ))}
      </div>
    );
  };

  // Dice animation classes
  const diceAnimationClass = isRolling 
    ? 'animate-dice-roll'
    : value === 6 
      ? 'animate-bounce' 
      : '';

  return (
    <div className="dice-container flex flex-col items-center space-y-4">
      <div
        className={cn(
          'dice relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer transition-all duration-300 flex items-center justify-center',
          diceAnimationClass,
          disabled && 'opacity-60 cursor-not-allowed',
          !disabled && !isRolling && 'hover:scale-105'
        )}
        style={{
          perspective: '500px',
          transformStyle: 'preserve-3d',
          boxShadow: '0 6px 0 rgba(0,0,0,0.07), 0 8px 16px rgba(0,0,0,0.08)'
        }}
        onClick={!disabled && !isRolling ? onRoll : undefined}
      >
        {isRolling ? (
          <div className="text-3xl animate-bounce">🎲</div>
        ) : value ? (
          renderDots()
        ) : (
          <div className="text-base font-bold text-slate-600">Roll</div>
        )}
        
        {/* Edge lighting effect for subtle 3D appearance */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" 
             style={{ clipPath: 'polygon(0 0, 30% 0, 0 30%)' }} />
      </div>
      
      <button
        className={cn(
          'px-5 py-2 rounded-xl font-bold text-base transition-all duration-200 shadow-md border-2',
          disabled || isRolling 
            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-br from-pink-500 to-pink-600 text-white border-pink-700 hover:from-pink-600 hover:to-pink-700'
        )}
        onClick={onRoll}
        disabled={disabled || isRolling}
        style={{
          boxShadow: disabled || isRolling ? '' : '0 4px 0 rgba(190, 24, 93, 0.5)'
        }}
      >
        {isRolling ? (
          <span className="flex items-center justify-center space-x-2">
            <span className="animate-spin text-base">🎲</span>
            <span>Rolling...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <span className="text-lg">🎲</span>
            <span>Roll Dice</span>
          </span>
        )}
      </button>
      
      {value && !isRolling && (
        <div className="text-center bg-gradient-to-b from-pink-50 to-rose-100 border-2 border-rose-200 rounded-lg p-2 shadow-md">
          <div className="text-xl font-bold mb-1 text-rose-700">{value}</div>
          <div className="text-sm text-rose-700 font-medium">
            {value === 6 ? '⭐ Extra Turn! ⭐' : 'Good Roll!'}
          </div>
        </div>
      )}
    </div>
  );
};
