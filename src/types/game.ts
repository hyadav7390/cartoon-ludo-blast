
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Position {
  x: number;
  y: number;
}

export interface GamePiece {
  id: string;
  playerId: string;
  color: PlayerColor;
  position: Position;
  boardPosition: number; // -1 for home, 0-51 for main path, 52+ for home column/finish
  isInHome: boolean;
  isInHomeColumn: boolean;
  isFinished: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  pieces: GamePiece[];
  isActive: boolean;
  turnTimer: number;
  skippedTurns: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  moveHistory: GameMove[];
  consecutiveSixes: number;
  gameMessage: string;
}

export interface GameMove {
  playerId: string;
  pieceId: string;
  from: Position;
  to: Position;
  diceValue: number;
  timestamp: number;
  action: 'move' | 'capture' | 'enter' | 'finish';
}

export const BOARD_SIZE = 15;
export const TOTAL_MAIN_SQUARES = 52;
export const HOME_COLUMN_SQUARES = 6;
export const PIECES_PER_PLAYER = 4;

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

export const HOME_POSITIONS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 1, y: 10 }, { x: 2, y: 10 },
    { x: 1, y: 11 }, { x: 2, y: 11 }
  ],
  blue: [
    { x: 1, y: 3 }, { x: 2, y: 3 },
    { x: 1, y: 4 }, { x: 2, y: 4 }
  ],
  green: [
    { x: 12, y: 3 }, { x: 13, y: 3 },
    { x: 12, y: 4 }, { x: 13, y: 4 }
  ],
  yellow: [
    { x: 12, y: 10 }, { x: 13, y: 10 },
    { x: 12, y: 11 }, { x: 13, y: 11 }
  ]
};

// Safe squares (marked with stars)
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
