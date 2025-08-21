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
  // Main path: Classic Ludo cross, with arms and home columns free
  const isMainPathSquare = (x: number, y: number): boolean => {
    // Vertical cross (excluding home columns, which is from (7,2)-(7,6), (7,8)-(7,12))
    const isVertical = x === 7 && (
      (y >= 0 && y <= 5) ||               // Blue arm
      (y >= 9 && y <= 14) ||              // Red arm
      (y === 7) ||                        // Center cross
      (y === 6 || y === 8)                // arm boundaries
    );
    // Horizontal cross (excluding home columns, which is from (2,7)-(6,7), (8,7)-(12,7))
    const isHorizontal = y === 7 && (
      (x >= 0 && x <= 5) ||               // Green arm
      (x >= 9 && x <= 14) ||              // Yellow arm
      (x === 7) ||                        // Center cross
      (x === 6 || x === 8)                // arm boundaries
    );
    return isVertical || isHorizontal;
  };

  // Home areas: Classic 6x6 corners
  const isHomeArea = (x: number, y: number): { isHome: boolean; color?: string } => {
    if (x >= 0 && x <= 5 && y >= 0 && y <= 5) return { isHome: true, color: 'blue' };
    if (x >= 9 && x <= 14 && y >= 0 && y <= 5) return { isHome: true, color: 'green' };
    if (x >= 9 && x <= 14 && y >= 9 && y <= 14) return { isHome: true, color: 'yellow' };
    if (x >= 0 && x <= 5 && y >= 9 && y <= 14) return { isHome: true, color: 'red' };
    return { isHome: false };
  };

  // Start squares: Each color's start (just outside home area)
  const startPositions = [
    { x: 1, y: 6 },  // Blue start
    { x: 8, y: 1 },  // Green start
    { x: 13, y: 8 }, // Yellow start
    { x: 6, y: 13 }  // Red start
  ];

  const isStartSquare = (x: number, y: number): boolean =>
    startPositions.some(pos => pos.x === x && pos.y === y);

  // Safe squares: 4 safe tiles + 4 start positions (total 8 safe squares)
  const safePositions = [
    { x: 1, y: 6 },  // Blue safe/start
    { x: 8, y: 1 },  // Green safe/start
    { x: 13, y: 8 }, // Yellow safe/start
    { x: 6, y: 13 }, // Red safe/start
    { x: 3, y: 7 },  // Additional safe tile 1
    { x: 11, y: 7 }, // Additional safe tile 2
    { x: 7, y: 3 },  // Additional safe tile 3
    { x: 7, y: 11 }  // Additional safe tile 4
  ];

  const isSafeSquare = (x: number, y: number): boolean =>
    safePositions.some(pos => pos.x === x && pos.y === y);

  // Home columns: The "finish" line for each color going from arm to center (classic ludo)
  const isHomeColumn = (x: number, y: number): string | null => {
    // Red home column (vertical up to center)
    if (x === 7 && y >= 9 && y <= 13) return 'red';
    // Blue home column (vertical down to center)
    if (x === 7 && y >= 1 && y <= 5) return 'blue';
    // Green home column (horizontal right to center)
    if (y === 7 && x >= 9 && x <= 13) return 'green';
    // Yellow home column (horizontal left to center)
    if (y === 7 && x >= 1 && x <= 5) return 'yellow';
    return null;
  };

  const renderBoardSquare = (x: number, y: number) => {
    const isCenter = x === 7 && y === 7;
    const homeArea = isHomeArea(x, y);
    const isMainPath = isMainPathSquare(x, y);
    const isSafe = isSafeSquare(x, y);
    const isStart = isStartSquare(x, y);
    const homeCol = isHomeColumn(x, y);

    let squareClasses =
      'board-square relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-[hsl(var(--border))] transition-all duration-200 flex items-center justify-center';

    if (isCenter) {
      squareClasses += ' bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-foreground))] border-[hsl(var(--accent))] shadow-inset';
    } else if (homeCol) {
      switch (homeCol) {
        case 'red':
          squareClasses += ' bg-gradient-to-br from-red-600 to-red-700 border-red-800 shadow-inset'; break;
        case 'blue':
          squareClasses += ' bg-gradient-to-br from-blue-600 to-blue-700 border-blue-800 shadow-inset'; break;
        case 'green':
          squareClasses += ' bg-gradient-to-br from-green-600 to-green-700 border-green-800 shadow-inset'; break;
        case 'yellow':
          squareClasses += ' bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-800 shadow-inset'; break;
      }
    } else if (isSafe && isMainPath) {
      squareClasses += ' bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-800 shadow-inset';
    } else if (isStart && isMainPath) {
      squareClasses += ' bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-800 border-2 shadow-inset';
    } else if (isMainPath) {
      squareClasses += ' bg-gradient-to-br from-[hsl(var(--board-cell-light))] to-[hsl(var(--board-cell-dark))] hover:bg-[hsl(var(--board-cell-dark))] shadow-sm';
    } else if (homeArea.isHome) {
      switch (homeArea.color) {
        case 'red':
          squareClasses += ' bg-gradient-to-br from-red-800/80 to-red-900/80 border-red-700 shadow-sm'; break;
        case 'blue':
          squareClasses += ' bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-700 shadow-sm'; break;
        case 'green':
          squareClasses += ' bg-gradient-to-br from-green-800/80 to-green-900/80 border-green-700 shadow-sm'; break;
        case 'yellow':
          squareClasses += ' bg-gradient-to-br from-yellow-800/80 to-yellow-900/80 border-yellow-700 shadow-sm'; break;
      }
    } else {
      squareClasses += ' bg-gradient-to-br from-[hsl(var(--board-bg))] to-[hsl(var(--board-border))] shadow-sm';
    }

    // Find pieces at this position
    const piecesAtPosition = gameState.players.flatMap(player =>
      player.pieces.filter(
        piece => Math.round(piece.position.x) === x && Math.round(piece.position.y) === y
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
            <div className="text-lg text-white drop-shadow-sm font-bold">★</div>
          </div>
        )}

        {/* Center finish marker */}
        {isCenter && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xl font-bold text-white drop-shadow-lg">🏆</div>
          </div>
        )}

        {/* Start square marker */}
        {isStart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 bg-white rounded-full shadow-md border border-gray-400"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-board relative mx-auto p-4">
      <div 
        className="grid gap-0.5 bg-[hsl(var(--board-bg))] p-2 rounded-lg"
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
      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-700 to-blue-800 text-white font-bold text-xs px-2 py-1 rounded shadow-md border border-blue-600">
        🔵 BLUE
      </div>
      <div className="absolute top-2 right-2 bg-gradient-to-r from-green-700 to-green-800 text-white font-bold text-xs px-2 py-1 rounded shadow-md border border-green-600">
        🟢 GREEN
      </div>
      <div className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-700 to-yellow-800 text-black font-bold text-xs px-2 py-1 rounded shadow-md border border-yellow-600">
        🟡 YELLOW
      </div>
      <div className="absolute bottom-2 left-2 bg-gradient-to-r from-red-700 to-red-800 text-white font-bold text-xs px-2 py-1 rounded shadow-md border border-red-600">
        🔴 RED
      </div>
    </div>
  );
};