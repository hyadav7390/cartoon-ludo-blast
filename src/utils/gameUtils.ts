import { GameState, Player, GamePiece, PlayerColor, Position, PLAYER_COLORS, START_POSITIONS, SAFE_SQUARES, HOME_POSITIONS, PIECES_PER_PLAYER, TOTAL_MAIN_SQUARES, HOME_COLUMN_SQUARES } from '@/types/game';

export const createInitialGameState = (playerCount: number): GameState => {
  const players: Player[] = PLAYER_COLORS.slice(0, playerCount).map((color, index) => ({
    id: `player-${index}`,
    name: `Player ${index + 1}`,
    color,
    pieces: createInitialPieces(color, index),
    isActive: index === 0,
    turnTimer: 30,
    skippedTurns: 0
  }));

  return {
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    gameStatus: 'waiting',
    winner: null,
    moveHistory: [],
    consecutiveSixes: 0,
    gameMessage: 'Welcome to Ludo! Click Start Game to begin.'
  };
};

const createInitialPieces = (color: PlayerColor, playerIndex: number): GamePiece[] => {
  const homePositions = HOME_POSITIONS[color];
  return Array.from({ length: PIECES_PER_PLAYER }, (_, i) => ({
    id: `${color}-${i}`,
    playerId: `player-${playerIndex}`,
    color,
    position: homePositions[i],
    boardPosition: -1, // -1 means in home
    isInHome: true,
    isInHomeColumn: false,
    isFinished: false
  }));
};

export const getBoardPosition = (boardPosition: number): Position => {
  if (boardPosition < 0) {
    // In home, position will be set separately
    return { x: 0, y: 0 };
  }
  
  if (boardPosition >= TOTAL_MAIN_SQUARES) {
    // In home column or finished
    return getHomeColumnPosition(boardPosition - TOTAL_MAIN_SQUARES);
  }
  
  // Main path positions
  const side = Math.floor(boardPosition / 13);
  const posInSide = boardPosition % 13;
  
  switch (side) {
    case 0: // Bottom side (moving right)
      return { x: posInSide + 1, y: 8 };
    case 1: // Right side (moving up)
      return { x: 8, y: 7 - posInSide };
    case 2: // Top side (moving left)
      return { x: 7 - posInSide, y: 6 };
    case 3: // Left side (moving down)
      return { x: 6, y: posInSide + 1 };
    default:
      return { x: 0, y: 0 };
  }
};

const getHomeColumnPosition = (homeColumnPos: number): Position => {
  if (homeColumnPos >= HOME_COLUMN_SQUARES) {
    // Finished - center position
    return { x: 7, y: 7 };
  }
  
  // Home column positions (simplified - would need color-specific logic)
  return { x: 7, y: 7 - homeColumnPos };
};

export const canMovePiece = (piece: GamePiece, diceValue: number): boolean => {
  // Piece in home can only move out on a 6
  if (piece.isInHome) {
    return diceValue === 6;
  }
  
  // Piece finished cannot move
  if (piece.isFinished) {
    return false;
  }
  
  // Check if move would overshoot finish
  if (piece.isInHomeColumn) {
    const currentHomeColumnPos = piece.boardPosition - TOTAL_MAIN_SQUARES;
    const newPos = currentHomeColumnPos + diceValue;
    return newPos <= HOME_COLUMN_SQUARES; // Can land exactly on finish or before
  }
  
  // Regular move on main path
  const newBoardPosition = piece.boardPosition + diceValue;
  const maxPosition = TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES;
  
  return newBoardPosition <= maxPosition;
};

export const movePiece = (piece: GamePiece, diceValue: number, allPlayers: Player[]) => {
  let newBoardPosition: number;
  let newPosition: Position;
  let isInHome = false;
  let isInHomeColumn = false;
  let isFinished = false;
  let gameMessage = '';
  let capturedPieces: GamePiece[] = [];

  if (piece.isInHome) {
    // Moving out of home
    newBoardPosition = START_POSITIONS[piece.color];
    newPosition = getBoardPosition(newBoardPosition);
    gameMessage = `${piece.color} piece entered the board!`;
  } else if (piece.isInHomeColumn) {
    // Moving in home column
    const currentHomeColumnPos = piece.boardPosition - TOTAL_MAIN_SQUARES;
    const newHomeColumnPos = currentHomeColumnPos + diceValue;
    
    if (newHomeColumnPos === HOME_COLUMN_SQUARES) {
      // Reached finish
      newBoardPosition = TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES;
      newPosition = { x: 7, y: 7 }; // Center finish position
      isFinished = true;
      gameMessage = `${piece.color} piece reached home!`;
    } else {
      // Still in home column
      newBoardPosition = TOTAL_MAIN_SQUARES + newHomeColumnPos;
      newPosition = getHomeColumnPosition(newHomeColumnPos);
      isInHomeColumn = true;
      gameMessage = `${piece.color} piece moved in home column.`;
    }
  } else {
    // Moving on main path
    newBoardPosition = piece.boardPosition + diceValue;
    
    // Check if entering home column
    const playerStartPos = START_POSITIONS[piece.color];
    const fullCirclePos = playerStartPos + 51; // 51 squares to complete circle
    
    if (newBoardPosition >= fullCirclePos) {
      // Enter home column
      const homeColumnPos = newBoardPosition - fullCirclePos;
      newBoardPosition = TOTAL_MAIN_SQUARES + homeColumnPos;
      newPosition = getHomeColumnPosition(homeColumnPos);
      isInHomeColumn = true;
      gameMessage = `${piece.color} piece entered home column!`;
    } else {
      // Regular move on main path
      if (newBoardPosition >= TOTAL_MAIN_SQUARES) {
        newBoardPosition = newBoardPosition - TOTAL_MAIN_SQUARES;
      }
      newPosition = getBoardPosition(newBoardPosition);
      gameMessage = `${piece.color} piece moved.`;
    }
  }

  // Check for captures (only on main path, not on safe squares)
  if (!isInHomeColumn && !isFinished && !SAFE_SQUARES.includes(newBoardPosition)) {
    allPlayers.forEach(player => {
      if (player.id !== piece.playerId) {
        player.pieces.forEach(otherPiece => {
          if (otherPiece.boardPosition === newBoardPosition && !otherPiece.isInHome && !otherPiece.isFinished) {
            capturedPieces.push(otherPiece);
            gameMessage += ` Captured ${otherPiece.color} piece!`;
          }
        });
      }
    });
  }

  const newPiece: GamePiece = {
    ...piece,
    position: newPosition,
    boardPosition: newBoardPosition,
    isInHome,
    isInHomeColumn,
    isFinished
  };

  return { newPiece, capturedPieces, gameMessage };
};

export const playSound = (soundType: 'dice' | 'move' | 'capture' | 'win' | 'enter') => {
  // Simple audio feedback using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const createTone = (frequency: number, duration: number, volume: number = 0.1) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  switch (soundType) {
    case 'dice':
      createTone(800, 0.1);
      setTimeout(() => createTone(600, 0.1), 100);
      break;
    case 'move':
      createTone(400, 0.2);
      break;
    case 'capture':
      createTone(300, 0.3);
      setTimeout(() => createTone(500, 0.2), 150);
      break;
    case 'enter':
      createTone(600, 0.2);
      setTimeout(() => createTone(800, 0.2), 100);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => createTone(freq, 0.3), i * 150);
      });
      break;
  }
};