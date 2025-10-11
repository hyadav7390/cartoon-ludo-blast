
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Player, GamePiece, PIECES_PER_PLAYER, TOTAL_MAIN_SQUARES, HOME_COLUMN_SQUARES } from '@/types/game';
import { START_POSITIONS, SAFE_SQUARES } from '@/utils/boardPositions';
import { canMovePiece, createInitialGameState, getHomePositionForPiece, getBoardPosition, getHomeColumnPosition } from '@/utils/gameUtils';

export const useGameLogic = (playerCount: number = 4) => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(playerCount)
  );

  const [turnTimer, setTurnTimer] = useState<number>(30);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  useEffect(() => {
    setGameState(createInitialGameState(playerCount));
    setTurnTimer(30);
    isAnimatingRef.current = false;
  }, [playerCount]);

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
      timerIntervalRef.current = interval;
      return () => {
        clearInterval(interval);
        timerIntervalRef.current = null;
      };
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [gameState.gameStatus, gameState.isRolling, gameState.diceValue, gameState.currentPlayerIndex, skipTurn]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

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
        const currentPlayerIndex = prev.currentPlayerIndex;
        const currentPlayer = prev.players[currentPlayerIndex];
        const newConsecutiveSixes = diceValue === 6 ? prev.consecutiveSixes + 1 : 0;
        const playersWithResetSkips = prev.players.map((player, index) =>
          index === currentPlayerIndex ? { ...player, skippedTurns: 0 } : player
        );

        if (newConsecutiveSixes === 3) {
          const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
          return {
            ...prev,
            players: playersWithResetSkips,
            isRolling: false,
            diceValue: null,
            currentPlayerIndex: nextPlayerIndex,
            consecutiveSixes: 0,
            gameMessage: `${currentPlayer.name} rolled three sixes! Turn skipped. ${prev.players[nextPlayerIndex].name}'s turn.`
          };
        }

        return {
          ...prev,
          players: playersWithResetSkips,
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

    const currentPlayerIndex = gameState.currentPlayerIndex;
    const currentPlayer = gameState.players[currentPlayerIndex];
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);

    if (!piece || !canMovePiece(piece, gameState.diceValue)) return;

    const diceValue = gameState.diceValue;
    const playerStartPos = START_POSITIONS[piece.color];
    const finishColumnIndex = HOME_COLUMN_SQUARES - 1;
    const finishBoardPosition = TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES;

    type Step = { boardPosition: number; x: number; y: number; isInHomeColumn: boolean; isFinished: boolean };
    const steps: Step[] = [];

    if (piece.isInHome && diceValue === 6) {
      const boardPos = playerStartPos;
      const pos = getBoardPosition(boardPos);
      steps.push({ boardPosition: boardPos, x: pos.x, y: pos.y, isInHomeColumn: false, isFinished: false });
    } else {
      let inHomeColumn = piece.isInHomeColumn;
      let currentBoardPos = piece.boardPosition;
      let currentHomePos = piece.isInHomeColumn ? piece.boardPosition - TOTAL_MAIN_SQUARES : -1;
      const homeEntryThreshold = TOTAL_MAIN_SQUARES - HOME_COLUMN_SQUARES;

      for (let step = 1; step <= diceValue; step++) {
        if (!inHomeColumn) {
          const normalized = (currentBoardPos >= playerStartPos)
            ? currentBoardPos - playerStartPos
            : TOTAL_MAIN_SQUARES - playerStartPos + currentBoardPos;
          const willEnterHome = normalized < homeEntryThreshold && normalized + 1 >= homeEntryThreshold;

          if (willEnterHome) {
            const stepsIntoHomeColumn = normalized + 1 - homeEntryThreshold;
            const nextHomePos = Math.min(stepsIntoHomeColumn, finishColumnIndex);

            if (nextHomePos >= finishColumnIndex) {
              steps.push({ boardPosition: finishBoardPosition, x: 7, y: 7, isInHomeColumn: false, isFinished: true });
              inHomeColumn = false;
              currentHomePos = finishColumnIndex;
              break;
            }

            const boardPos = TOTAL_MAIN_SQUARES + nextHomePos;
            const pos = getHomeColumnPosition(piece.color, nextHomePos);
            steps.push({ boardPosition: boardPos, x: pos.x, y: pos.y, isInHomeColumn: true, isFinished: false });
            inHomeColumn = true;
            currentHomePos = nextHomePos;
          } else {
            const boardPos = (currentBoardPos + 1) % TOTAL_MAIN_SQUARES;
            const pos = getBoardPosition(boardPos);
            steps.push({ boardPosition: boardPos, x: pos.x, y: pos.y, isInHomeColumn: false, isFinished: false });
            currentBoardPos = boardPos;
          }
        } else {
          const nextHomePos = currentHomePos + 1;
          if (nextHomePos >= finishColumnIndex) {
            steps.push({ boardPosition: finishBoardPosition, x: 7, y: 7, isInHomeColumn: false, isFinished: true });
            inHomeColumn = false;
            currentHomePos = finishColumnIndex;
            break;
          }

          const boardPos = TOTAL_MAIN_SQUARES + nextHomePos;
          const pos = getHomeColumnPosition(piece.color, nextHomePos);
          steps.push({ boardPosition: boardPos, x: pos.x, y: pos.y, isInHomeColumn: true, isFinished: false });
          currentHomePos = nextHomePos;
        }
      }
    }

    if (steps.length === 0) {
      return;
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
            const resolvedCurrentIndex = prev.players.findIndex(p => p.id === currentPlayer.id);
            const activeIndex = resolvedCurrentIndex === -1 ? prev.currentPlayerIndex : resolvedCurrentIndex;
            const updatedPlayers = prev.players.map(player => {
              if (player.id !== currentPlayer.id) {
                return player;
              }
              return {
                ...player,
                skippedTurns: 0,
                pieces: player.pieces.map(p => p.id === pieceId ? {
                  ...p,
                  position: { x: finalStep.x, y: finalStep.y },
                  boardPosition: finalStep.boardPosition,
                  isInHome: false,
                  isInHomeColumn: finalStep.isInHomeColumn,
                  isFinished: finalStep.isFinished
                } as GamePiece : p)
              } as Player;
            });

            const activePlayer = updatedPlayers[activeIndex];
            const finishedPieces = activePlayer.pieces.filter(p => p.isFinished);

            if (finishedPieces.length === PIECES_PER_PLAYER) {
              isAnimatingRef.current = false;
              return {
                ...prev,
                players: updatedPlayers,
                gameStatus: 'finished',
                winner: activePlayer,
                diceValue: null,
                gameMessage: `${activePlayer.name} wins the game!`
              } as GameState;
            }

            const shouldPassTurn = diceValue !== 6 || prev.consecutiveSixes >= 2;
            const nextPlayerIndex = shouldPassTurn
              ? (activeIndex + 1) % prev.players.length
              : activeIndex;
            const consecutiveSixes = diceValue === 6 && !shouldPassTurn
              ? prev.consecutiveSixes
              : 0;

            isAnimatingRef.current = false;
            return {
              ...prev,
              players: updatedPlayers,
              currentPlayerIndex: nextPlayerIndex,
              diceValue: null,
              consecutiveSixes,
              gameMessage: gameMessage + (nextPlayerIndex !== activeIndex ? ` ${updatedPlayers[nextPlayerIndex].name}'s turn.` : ' Roll again!')
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
    setGameState(createInitialGameState(playerCount));
    setTurnTimer(30);
  }, [playerCount]);

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
