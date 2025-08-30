import React from 'react';
import { GameState, BOARD_SIZE, PlayerColor } from '@/types/game';
import { GamePiece } from './GamePiece';
import { cn } from '@/lib/utils';
import { MAIN_PATH_POSITIONS, HOME_COLUMN_POSITIONS } from '@/utils/boardPositions';

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
  // Precompute visible path and home column squares from board mapping
  const pathKeySet = React.useMemo(() => new Set(MAIN_PATH_POSITIONS.map(p => `${p.x},${p.y}`)), []);
  const homeColumnKeyToColor = React.useMemo(() => {
    const map = new Map<string, PlayerColor>();
    (['blue','green','yellow','red'] as PlayerColor[]).forEach((color) => {
      HOME_COLUMN_POSITIONS[color].forEach(pos => {
        map.set(`${pos.x},${pos.y}`, color);
      });
    });
    return map;
  }, []);

  const isCenterArea = (x: number, y: number): boolean => x >= 6 && x <= 8 && y >= 6 && y <= 8;

  const getHomeBgClasses = (color: PlayerColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 border-blue-200';
      case 'green': return 'bg-green-100 border-green-200';
      case 'yellow': return 'bg-yellow-100 border-yellow-200';
      case 'red': return 'bg-red-100 border-red-200';
    }
  };

  const getPieceClasses = (color: PlayerColor) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-b from-red-500 to-red-600 border-red-600';
      case 'blue':
        return 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-600';
      case 'green':
        return 'bg-gradient-to-b from-green-500 to-green-600 border-green-600';
      case 'yellow':
        return 'bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-500';
    }
  };

  // Render only squares that are in the main path mapping or home column mapping; hide inner 3x3 center entirely
  const renderBoardSquare = (x: number, y: number) => {
    if (isCenterArea(x, y)) return null;

    const key = `${x},${y}`;
    const inPath = pathKeySet.has(key);
    const homeColumnColor = homeColumnKeyToColor.get(key) || null;

    if (!inPath && !homeColumnColor) {
      return null;
    }

    let squareClasses = 'board-square relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border transition-all duration-200 flex items-center justify-center rounded-md';

    if (homeColumnColor) {
      switch (homeColumnColor) {
        case 'red':
          squareClasses += ' bg-red-200 border-red-300 shadow-sm'; break;
        case 'blue':
          squareClasses += ' bg-blue-200 border-blue-300 shadow-sm'; break;
        case 'green':
          squareClasses += ' bg-green-200 border-green-300 shadow-sm'; break;
        case 'yellow':
          squareClasses += ' bg-yellow-200 border-yellow-300 shadow-sm'; break;
      }
    } else {
      squareClasses += ' bg-white hover:bg-sky-100 border-blue-100 shadow-sm';
    }

    // Find pieces at this position (path tiles only)
    const piecesAtPosition = gameState.players.flatMap(player =>
      player.pieces.filter(
        piece => Math.round(piece.position.x) === x && Math.round(piece.position.y) === y
      )
    );

    return (
      <div
        key={`${x}-${y}`}
        className={cn(squareClasses)}
        style={{ gridColumn: x + 1, gridRow: y + 1 }}
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
      </div>
    );
  };

  // Arrange four home pieces in a fixed 2x2 grid per color (square formation)
  const getHomeGridPositions = () => [
    { left: 30, top: 30 },
    { left: 70, top: 30 },
    { left: 30, top: 70 },
    { left: 70, top: 70 }
  ];

  const getHomeEmoji = (color: PlayerColor) => {
    switch (color) {
      case 'red': return '🔴';
      case 'blue': return '🔵';
      case 'green': return '🟢';
      case 'yellow': return '🟡';
    }
  };

  // Dice badge helpers (current or last dice value per player)
  const getPlayerDiceValue = (playerId: string): number | null => {
    const current = gameState.players[gameState.currentPlayerIndex];
    if (current.id === playerId && gameState.diceValue !== null) return gameState.diceValue;
    for (let i = gameState.moveHistory.length - 1; i >= 0; i--) {
      const mv = gameState.moveHistory[i];
      if (mv.playerId === playerId) return mv.diceValue;
    }
    return null;
  };

  const renderDiceBadge = (value: number | null) => (
    <div className={cn(
      'absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md border-2 flex items-center justify-center text-xs font-bold',
      value === null ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-slate-700 border-slate-300'
    )}>
      {value ?? '-'}
    </div>
  );

  const renderHomeBlock = (color: PlayerColor, gridColStart: number, gridRowStart: number) => {
    const player = gameState.players.find(p => p.color === color);
    const piecesInHome = player ? player.pieces.filter(p => p.isInHome) : [];

    return (
      <div 
        key={`${color}-home`}
        className="relative rounded-lg"
        style={{ gridColumn: `${gridColStart} / span 6`, gridRow: `${gridRowStart} / span 6` }}
      >
        <div className={cn('absolute inset-0 rounded-lg border-2', getHomeBgClasses(color))} />
        {/* Center emblem */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn(
            'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-2 flex items-center justify-center text-2xl md:text-3xl',
            color === 'red' ? 'border-red-400 text-red-500 bg-red-50' : '',
            color === 'blue' ? 'border-blue-400 text-blue-500 bg-blue-50' : '',
            color === 'green' ? 'border-green-400 text-green-500 bg-green-50' : '',
            color === 'yellow' ? 'border-yellow-400 text-yellow-500 bg-yellow-50' : ''
          )}>
            {getHomeEmoji(color)}
          </div>
        </div>
        {/* Pieces layer in fixed 2x2 grid */}
        <div className="absolute inset-0 rounded-lg">
          {piecesInHome.map((piece, idx) => {
            const slot = getHomeGridPositions()[idx % 4];
            const isValid = validMoves.includes(piece.id);
            return (
              <div
                key={piece.id}
                className={cn(
                  'absolute w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 shadow-md transition-transform duration-200',
                  getPieceClasses(color),
                  isValid ? 'ring-2 ring-white animate-pulse cursor-pointer' : 'opacity-95'
                )}
                style={{
                  left: `calc(${slot.left}% - 12px)`,
                  top: `calc(${slot.top}% - 12px)`,
                  zIndex: 20,
                }}
                onClick={isValid ? () => onPieceClick(piece.id) : undefined}
              />
            );
          })}
        </div>
        {/* Dice badge */}
        {player && renderDiceBadge(getPlayerDiceValue(player.id))}
      </div>
    );
  };

  // Single merged center with finished pieces around trophy
  const renderCenter = () => {
    const finishedPieces = gameState.players.flatMap(p => p.pieces.filter(pc => pc.isFinished));

    return (
      <div
        className="relative rounded-xl border-2 bg-amber-100/90 border-amber-200 flex items-center justify-center"
        style={{ gridColumn: '7 / 10', gridRow: '7 / 10' }}
      >
        <div className="text-2xl md:text-3xl">🏆</div>
        {finishedPieces.map((pc, idx) => {
          const angle = (idx / Math.max(1, finishedPieces.length)) * Math.PI * 2;
          const r = 35; // percent radius of the 3x3 block
          const left = 50 + r * Math.cos(angle);
          const top = 50 + r * Math.sin(angle);
          return (
            <div
              key={pc.id}
              className={cn('absolute w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 shadow-md', getPieceClasses(pc.color))}
              style={{ left: `calc(${left}% - 12px)`, top: `calc(${top}% - 12px)` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="game-board relative mx-auto p-4">
      <div 
        className="grid gap-0.5 p-4 rounded-lg shadow-md border-2 border-blue-200 bg-white"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {/* Merged Home Areas */}
        {renderHomeBlock('blue', 1, 1)}
        {renderHomeBlock('green', 10, 1)}
        {renderHomeBlock('yellow', 10, 10)}
        {renderHomeBlock('red', 1, 10)}

        {/* Center area merged (3x3) */}
        {renderCenter()}

        {/* Visible path and home columns only */}
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => renderBoardSquare(x, y))
        )}
      </div>
      
      {/* Home area labels */}
      <div className="absolute top-6 left-6 bg-blue-100 text-blue-700 font-bold text-xs px-2 py-1 rounded-md shadow-sm border border-blue-200">
        BLUE HOME
      </div>
      <div className="absolute top-6 right-6 bg-green-100 text-green-700 font-bold text-xs px-2 py-1 rounded-md shadow-sm border border-green-200">
        GREEN HOME
      </div>
      <div className="absolute bottom-6 right-6 bg-yellow-100 text-yellow-700 font-bold text-xs px-2 py-1 rounded-md shadow-sm border border-yellow-200">
        YELLOW HOME
      </div>
      <div className="absolute bottom-6 left-6 bg-red-100 text-red-700 font-bold text-xs px-2 py-1 rounded-md shadow-sm border border-red-200">
        RED HOME
      </div>
    </div>
  );
};