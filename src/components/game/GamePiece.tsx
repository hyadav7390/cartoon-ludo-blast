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

  return (
    <div
      className={cn(
        'game-piece',
        piece.color,
        isValid && 'active cursor-pointer',
        !isValid && 'cursor-not-allowed opacity-75'
      )}
      style={{
        width: '20px',
        height: '20px',
        left: `calc(50% - 10px + ${stackOffset.x}px)`,
        top: `calc(50% - 10px + ${stackOffset.y}px)`,
        zIndex: 10 + stackIndex,
      }}
      onClick={isValid ? onClick : undefined}
    >
      {/* Inner highlight */}
      <div className="absolute inset-1 rounded-full bg-white/30" />
      
      {/* Player number indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white drop-shadow-sm">
          {piece.id.split('-')[1]}
        </span>
      </div>
      
      {/* Glow effect for valid moves */}
      {isValid && (
        <div className="absolute -inset-1 rounded-full bg-primary/30 animate-pulse" />
      )}
    </div>
  );
};