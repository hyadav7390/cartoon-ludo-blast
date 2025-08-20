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
  boardPosition: number; // -1 for home, 0-51 for main path, 52-57 for home column, 58 for finish
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

export interface BoardSquare {
  id: number;
  position: Position;
  type: 'normal' | 'safe' | 'start' | 'home-column' | 'finish';
  color?: PlayerColor;
  occupiedBy?: GamePiece[];
}

export const BOARD_SIZE = 15;
export const SQUARES_PER_SIDE = 6;
export const TOTAL_MAIN_SQUARES = 52;
export const HOME_COLUMN_SQUARES = 6;
export const PIECES_PER_PLAYER = 4;

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 1,
  blue: 14,
  green: 27,
  yellow: 40
};

export const SAFE_SQUARES = [1, 9, 14, 22, 27, 35, 40, 48];

export const HOME_POSITIONS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 1, y: 2 }, { x: 2, y: 2 }
  ],
  blue: [
    { x: 12, y: 1 }, { x: 13, y: 1 },
    { x: 12, y: 2 }, { x: 13, y: 2 }
  ],
  green: [
    { x: 12, y: 12 }, { x: 13, y: 12 },
    { x: 12, y: 13 }, { x: 13, y: 13 }
  ],
  yellow: [
    { x: 1, y: 12 }, { x: 2, y: 12 },
    { x: 1, y: 13 }, { x: 2, y: 13 }
  ]
};