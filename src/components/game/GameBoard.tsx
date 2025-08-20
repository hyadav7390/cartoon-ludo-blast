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
  const renderBoardSquare = (x: number, y: number) => {
    const isCenter = x === 7 && y === 7;
    const isHomeArea = (x <= 5 && y <= 5) || (x >= 9 && y <= 5) || 
                      (x >= 9 && y >= 9) || (x <= 5 && y >= 9);
    const isMainPath = !isHomeArea && !isCenter;
    const isSafeSquare = isMainPath && ((x === 7 && y === 2) || (x === 12 && y === 7) || 
                        (x === 7 && y === 12) || (x === 2 && y === 7));
    const isStartSquare = (x === 2 && y === 8) || (x === 8 && y === 2) || 
                         (x === 12 && y === 6) || (x === 6 && y === 12);

    let squareClasses = 'board-square w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12';
    
    if (isCenter) {
      squareClasses += ' center-finish';
    } else if (isSafeSquare) {
      squareClasses += ' safe';
    } else if (isStartSquare) {
      squareClasses += ' border-2 border-primary';
    } else if (isHomeArea) {
      // Color home areas
      if (x <= 5 && y <= 5) squareClasses += ' bg-player-red/20';
      else if (x >= 9 && y <= 5) squareClasses += ' bg-player-blue/20';
      else if (x >= 9 && y >= 9) squareClasses += ' bg-player-green/20';
      else if (x <= 5 && y >= 9) squareClasses += ' bg-player-yellow/20';
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
        {isSafeSquare && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
        )}
        {isCenter && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-bold text-accent-foreground">★</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-board relative mx-auto">
      <div 
        className="grid gap-1 p-4"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => renderBoardSquare(x, y))
        )}
      </div>
      
      {/* Board decorations */}
      <div className="absolute top-4 left-4 text-player-red font-bold text-sm">RED</div>
      <div className="absolute top-4 right-4 text-player-blue font-bold text-sm">BLUE</div>
      <div className="absolute bottom-4 right-4 text-player-green font-bold text-sm">GREEN</div>
      <div className="absolute bottom-4 left-4 text-player-yellow font-bold text-sm">YELLOW</div>
    </div>
  );
};