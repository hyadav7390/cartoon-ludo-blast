
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
    
    const radius = 8;
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
        return 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-700 shadow-red-300 hover:from-red-500 hover:via-red-600 hover:to-red-700';
      case 'blue':
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-blue-700 shadow-blue-300 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700';
      case 'green':
        return 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-green-700 shadow-green-300 hover:from-green-500 hover:via-green-600 hover:to-green-700';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-700 shadow-yellow-300 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-700 shadow-gray-300';
    }
  };

  return (
    <div
      className={cn(
        'absolute w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-3 transition-all duration-300',
        getColorClasses(piece.color),
        'shadow-lg hover:shadow-xl',
        isValid && 'cursor-pointer hover:scale-125 ring-4 ring-white ring-opacity-75 z-20',
        !isValid && piece.isInHome && 'opacity-90 hover:opacity-100 hover:scale-110',
        !isValid && !piece.isInHome && 'cursor-not-allowed opacity-80 hover:scale-105'
      )}
      style={{
        left: `calc(50% - ${totalStack === 1 ? '16px' : '14px'} + ${stackOffset.x}px)`,
        top: `calc(50% - ${totalStack === 1 ? '16px' : '14px'} + ${stackOffset.y}px)`,
        zIndex: 10 + stackIndex,
      }}
      onClick={isValid ? onClick : undefined}
    >
      {/* Inner highlight for 3D effect */}
      <div className="absolute inset-1 rounded-full bg-white/40 pointer-events-none" />
      
      {/* Piece number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md">
          {parseInt(piece.id.split('-')[1]) + 1}
        </span>
      </div>
      
      {/* Glow effect for valid moves */}
      {isValid && (
        <>
          <div className="absolute -inset-2 rounded-full bg-white/50 pointer-events-none" />
          <div className="absolute -inset-1 rounded-full bg-yellow-300/60 pointer-events-none" />
        </>
      )}
    </div>
  );
};
