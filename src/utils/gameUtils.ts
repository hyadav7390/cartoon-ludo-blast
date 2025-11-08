
import { GameState, Player, GamePiece, PlayerColor, Position, PLAYER_COLORS, HOME_POSITIONS, PIECES_PER_PLAYER, TOTAL_MAIN_SQUARES, HOME_COLUMN_SQUARES } from '@/types/game';
import { getBoardPosition, getHomeColumnPosition, START_POSITIONS, SAFE_SQUARES } from './boardPositions';

export const createInitialGameState = (playerCount: number): GameState => {
  const players: Player[] = PLAYER_COLORS.slice(0, playerCount).map((color, index) => ({
    id: `player-${index}`,
    address: `player-${index}`,
    name: `Player ${index + 1}`,
    color,
    pieces: createInitialPieces(color, index),
    isActive: index === 0,
    missedDeadlines: 0,
    playerIndex: index
  }));

  return {
    gameId: null,
    maxPlayers: playerCount,
    turnDuration: 30,
    turnDeadline: null,
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    gameStatus: 'waiting',
    winner: null,
    moveHistory: [],
    sixStreak: 0,
    gameMessage: 'Welcome to Ludo! Click Start Game to begin.',
    roller: null,
    activity: [],
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
    isFinished: false,
    pieceIndex: i
  }));
};

export const canMovePiece = (piece: GamePiece, diceValue: number): boolean => {
  if (piece.isFinished) return false;
  
  if (piece.isInHome) {
    return diceValue === 6;
  }
  
  if (piece.isInHomeColumn) {
    const currentHomePos = piece.boardPosition - TOTAL_MAIN_SQUARES;
    return currentHomePos + diceValue <= HOME_COLUMN_SQUARES - 1;
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
    const willFinish = newHomePos >= HOME_COLUMN_SQUARES - 1;

    if (willFinish) {
      newBoardPosition = TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES;
      newPosition = { x: 7, y: 7 }; // Center finish
      isFinished = true;
      gameMessage = `${piece.color} piece reached home!`;
    } else {
      newBoardPosition = TOTAL_MAIN_SQUARES + newHomePos;
      newPosition = getHomeColumnPosition(piece.color, newHomePos);
      isInHomeColumn = true;
      gameMessage = `${piece.color} piece moved in home column.`;
    }
  } else {
    // Moving on main path
    const playerStartPos = START_POSITIONS[piece.color];
    const newMainPathPos = (piece.boardPosition + diceValue) % TOTAL_MAIN_SQUARES;
    
    // Check if completing full circuit and entering home column
    const normalizedPos = (piece.boardPosition >= playerStartPos) 
      ? piece.boardPosition - playerStartPos 
      : TOTAL_MAIN_SQUARES - playerStartPos + piece.boardPosition;
    
    const wouldCompleteCircuit = normalizedPos + diceValue >= TOTAL_MAIN_SQUARES;
    const homeEntryThreshold = TOTAL_MAIN_SQUARES - HOME_COLUMN_SQUARES;
    const wouldEnterHomeColumn = normalizedPos < homeEntryThreshold && 
                                normalizedPos + diceValue >= homeEntryThreshold;
    
    if (wouldEnterHomeColumn) {
      // Calculate exact home column position
      const stepsIntoHomeColumn = normalizedPos + diceValue - homeEntryThreshold;
      const clampedHomePos = Math.min(stepsIntoHomeColumn, HOME_COLUMN_SQUARES - 1);
      if (clampedHomePos >= HOME_COLUMN_SQUARES - 1) {
        newBoardPosition = TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES;
        newPosition = { x: 7, y: 7 };
        isFinished = true;
        gameMessage = `${piece.color} piece reached home!`;
      } else {
        newBoardPosition = TOTAL_MAIN_SQUARES + clampedHomePos;
        newPosition = getHomeColumnPosition(piece.color, clampedHomePos);
        isInHomeColumn = true;
        gameMessage = `${piece.color} piece entered home column!`;
      }
    } else {
      // Regular move on main path
      newBoardPosition = newMainPathPos;
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
    isFinished,
    pieceIndex: piece.pieceIndex
  };

  return { newPiece, capturedPieces, gameMessage };
};

// This function handles returning a captured piece to its home position
export const getHomePositionForPiece = (piece: GamePiece): Position => {
  // Get the center position based on color
  let centerPosition: Position;
  
  switch(piece.color) {
    case 'red':
      centerPosition = { x: 3, y: 11 };
      break;
    case 'blue':
      centerPosition = { x: 3, y: 3 };
      break;
    case 'green':
      centerPosition = { x: 11, y: 3 };
      break;
    case 'yellow':
      centerPosition = { x: 11, y: 11 };
      break;
  }
  
  // Use the piece index to determine position offset
  const pieceIndex = parseInt(piece.id.split('-')[1]);
  const offsets = [
    { x: 0, y: 0 },
    { x: 0.3, y: -0.3 },
    { x: -0.3, y: -0.3 },
    { x: -0.3, y: 0.3 }
  ];
  
  return {
    x: centerPosition.x + offsets[pieceIndex].x,
    y: centerPosition.y + offsets[pieceIndex].y
  };
};

export { getBoardPosition, getHomeColumnPosition };

let sharedAudioContext: AudioContext | null = null;

const getSharedAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioContextConstructor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContextConstructor();
  }
  return sharedAudioContext;
};

export const playSound = (soundType: 'dice' | 'move' | 'capture' | 'win' | 'enter') => {
  try {
    const audioContext = getSharedAudioContext();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    
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
