
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
    
    // Offset for proper stacking
    const radius = 6;
    const angle = (stackIndex * 2 * Math.PI) / totalStack;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  };

  const stackOffset = getStackOffset();

  // Enhanced color classes with gradient effects
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-b from-red-500 to-red-600 border-red-700 shadow-red-300';
      case 'blue':
        return 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-700 shadow-blue-300';
      case 'green':
        return 'bg-gradient-to-b from-green-500 to-green-600 border-green-700 shadow-green-300';
      case 'yellow':
        return 'bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-600 shadow-yellow-300';
      default:
        return 'bg-gradient-to-b from-gray-400 to-gray-500 border-gray-600 shadow-gray-300';
    }
  };

  return (
    <div
      className={cn(
        'absolute w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 transition-all duration-300',
        getColorClasses(piece.color),
        'shadow-md',
        piece.isFinished ? 'ring-2 ring-amber-400' : '',
        isValid ? 'cursor-pointer hover:scale-110 animate-pulse ring-2 ring-white z-20' : '',
        !isValid && piece.isInHome && 'opacity-90 hover:opacity-100',
        !isValid && !piece.isInHome && 'cursor-not-allowed opacity-90'
      )}
      style={{
        left: `calc(50% - ${totalStack === 1 ? '14px' : '12px'} + ${stackOffset.x}px)`,
        top: `calc(50% - ${totalStack === 1 ? '14px' : '12px'} + ${stackOffset.y}px)`,
        zIndex: 10 + stackIndex,
        boxShadow: isValid 
          ? '0 0 10px rgba(255, 255, 255, 0.6), 0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 3px 5px rgba(0, 0, 0, 0.2)',
      }}
      onClick={isValid ? onClick : undefined}
    >
      {/* Inner highlight for subtle 3D effect */}
      <div className="absolute inset-1.5 rounded-full bg-white/30 pointer-events-none" 
           style={{ clipPath: 'circle(40% at 30% 30%)' }} />
      
      {/* Piece number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs font-bold text-white drop-shadow-sm">
          {parseInt(piece.id.split('-')[1]) + 1}
        </span>
      </div>
      
      {/* Glow effect for valid moves */}
      {isValid && (
        <div className="absolute -inset-1 rounded-full bg-white/40 pointer-events-none animate-ping opacity-70" />
      )}

      {/* Finish indicator */}
      {piece.isFinished && (
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-amber-300 rounded-full border border-amber-500 z-30"></div>
      )}
    </div>
  );
};
