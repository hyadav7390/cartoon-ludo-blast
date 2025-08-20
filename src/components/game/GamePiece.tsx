
import React from 'react';
import { GamePiece as GamePieceType } from '@/types/game';
import { cn } from '@/lib/utils';

interface GamePieceProps {
  piece: GamePieceType;
  onClick: () => void;
  isValid: boolean;
  stackIndex: number;
  totalStack: number;
}

export const GamePiece: React.FC<GamePieceProps> = ({ 
  piece, 
  onClick, 
  isValid, 
  stackIndex, 
  totalStack 
}) => {
  const getStackOffset = () => {
    if (totalStack === 1) return { x: 0, y: 0 };
    
    const radius = 6;
    const angle = (stackIndex * 2 * Math.PI) / totalStack;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  };

  const stackOffset = getStackOffset();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-br from-red-400 to-red-600 border-red-700 shadow-red-200';
      case 'blue':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700 shadow-blue-200';
      case 'green':
        return 'bg-gradient-to-br from-green-400 to-green-600 border-green-700 shadow-green-200';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-700 shadow-yellow-200';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-700 shadow-gray-200';
    }
  };

  return (
    <div
      className={cn(
        'absolute w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 transition-all duration-300 transform-gpu',
        getColorClasses(piece.color),
        'shadow-lg',
        isValid && 'cursor-pointer hover:scale-125 animate-pulse ring-2 ring-white ring-opacity-75',
        !isValid && piece.isInHome && 'opacity-80',
        !isValid && !piece.isInHome && 'cursor-not-allowed opacity-60'
      )}
      style={{
        left: `calc(50% - ${totalStack === 1 ? '12px' : '10px'} + ${stackOffset.x}px)`,
        top: `calc(50% - ${totalStack === 1 ? '12px' : '10px'} + ${stackOffset.y}px)`,
        zIndex: 10 + stackIndex,
      }}
      onClick={isValid ? onClick : undefined}
    >
      {/* Inner highlight */}
      <div className="absolute inset-0.5 rounded-full bg-white/30 pointer-events-none" />
      
      {/* Piece number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[8px] sm:text-[10px] font-bold text-white drop-shadow-sm">
          {parseInt(piece.id.split('-')[1]) + 1}
        </span>
      </div>
      
      {/* Glow effect for valid moves */}
      {isValid && (
        <>
          <div className="absolute -inset-1 rounded-full bg-white/40 animate-ping pointer-events-none" />
          <div className="absolute -inset-0.5 rounded-full bg-white/60 pointer-events-none" />
        </>
      )}
    </div>
  );
};
