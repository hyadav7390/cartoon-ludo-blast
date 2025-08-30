
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Player, GamePiece, PlayerColor, GameMove, PLAYER_COLORS, HOME_POSITIONS, PIECES_PER_PLAYER, TOTAL_MAIN_SQUARES, HOME_COLUMN_SQUARES } from '@/types/game';
import { START_POSITIONS, SAFE_SQUARES } from '@/utils/boardPositions';
import { canMovePiece, movePiece, createInitialGameState, getHomePositionForPiece, getBoardPosition, getHomeColumnPosition } from '@/utils/gameUtils';

export const useGameLogic = (playerCount: number = 4) => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(playerCount)
  );

  const [turnTimer, setTurnTimer] = useState<number>(30);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

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
    if (gameState.gameStatus === 'playing' && gameState.diceValue === null && !gameState.isRolling && !isAnimatingRef.current) {
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
    if (gameState.isRolling || gameState.diceValue !== null || isAnimatingRef.current) return;

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
    if (!gameState.diceValue || isAnimatingRef.current) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    
    if (!piece || !canMovePiece(piece, gameState.diceValue)) return;

    const diceValue = gameState.diceValue;
    const playerStartPos = START_POSITIONS[piece.color];

    // Build step-by-step path
    type Step = { boardPosition: number; x: number; y: number; isInHomeColumn: boolean; isFinished: boolean };
    const steps: Step[] = [];

    if (piece.isInHome && diceValue === 6) {
      const bp = playerStartPos;
      const pos = getBoardPosition(bp);
      steps.push({ boardPosition: bp, x: pos.x, y: pos.y, isInHomeColumn: false, isFinished: false });
    } else if (piece.isInHomeColumn) {
      let currentHomePos = piece.boardPosition - TOTAL_MAIN_SQUARES; // 0..5 typically
      for (let s = 1; s <= diceValue; s++) {
        const newHomePos = currentHomePos + 1;
        const isFinish = newHomePos === HOME_COLUMN_SQUARES;
        const bp = isFinish ? TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES : TOTAL_MAIN_SQUARES + newHomePos;
        const pos = isFinish ? { x: 7, y: 7 } : getHomeColumnPosition(piece.color, newHomePos);
        steps.push({ boardPosition: bp, x: pos.x, y: pos.y, isInHomeColumn: !isFinish, isFinished: isFinish });
        currentHomePos = newHomePos;
      }
    } else {
      // Moving on main path, possibly entering home column
      let currentBoardPos = piece.boardPosition; // 0..51
      let inHomeColumn = false;
      let currentHomePos = -1;

      for (let s = 1; s <= diceValue; s++) {
        if (!inHomeColumn) {
          const normalized = (currentBoardPos >= playerStartPos)
            ? currentBoardPos - playerStartPos
            : TOTAL_MAIN_SQUARES - playerStartPos + currentBoardPos;

          const willEnterHome = normalized + 1 >= TOTAL_MAIN_SQUARES - 6 && normalized < TOTAL_MAIN_SQUARES - 6;

          if (willEnterHome) {
            const stepsIntoHomeColumn = normalized + 1 - (TOTAL_MAIN_SQUARES - 6);
            const bp = TOTAL_MAIN_SQUARES + stepsIntoHomeColumn; // 52..57
            const pos = getHomeColumnPosition(piece.color, stepsIntoHomeColumn);
            steps.push({ boardPosition: bp, x: pos.x, y: pos.y, isInHomeColumn: true, isFinished: false });
            inHomeColumn = true;
            currentHomePos = stepsIntoHomeColumn;
          } else {
            const bp = (currentBoardPos + 1) % TOTAL_MAIN_SQUARES;
            const pos = getBoardPosition(bp);
            steps.push({ boardPosition: bp, x: pos.x, y: pos.y, isInHomeColumn: false, isFinished: false });
            currentBoardPos = bp;
          }
        } else {
          // Already in home column
          const newHomePos = currentHomePos + 1;
          const isFinish = newHomePos === HOME_COLUMN_SQUARES;
          const bp = isFinish ? TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES : TOTAL_MAIN_SQUARES + newHomePos;
          const pos = isFinish ? { x: 7, y: 7 } : getHomeColumnPosition(piece.color, newHomePos);
          steps.push({ boardPosition: bp, x: pos.x, y: pos.y, isInHomeColumn: !isFinish, isFinished: isFinish });
          currentHomePos = newHomePos;
        }
      }
    }

    // Run animation
    isAnimatingRef.current = true;
    const perStepDelayMs = 140;

    const applyStep = (stepIndex: number) => {
      const step = steps[stepIndex];
      setGameState(prev => {
        const updatedPlayers = prev.players.map(player => {
          if (player.id !== currentPlayer.id) return player;
          return {
            ...player,
            pieces: player.pieces.map(p => {
              if (p.id !== pieceId) return p;
              return {
                ...p,
                position: { x: step.x, y: step.y },
                boardPosition: step.boardPosition,
                isInHome: false,
                isInHomeColumn: step.isInHomeColumn,
                isFinished: step.isFinished
              } as GamePiece;
            })
          } as Player;
        });
        return { ...prev, players: updatedPlayers } as GameState;
      });

      if (stepIndex + 1 < steps.length) {
        setTimeout(() => applyStep(stepIndex + 1), perStepDelayMs);
      } else {
        // Finalize: handle captures, messages, turn progression
        setTimeout(() => {
          const finalStep = steps[steps.length - 1];
          let gameMessage = '';
          const capturedPieces: GamePiece[] = [];

          // Determine message type
          if (piece.isInHome && diceValue === 6) {
            gameMessage = `${currentPlayer.name} entered the board!`;
          } else if (finalStep.isFinished) {
            gameMessage = `${currentPlayer.name} reached home!`;
          } else if (finalStep.isInHomeColumn) {
            gameMessage = `${currentPlayer.name} entered home column!`;
          } else {
            gameMessage = `${currentPlayer.name} moved.`;
          }

          // Capture only if ending on main path and not on safe square
          if (!finalStep.isInHomeColumn && !finalStep.isFinished && !SAFE_SQUARES.includes(finalStep.boardPosition)) {
            setGameState(prev => {
              const updatedPlayers = prev.players.map(player => {
                if (player.id === currentPlayer.id) return player;
                const updatedPieces = player.pieces.map(op => {
                  if (op.boardPosition === finalStep.boardPosition && !op.isInHome && !op.isFinished) {
                    capturedPieces.push(op);
                    const homePos = getHomePositionForPiece(op);
                    return { ...op, position: homePos, boardPosition: -1, isInHome: true, isInHomeColumn: false, isFinished: false } as GamePiece;
                  }
                  return op;
                });
                return { ...player, pieces: updatedPieces } as Player;
              });
              return { ...prev, players: updatedPlayers } as GameState;
            });
            if (capturedPieces.length > 0) {
              gameMessage += ` Captured ${capturedPieces.length} piece${capturedPieces.length > 1 ? 's' : ''}!`;
            }
          }

          // Final state update: next player / win
          setGameState(prev => {
            const updatedPlayers = prev.players.map(player => player.id === currentPlayer.id ? {
              ...player,
              pieces: player.pieces.map(p => p.id === pieceId ? {
                ...p,
                position: { x: finalStep.x, y: finalStep.y },
                boardPosition: finalStep.boardPosition,
                isInHome: false,
                isInHomeColumn: finalStep.isInHomeColumn,
                isFinished: finalStep.isFinished
              } as GamePiece : p)
            } as Player : player);

            const updatedCurrentPlayer = updatedPlayers[gameState.currentPlayerIndex];
            const finishedPieces = updatedCurrentPlayer.pieces.filter(p => p.isFinished);

            if (finishedPieces.length === PIECES_PER_PLAYER) {
              isAnimatingRef.current = false;
              return {
                ...prev,
                players: updatedPlayers,
                gameStatus: 'finished',
                winner: updatedCurrentPlayer,
                diceValue: null,
                gameMessage: `${updatedCurrentPlayer.name} wins the game!`
              } as GameState;
            }

            let nextPlayerIndex = gameState.currentPlayerIndex;
            if (diceValue !== 6 || gameState.consecutiveSixes >= 2) {
              nextPlayerIndex = (gameState.currentPlayerIndex + 1) % prev.players.length;
            }

            isAnimatingRef.current = false;
            return {
              ...prev,
              players: updatedPlayers,
              currentPlayerIndex: nextPlayerIndex,
              diceValue: null,
              consecutiveSixes: diceValue === 6 ? gameState.consecutiveSixes : 0,
              gameMessage: gameMessage + (nextPlayerIndex !== gameState.currentPlayerIndex ? ` ${updatedPlayers[nextPlayerIndex].name}'s turn.` : ' Roll again!')
            } as GameState;
          });
          setTurnTimer(30);
        }, perStepDelayMs);
      }
    };

    applyStep(0);
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
