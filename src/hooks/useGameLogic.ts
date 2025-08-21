
import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, GamePiece, PlayerColor, GameMove, PLAYER_COLORS, HOME_POSITIONS, PIECES_PER_PLAYER } from '@/types/game';
import { START_POSITIONS, SAFE_SQUARES } from '@/utils/boardPositions';
import { canMovePiece, movePiece, createInitialGameState } from '@/utils/gameUtils';

export const useGameLogic = (playerCount: number = 4) => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(playerCount)
  );

  const [turnTimer, setTurnTimer] = useState<number>(30);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const skipTurn = useCallback(() => {
    setGameState((prev) => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const updatedPlayer = {
        ...currentPlayer,
        skippedTurns: currentPlayer.skippedTurns + 1
      };
      
      if (updatedPlayer.skippedTurns >= 3) {
        const remainingPlayers = prev.players.filter(p => p.id !== currentPlayer.id);
        if (remainingPlayers.length === 1) {
          return {
            ...prev,
            gameStatus: 'finished',
            winner: remainingPlayers[0],
            gameMessage: `${remainingPlayers[0].name} wins! ${currentPlayer.name} was eliminated.`
          };
        }
      }

      const updatedPlayers = prev.players.map(p => p.id === currentPlayer.id ? updatedPlayer : p);
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        consecutiveSixes: 0,
        gameMessage: `${currentPlayer.name} skipped turn. ${prev.players[nextPlayerIndex].name}'s turn.`
      };
    });
    setTurnTimer(30);
  }, []);

  // Timer logic - fixed dependency issue
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.diceValue === null && !gameState.isRolling) {
      const interval = setInterval(() => {
        setTurnTimer((prev) => {
          if (prev <= 1) {
            skipTurn();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [gameState.gameStatus, gameState.isRolling, gameState.diceValue, gameState.currentPlayerIndex, skipTurn]);

  // Auto-advance when no valid moves or only 1 valid move
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.diceValue !== null) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const validMoves = currentPlayer.pieces.filter(piece => canMovePiece(piece, gameState.diceValue!));
      
      if (validMoves.length === 0) {
        // No valid moves - auto advance after 2 seconds
        const timer = setTimeout(() => {
          const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
          const nextPlayer = gameState.players[nextPlayerIndex];
          
          setGameState(prev => ({
            ...prev,
            diceValue: null,
            currentPlayerIndex: nextPlayerIndex,
            consecutiveSixes: 0,
            gameMessage: `No valid moves. ${nextPlayer.name}'s turn.`
          }));
          setTurnTimer(30);
        }, 2000);
        
        return () => clearTimeout(timer);
      } else if (validMoves.length === 1) {
        // Only 1 valid move - auto advance after 1 second
        const timer = setTimeout(() => {
          const pieceToMove = validMoves[0];
          movePieceHandler(pieceToMove.id);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.diceValue, gameState.gameStatus, gameState.currentPlayerIndex, gameState.players]);

  const rollDice = useCallback(() => {
    if (gameState.isRolling || gameState.diceValue !== null) return;

    setGameState(prev => ({ ...prev, isRolling: true, gameMessage: 'Rolling dice...' }));
    setTurnTimer(30);

    setTimeout(() => {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      
      setGameState(prev => {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const newConsecutiveSixes = diceValue === 6 ? prev.consecutiveSixes + 1 : 0;
        
        if (newConsecutiveSixes === 3) {
          const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
          return {
            ...prev,
            isRolling: false,
            diceValue: null,
            currentPlayerIndex: nextPlayerIndex,
            consecutiveSixes: 0,
            gameMessage: `${currentPlayer.name} rolled three sixes! Turn skipped. ${prev.players[nextPlayerIndex].name}'s turn.`
          };
        }

        return {
          ...prev,
          isRolling: false,
          diceValue,
          consecutiveSixes: newConsecutiveSixes,
          gameMessage: `${currentPlayer.name} rolled a ${diceValue}.`
        };
      });
    }, 1000);
  }, [gameState.isRolling, gameState.diceValue, gameState.currentPlayerIndex, gameState.consecutiveSixes, gameState.players]);

  const getValidMoves = useCallback((diceValue: number): string[] => {
    if (!diceValue) return [];
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const validMoves: string[] = [];
    
    currentPlayer.pieces.forEach(piece => {
      if (canMovePiece(piece, diceValue)) {
        validMoves.push(piece.id);
      }
    });
    
    return validMoves;
  }, [gameState.players, gameState.currentPlayerIndex]);

  const movePieceHandler = useCallback((pieceId: string) => {
    if (!gameState.diceValue) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    
    if (!piece || !canMovePiece(piece, gameState.diceValue)) return;
    
    const { newPiece, capturedPieces, gameMessage } = movePiece(piece, gameState.diceValue, gameState.players);
    
    setGameState(prev => {
      // Update the moved piece
      const updatedPlayers = prev.players.map(player => {
        if (player.id === currentPlayer.id) {
          return {
            ...player,
            pieces: player.pieces.map(p => p.id === pieceId ? newPiece : p)
          };
        }
        return player;
      });
      
      // Handle captured pieces
      if (capturedPieces.length > 0) {
        updatedPlayers.forEach(player => {
          player.pieces.forEach(p => {
            if (capturedPieces.some(captured => captured.id === p.id)) {
              p.position = HOME_POSITIONS[p.color][parseInt(p.id.split('-')[1])];
              p.boardPosition = -1;
              p.isInHome = true;
              p.isInHomeColumn = false;
              p.isFinished = false;
            }
          });
        });
      }
      
      // Check for win condition
      const updatedCurrentPlayer = updatedPlayers[gameState.currentPlayerIndex];
      const finishedPieces = updatedCurrentPlayer.pieces.filter(p => p.isFinished);
      
      if (finishedPieces.length === PIECES_PER_PLAYER) {
        return {
          ...prev,
          players: updatedPlayers,
          gameStatus: 'finished',
          winner: updatedCurrentPlayer,
          diceValue: null,
          gameMessage: `${updatedCurrentPlayer.name} wins the game!`
        };
      }
      
      // Determine next player
      let nextPlayerIndex = gameState.currentPlayerIndex;
      if (gameState.diceValue !== 6 || gameState.consecutiveSixes >= 2) {
        nextPlayerIndex = (gameState.currentPlayerIndex + 1) % prev.players.length;
      }
      
      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        consecutiveSixes: gameState.diceValue === 6 ? gameState.consecutiveSixes : 0,
        gameMessage: gameMessage + (nextPlayerIndex !== gameState.currentPlayerIndex ? ` ${updatedPlayers[nextPlayerIndex].name}'s turn.` : ' Roll again!')
      };
    });
    
    setTurnTimer(30);
  }, [gameState.diceValue, gameState.players, gameState.currentPlayerIndex, gameState.consecutiveSixes]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      gameMessage: 'Game started! Red player\'s turn.'
    }));
    setTurnTimer(30);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState(gameState.players.length));
    setTurnTimer(30);
  }, [gameState.players.length]);

  return {
    gameState,
    turnTimer,
    rollDice,
    movePieceHandler,
    getValidMoves,
    startGame,
    resetGame
  };
};
