
import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, GamePiece, PlayerColor, GameMove, PLAYER_COLORS, START_POSITIONS, SAFE_SQUARES, HOME_POSITIONS, PIECES_PER_PLAYER } from '@/types/game';
import { getBoardPosition, canMovePiece, movePiece, createInitialGameState } from '@/utils/gameUtils';

export const useGameLogic = (playerCount: number = 4) => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(playerCount)
  );

  const [turnTimer, setTurnTimer] = useState<number>(30);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Timer logic
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
  }, [gameState.gameStatus, gameState.isRolling, gameState.diceValue, gameState.currentPlayerIndex]);

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
          gameMessage: `${currentPlayer.name} rolled ${diceValue}!`
        };
      });
    }, 1200);
  }, [gameState.isRolling, gameState.diceValue]);

  const movePieceOnBoard = useCallback((pieceId: string) => {
    if (!gameState.diceValue) return;

    setGameState(prev => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const piece = currentPlayer.pieces.find(p => p.id === pieceId);
      
      if (!piece || !canMovePiece(piece, prev.diceValue!)) {
        return prev;
      }

      const { newPiece, capturedPieces, gameMessage } = movePiece(piece, prev.diceValue!, prev.players);
      
      const updatedPlayers = prev.players.map(player => {
        if (player.id === currentPlayer.id) {
          return {
            ...player,
            pieces: player.pieces.map(p => p.id === pieceId ? newPiece : p),
            skippedTurns: 0
          };
        }
        
        if (capturedPieces.length > 0) {
          const capturedPieceIds = capturedPieces.map(cp => cp.id);
          if (player.pieces.some(p => capturedPieceIds.includes(p.id))) {
            return {
              ...player,
              pieces: player.pieces.map(p => 
                capturedPieceIds.includes(p.id) 
                  ? { ...p, boardPosition: -1, isInHome: true, isInHomeColumn: false, position: HOME_POSITIONS[p.color][parseInt(p.id.split('-')[1])] }
                  : p
              )
            };
          }
        }
        
        return player;
      });

      const playerPieces = updatedPlayers.find(p => p.id === currentPlayer.id)?.pieces || [];
      const finishedPieces = playerPieces.filter(p => p.isFinished);
      
      if (finishedPieces.length === PIECES_PER_PLAYER) {
        return {
          ...prev,
          players: updatedPlayers,
          gameStatus: 'finished',
          winner: currentPlayer,
          gameMessage: `🎉 ${currentPlayer.name} wins! 🎉`,
          diceValue: null
        };
      }

      const shouldGetAnotherTurn = prev.diceValue === 6 && prev.consecutiveSixes < 2;
      const nextPlayerIndex = shouldGetAnotherTurn 
        ? prev.currentPlayerIndex 
        : (prev.currentPlayerIndex + 1) % prev.players.length;

      return {
        ...prev,
        players: updatedPlayers,
        diceValue: null,
        currentPlayerIndex: nextPlayerIndex,
        consecutiveSixes: shouldGetAnotherTurn ? prev.consecutiveSixes : 0,
        gameMessage: shouldGetAnotherTurn 
          ? `${gameMessage} Roll again!`
          : `${gameMessage} ${prev.players[nextPlayerIndex].name}'s turn.`
      };
    });
    setTurnTimer(30);
  }, [gameState.diceValue]);

  const getValidMoves = useCallback((playerId: string): GamePiece[] => {
    if (!gameState.diceValue) return [];
    
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return [];
    
    return player.pieces.filter(piece => canMovePiece(piece, gameState.diceValue!));
  }, [gameState.diceValue, gameState.players]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState(gameState.players.length));
    setTurnTimer(30);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [gameState.players.length, timerInterval]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      gameStatus: 'playing',
      gameMessage: `${prev.players[0].name}'s turn. Roll the dice!`
    }));
    setTurnTimer(30);
  }, []);

  return {
    gameState,
    turnTimer,
    rollDice,
    movePieceOnBoard,
    getValidMoves,
    resetGame,
    startGame,
    skipTurn
  };
};
