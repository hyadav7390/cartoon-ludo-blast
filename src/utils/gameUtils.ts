
import { GameState, Player, GamePiece, PlayerColor, Position, PLAYER_COLORS, HOME_POSITIONS, PIECES_PER_PLAYER, TOTAL_MAIN_SQUARES, HOME_COLUMN_SQUARES } from '@/types/game';
import { getBoardPosition, getHomeColumnPosition, START_POSITIONS, SAFE_SQUARES } from './boardPositions';

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
    boardPosition: -1,
    isInHome: true,
    isInHomeColumn: false,
    isFinished: false
  }));
};

export const canMovePiece = (piece: GamePiece, diceValue: number): boolean => {
  if (piece.isFinished) return false;
  
  if (piece.isInHome) {
    return diceValue === 6;
  }
  
  if (piece.isInHomeColumn) {
    const currentHomePos = piece.boardPosition - TOTAL_MAIN_SQUARES;
    return currentHomePos + diceValue <= HOME_COLUMN_SQUARES;
  }
  
  return true;
};

export const movePiece = (piece: GamePiece, diceValue: number, allPlayers: Player[]) => {
  let newBoardPosition: number;
  let newPosition: Position;
  const isInHome = false;
  let isInHomeColumn = false;
  let isFinished = false;
  let gameMessage = '';
  const capturedPieces: GamePiece[] = [];

  if (piece.isInHome && diceValue === 6) {
    // Move piece out of home
    newBoardPosition = START_POSITIONS[piece.color];
    newPosition = getBoardPosition(newBoardPosition);
    gameMessage = `${piece.color} piece entered the board!`;
  } else if (piece.isInHomeColumn) {
    // Moving in home column
    const currentHomePos = piece.boardPosition - TOTAL_MAIN_SQUARES;
    const newHomePos = currentHomePos + diceValue;
    
    if (newHomePos === HOME_COLUMN_SQUARES) {
      // Finished!
      newBoardPosition = TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES;
      newPosition = { x: 7, y: 7 };
      isFinished = true;
      gameMessage = `${piece.color} piece reached home!`;
    } else {
      // Still in home column
      newBoardPosition = TOTAL_MAIN_SQUARES + newHomePos;
      newPosition = getHomeColumnPosition(piece.color, newHomePos);
      isInHomeColumn = true;
      gameMessage = `${piece.color} piece moved in home column.`;
    }
  } else {
    // Moving on main path
    const playerStartPos = START_POSITIONS[piece.color];
    const newMainPathPos = piece.boardPosition + diceValue;
    
    // Check if completing full circuit and entering home column
    const distanceFromStart = (piece.boardPosition - playerStartPos + TOTAL_MAIN_SQUARES) % TOTAL_MAIN_SQUARES;
    const newDistanceFromStart = distanceFromStart + diceValue;
    
    if (newDistanceFromStart >= 51) {
      // Enter home column
      const homeColumnPos = newDistanceFromStart - 51;
      newBoardPosition = TOTAL_MAIN_SQUARES + homeColumnPos;
      newPosition = getHomeColumnPosition(piece.color, homeColumnPos);
      isInHomeColumn = true;
      gameMessage = `${piece.color} piece entered home column!`;
    } else {
      // Regular move on main path
      newBoardPosition = newMainPathPos % TOTAL_MAIN_SQUARES;
      newPosition = getBoardPosition(newBoardPosition);
      gameMessage = `${piece.color} piece moved.`;
      
      // Check for captures
      if (!SAFE_SQUARES.includes(newBoardPosition)) {
        allPlayers.forEach(player => {
          if (player.id !== piece.playerId) {
            player.pieces.forEach(otherPiece => {
              if (otherPiece.boardPosition === newBoardPosition && 
                  !otherPiece.isInHome && !otherPiece.isFinished) {
                capturedPieces.push(otherPiece);
                gameMessage += ` Captured ${otherPiece.color} piece!`;
              }
            });
          }
        });
      }
    }
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

export { getBoardPosition, getHomeColumnPosition };

export const playSound = (soundType: 'dice' | 'move' | 'capture' | 'win' | 'enter') => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
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
  } catch (error) {
    console.log('Audio not available');
  }
};
