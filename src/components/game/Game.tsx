import React, { useState } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import { GameBoard } from './GameBoard';
import { Dice } from './Dice';
import { PlayerIndicator } from './PlayerIndicator';
import { GameMessage } from './GameMessage';
import { WinScreen } from './WinScreen';
import { playSound } from '@/utils/gameUtils';
import { cn } from '@/lib/utils';

interface GameProps {
  playerCount?: number;
}

export const Game: React.FC<GameProps> = ({ playerCount = 4 }) => {
  const {
    gameState,
    turnTimer,
    rollDice,
    movePieceOnBoard,
    getValidMoves,
    resetGame,
    startGame
  } = useGameLogic(playerCount);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const validMoves = currentPlayer ? getValidMoves(currentPlayer.id).map(p => p.id) : [];

  const handleDiceRoll = () => {
    if (soundEnabled) playSound('dice');
    rollDice();
  };

  const handlePieceMove = (pieceId: string) => {
    if (soundEnabled) playSound('move');
    movePieceOnBoard(pieceId);
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="game-card max-w-md w-full text-center animate-bounce-in">
          <div className="space-y-6">
            <div className="text-6xl animate-celebration">🎲</div>
            <h1 className="text-3xl font-bold text-shadow">Welcome to Ludo!</h1>
            <p className="text-muted-foreground">
              Get ready for an exciting game of Ludo with {playerCount} players.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Rules:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Roll 6 to get your pieces out</li>
                <li>• Capture opponents by landing on them</li>
                <li>• Safe squares (★) protect your pieces</li>
                <li>• First to get all 4 pieces home wins!</li>
                <li>• 30 seconds per turn</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="game-button success text-success-foreground"
                onClick={startGame}
              >
                🚀 Start Game
              </button>
              
              <div className="flex items-center justify-center space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <span>Sound Effects</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-shadow mb-2">
            🎲 Cartoonish Ludo 🎲
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'px-3 py-1 rounded-lg transition-all',
                soundEnabled ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={resetGame}
              className="px-3 py-1 bg-destructive text-destructive-foreground rounded-lg hover:scale-105 transition-all"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Players */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-center">Players</h2>
            {gameState.players.map((player, index) => (
              <PlayerIndicator
                key={player.id}
                player={player}
                isActive={index === gameState.currentPlayerIndex}
                timer={index === gameState.currentPlayerIndex ? turnTimer : undefined}
              />
            ))}
          </div>

          {/* Center - Game Board */}
          <div className="flex flex-col items-center space-y-4">
            <GameMessage message={gameState.gameMessage} />
            <GameBoard
              gameState={gameState}
              onPieceClick={handlePieceMove}
              validMoves={validMoves}
            />
          </div>

          {/* Right Panel - Dice & Controls */}
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-lg font-bold">Game Controls</h2>
            
            <Dice
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              onRoll={handleDiceRoll}
              disabled={gameState.diceValue !== null || gameState.gameStatus !== 'playing'}
            />

            {gameState.diceValue && validMoves.length === 0 && (
              <div className="game-card text-center animate-fade-in-scale">
                <p className="text-sm text-muted-foreground">
                  No valid moves available!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Turn will end automatically...
                </p>
              </div>
            )}

            {validMoves.length > 0 && (
              <div className="game-card text-center animate-fade-in-scale">
                <p className="text-sm font-semibold">
                  Click a glowing piece to move!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {validMoves.length} piece{validMoves.length > 1 ? 's' : ''} can move
                </p>
              </div>
            )}

            {gameState.consecutiveSixes > 0 && (
              <div className="game-card bg-warning/20 border-warning/30 text-center animate-bounce-in">
                <p className="text-sm font-bold text-warning">
                  🎲 {gameState.consecutiveSixes} consecutive 6{gameState.consecutiveSixes > 1 ? 's' : ''}!
                </p>
                <p className="text-xs text-warning/80">
                  {gameState.consecutiveSixes === 2 ? 'One more 6 ends your turn!' : 'Keep rolling!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Win Screen */}
      {gameState.gameStatus === 'finished' && gameState.winner && (
        <WinScreen winner={gameState.winner} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
};