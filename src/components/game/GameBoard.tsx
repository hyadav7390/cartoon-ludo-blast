
import React from 'react';
import { GameState, Position, BOARD_SIZE } from '@/types/game';
import { GamePiece } from './GamePiece';
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
    // Define the main path squares in a cross pattern
    return (
      // Bottom horizontal line (Red area)
      (y === 8 && x >= 0 && x <= 5) ||
      (y === 8 && x >= 9 && x <= 14) ||
      // Top horizontal line (Blue area)
      (y === 6 && x >= 0 && x <= 5) ||
      (y === 6 && x >= 9 && x <= 14) ||
      // Left vertical line
      (x === 6 && y >= 0 && y <= 5) ||
      (x === 6 && y >= 9 && y <= 14) ||
      // Right vertical line
      (x === 8 && y >= 0 && y <= 5) ||
      (x === 8 && y >= 9 && y <= 14) ||
      // Center cross paths
      (x === 7 && y >= 1 && y <= 13) ||
      (y === 7 && x >= 1 && x <= 13)
    );
  };

  const isHomeArea = (x: number, y: number): { isHome: boolean; color?: string } => {
    // Blue home (top-left)
    if (x >= 0 && x <= 5 && y >= 0 && y <= 5) return { isHome: true, color: 'blue' };
    // Green home (top-right)
    if (x >= 9 && x <= 14 && y >= 0 && y <= 5) return { isHome: true, color: 'green' };
    // Yellow home (bottom-right)
    if (x >= 9 && x <= 14 && y >= 9 && y <= 14) return { isHome: true, color: 'yellow' };
    // Red home (bottom-left)
    if (x >= 0 && x <= 5 && y >= 9 && y <= 14) return { isHome: true, color: 'red' };
    return { isHome: false };
  };

  const isSafeSquare = (x: number, y: number): boolean => {
    const safePositions = [
      { x: 6, y: 13 }, // Red start
      { x: 2, y: 8 },  // Red safe
      { x: 8, y: 6 },  // Green safe
      { x: 8, y: 2 },  // Green start (corrected)
      { x: 12, y: 6 }, // Yellow safe
      { x: 8, y: 12 }, // Yellow start
      { x: 6, y: 2 },  // Blue start
      { x: 2, y: 6 }   // Blue safe
    ];
    return safePositions.some(pos => pos.x === x && pos.y === y);
  };

  const isStartSquare = (x: number, y: number): boolean => {
    const startPositions = [
      { x: 6, y: 13 }, // Red start
      { x: 1, y: 8 },  // Blue start
      { x: 8, y: 1 },  // Green start
      { x: 13, y: 6 }  // Yellow start
    ];
    return startPositions.some(pos => pos.x === x && pos.y === y);
  };

  const isHomeColumn = (x: number, y: number): string | null => {
    // Red home column (vertical)
    if (x === 7 && y >= 8 && y <= 12) return 'red';
    // Blue home column (vertical)
    if (x === 7 && y >= 2 && y <= 6) return 'blue';
    // Green home column (horizontal)
    if (y === 6 && x >= 9 && x <= 13) return 'green';
    // Yellow home column (horizontal)
    if (y === 8 && x >= 9 && x <= 13) return 'yellow';
    return null;
  };

  const renderBoardSquare = (x: number, y: number) => {
    const isCenter = x === 7 && y === 7;
    const homeArea = isHomeArea(x, y);
    const isMainPath = isMainPathSquare(x, y);
    const isSafe = isSafeSquare(x, y);
    const isStart = isStartSquare(x, y);
    const homeCol = isHomeColumn(x, y);

    let squareClasses = 'board-square relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 transition-all duration-200 flex items-center justify-center';
    
    if (isCenter) {
      squareClasses += ' bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 border-yellow-500 shadow-lg';
    } else if (homeCol) {
      switch (homeCol) {
        case 'red':
          squareClasses += ' bg-gradient-to-br from-red-200 to-red-300 border-red-400';
          break;
        case 'blue':
          squareClasses += ' bg-gradient-to-br from-blue-200 to-blue-300 border-blue-400';
          break;
        case 'green':
          squareClasses += ' bg-gradient-to-br from-green-200 to-green-300 border-green-400';
          break;
        case 'yellow':
          squareClasses += ' bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-400';
          break;
      }
    } else if (isSafe && isMainPath) {
      squareClasses += ' bg-gradient-to-br from-emerald-200 to-emerald-300 border-emerald-400 shadow-md';
    } else if (isStart && isMainPath) {
      squareClasses += ' bg-gradient-to-br from-cyan-200 to-cyan-300 border-cyan-400 border-4 shadow-md';
    } else if (isMainPath) {
      squareClasses += ' bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 hover:bg-gray-200';
    } else if (homeArea.isHome) {
      switch (homeArea.color) {
        case 'red':
          squareClasses += ' bg-gradient-to-br from-red-100 to-red-150 border-red-200';
          break;
        case 'blue':
          squareClasses += ' bg-gradient-to-br from-blue-100 to-blue-150 border-blue-200';
          break;
        case 'green':
          squareClasses += ' bg-gradient-to-br from-green-100 to-green-150 border-green-200';
          break;
        case 'yellow':
          squareClasses += ' bg-gradient-to-br from-yellow-100 to-yellow-150 border-yellow-200';
          break;
      }
    } else {
      squareClasses += ' bg-gradient-to-br from-stone-100 to-stone-200 border-stone-300';
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
        
        {/* Safe square marker */}
        {isSafe && isMainPath && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xl text-emerald-600 drop-shadow-sm font-bold">⭐</div>
          </div>
        )}
        
        {/* Center finish marker */}
        {isCenter && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-2xl font-bold text-white drop-shadow-lg animate-pulse">🏆</div>
          </div>
        )}

        {/* Start square marker */}
        {isStart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 bg-white rounded-full shadow-md border-2 border-cyan-500"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-board relative mx-auto bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 rounded-3xl shadow-2xl border-4 border-amber-300">
      <div 
        className="grid gap-1 bg-white/20 p-2 rounded-2xl"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => renderBoardSquare(x, y))
        )}
      </div>
      
      {/* Enhanced corner labels with better styling */}
      <div className="absolute top-4 left-4 bg-blue-500 text-white font-bold text-sm px-3 py-2 rounded-xl shadow-lg border-2 border-blue-300">
        🔵 BLUE
      </div>
      <div className="absolute top-4 right-4 bg-green-500 text-white font-bold text-sm px-3 py-2 rounded-xl shadow-lg border-2 border-green-300">
        🟢 GREEN
      </div>
      <div className="absolute bottom-4 right-4 bg-yellow-500 text-black font-bold text-sm px-3 py-2 rounded-xl shadow-lg border-2 border-yellow-300">
        🟡 YELLOW
      </div>
      <div className="absolute bottom-4 left-4 bg-red-500 text-white font-bold text-sm px-3 py-2 rounded-xl shadow-lg border-2 border-red-300">
        🔴 RED
      </div>
    </div>
  );
};
