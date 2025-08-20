
import React from 'react';
import { GameState, Position, BOARD_SIZE } from '@/types/game';
import { GamePiece } from './GamePiece';
import { SAFE_SQUARES } from '@/utils/boardPositions';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  onPieceClick: (pieceId: string) => void;
  validMoves: string[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  onPieceClick, 
  validMoves 
}) => {
  const isMainPathSquare = (x: number, y: number): boolean => {
    // Define the main path squares
    return (
      // Bottom horizontal line
      (y === 8 && x >= 0 && x <= 5) ||
      (y === 8 && x >= 9 && x <= 14) ||
      // Top horizontal line  
      (y === 6 && x >= 0 && x <= 5) ||
      (y === 6 && x >= 9 && x <= 14) ||
      // Left vertical line
      (x === 6 && y >= 0 && y <= 5) ||
      (x === 6 && y >= 9 && y <= 14) ||
      // Right vertical line
      (x === 8 && y >= 0 && y <= 5) ||
      (x === 8 && y >= 9 && y <= 14) ||
      // Center column and row
      (x === 7 && y >= 1 && y <= 13) ||
      (y === 7 && x >= 1 && x <= 13)
    );
  };

  const isHomeArea = (x: number, y: number): { isHome: boolean; color?: string } => {
    if (x >= 0 && x <= 5 && y >= 0 && y <= 5) return { isHome: true, color: 'blue' };
    if (x >= 9 && x <= 14 && y >= 0 && y <= 5) return { isHome: true, color: 'green' };
    if (x >= 9 && x <= 14 && y >= 9 && y <= 14) return { isHome: true, color: 'yellow' };
    if (x >= 0 && x <= 5 && y >= 9 && y <= 14) return { isHome: true, color: 'red' };
    return { isHome: false };
  };

  const isSafeSquare = (x: number, y: number): boolean => {
    const safePositions = [
      { x: 6, y: 8 }, { x: 2, y: 8 }, { x: 8, y: 6 }, { x: 8, y: 2 },
      { x: 12, y: 6 }, { x: 8, y: 12 }, { x: 6, y: 12 }, { x: 2, y: 6 }
    ];
    return safePositions.some(pos => pos.x === x && pos.y === y);
  };

  const isStartSquare = (x: number, y: number): boolean => {
    const startPositions = [
      { x: 6, y: 13 }, { x: 1, y: 8 }, { x: 8, y: 1 }, { x: 13, y: 6 }
    ];
    return startPositions.some(pos => pos.x === x && pos.y === y);
  };

  const renderBoardSquare = (x: number, y: number) => {
    const isCenter = x === 7 && y === 7;
    const homeArea = isHomeArea(x, y);
    const isMainPath = isMainPathSquare(x, y);
    const isSafe = isSafeSquare(x, y);
    const isStart = isStartSquare(x, y);

    let squareClasses = 'board-square relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border transition-all duration-200';
    
    if (isCenter) {
      squareClasses += ' center-finish bg-gradient-to-br from-yellow-200 to-yellow-400 border-yellow-500';
    } else if (isSafe && isMainPath) {
      squareClasses += ' safe bg-gradient-to-br from-green-200 to-green-300 border-green-400';
    } else if (isStart && isMainPath) {
      squareClasses += ' start-square bg-gradient-to-br from-blue-200 to-blue-300 border-blue-400 border-2';
    } else if (isMainPath) {
      squareClasses += ' main-path bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300';
    } else if (homeArea.isHome) {
      switch (homeArea.color) {
        case 'red':
          squareClasses += ' bg-gradient-to-br from-red-100 to-red-200 border-red-300';
          break;
        case 'blue':
          squareClasses += ' bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300';
          break;
        case 'green':
          squareClasses += ' bg-gradient-to-br from-green-100 to-green-200 border-green-300';
          break;
        case 'yellow':
          squareClasses += ' bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300';
          break;
      }
    } else {
      squareClasses += ' bg-gray-50 border-gray-200';
    }

    // Find pieces at this position
    const piecesAtPosition = gameState.players.flatMap(player => 
      player.pieces.filter(piece => 
        Math.round(piece.position.x) === x && Math.round(piece.position.y) === y
      )
    );

    return (
      <div
        key={`${x}-${y}`}
        className={cn(squareClasses)}
        style={{
          gridColumn: x + 1,
          gridRow: y + 1,
        }}
      >
        {piecesAtPosition.map((piece, index) => (
          <GamePiece
            key={piece.id}
            piece={piece}
            onClick={() => onPieceClick(piece.id)}
            isValid={validMoves.includes(piece.id)}
            stackIndex={index}
            totalStack={piecesAtPosition.length}
          />
        ))}
        
        {isSafe && isMainPath && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 bg-white rounded-full shadow-sm">
              <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5"></div>
            </div>
          </div>
        )}
        
        {isCenter && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-lg font-bold text-yellow-800">★</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-board relative mx-auto bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl shadow-lg border-4 border-amber-200">
      <div 
        className="grid gap-0.5"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => renderBoardSquare(x, y))
        )}
      </div>
      
      {/* Corner labels */}
      <div className="absolute top-2 left-2 text-blue-700 font-bold text-xs bg-white/80 px-2 py-1 rounded">BLUE</div>
      <div className="absolute top-2 right-2 text-green-700 font-bold text-xs bg-white/80 px-2 py-1 rounded">GREEN</div>
      <div className="absolute bottom-2 right-2 text-yellow-700 font-bold text-xs bg-white/80 px-2 py-1 rounded">YELLOW</div>
      <div className="absolute bottom-2 left-2 text-red-700 font-bold text-xs bg-white/80 px-2 py-1 rounded">RED</div>
    </div>
  );
};
