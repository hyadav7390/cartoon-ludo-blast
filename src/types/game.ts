
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

// Placing pieces in home centers with specific offsets for each piece
export const HOME_POSITIONS: Record<PlayerColor, Position[]> = {
  blue: [
    { x: 3, y: 3 }, { x: 3.3, y: 2.7 },
    { x: 2.7, y: 2.7 }, { x: 2.7, y: 3.3 }
  ],
  green: [
    { x: 11, y: 3 }, { x: 11.3, y: 2.7 },
    { x: 10.7, y: 2.7 }, { x: 10.7, y: 3.3 }
  ],
  yellow: [
    { x: 11, y: 11 }, { x: 11.3, y: 10.7 },
    { x: 10.7, y: 10.7 }, { x: 10.7, y: 11.3 }
  ],
  red: [
    { x: 3, y: 11 }, { x: 3.3, y: 10.7 },
    { x: 2.7, y: 10.7 }, { x: 2.7, y: 11.3 }
  ]
};

// Safe squares (marked with stars)
export const SAFE_SQUARES = [0, 13, 26, 39, 8, 21, 34, 47];