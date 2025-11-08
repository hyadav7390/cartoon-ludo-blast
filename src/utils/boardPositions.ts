import { Position, PlayerColor } from '@/types/game';

export const BOARD_SIZE = 15;

// Traditional Ludo main path - 52 squares in clockwise direction.
// Contract seat order: Red (index 0), Blue (13), Yellow (26), Green (39).
export const MAIN_PATH_POSITIONS: Position[] = [
  // Red section: start at (1,6) and move clockwise
  { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
  { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, 
  // Blue start at index 13 (8,1)
  { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
  { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
  { x: 14, y: 6 }, { x: 14, y: 7 }, { x: 14, y: 8 }, // Yellow start at index 26
  { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 },
  { x: 8, y: 14 }, { x: 7, y: 14 }, { x: 6, y: 14 }, // Green start at index 39
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 },
  { x: 0, y: 8 }, { x: 0, y: 7 }, { x: 0, y: 6 } // Back to Red start
];

// Starting positions for each color on the main path
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,    // Red starts at position 0 (1, 6)
  blue: 13,  // Blue starts at position 13 (8, 1)
  yellow: 26, // Yellow starts at position 26 (14, 8)
  green: 39  // Green starts at position 39 (6, 14)
};

// Safe squares (8 total: 4 start positions + 4 additional safe squares)
export const SAFE_SQUARES = [0, 13, 26, 39, 8, 21, 34, 47];

// Home column positions for each color
export const HOME_COLUMN_POSITIONS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, 
    { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 7, y: 7 }
  ],
  blue: [
    { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, 
    { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 7 }
  ],
  yellow: [
    { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, 
    { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 7, y: 7 }
  ],
  green: [
    { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, 
    { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 7 }
  ]
};

export const getBoardPosition = (boardPosition: number): Position => {
  if (boardPosition < 0) {
    return { x: 0, y: 0 }; // Home position, will be set elsewhere
  }
  
  if (boardPosition >= 52) {
    return { x: 7, y: 7 }; // Center finish position
  }
  
  return MAIN_PATH_POSITIONS[boardPosition] || { x: 7, y: 7 };
};

export const getHomeColumnPosition = (color: PlayerColor, columnPosition: number): Position => {
  const positions = HOME_COLUMN_POSITIONS[color];
  if (columnPosition >= positions.length) {
    return { x: 7, y: 7 }; // Center finish
  }
  return positions[columnPosition];
};
