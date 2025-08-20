
import { Position, PlayerColor } from '@/types/game';

export const BOARD_SIZE = 15;

// Define the main path positions for the Ludo board
export const MAIN_PATH_POSITIONS: Position[] = [
  // Bottom row (Red start area) - positions 0-5
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 }, { x: 6, y: 8 },
  // Left column going up - positions 6-11
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
  // Top left corner going right - positions 12-17
  { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
  // Blue start area and beyond - positions 18-23
  { x: 6, y: 7 }, { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 },
  // Top row going right - positions 24-29
  { x: 6, y: 1 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 },
  // Right column going down - positions 30-35
  { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 }, { x: 8, y: 7 }, { x: 9, y: 7 },
  // Green start area - positions 36-41
  { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 }, { x: 14, y: 7 }, { x: 14, y: 8 },
  // Right side going down - positions 42-47
  { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 },
  // Yellow start area - positions 48-51
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 7, y: 13 }
];

// Starting positions for each color on the main path
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,    // Red starts at position 0
  blue: 13,  // Blue starts at position 13
  green: 26, // Green starts at position 26
  yellow: 39 // Yellow starts at position 39
};

// Safe squares (marked with stars)
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home column positions for each color
export const HOME_COLUMN_POSITIONS: Record<PlayerColor, Position[]> = {
  red: [
    { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, 
    { x: 7, y: 9 }, { x: 7, y: 8 }, { x: 7, y: 7 }
  ],
  blue: [
    { x: 7, y: 6 }, { x: 7, y: 5 }, { x: 7, y: 4 }, 
    { x: 7, y: 3 }, { x: 7, y: 2 }, { x: 7, y: 1 }
  ],
  green: [
    { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, 
    { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 7, y: 7 }
  ],
  yellow: [
    { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 }, 
    { x: 7, y: 12 }, { x: 7, y: 13 }, { x: 7, y: 7 }
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
