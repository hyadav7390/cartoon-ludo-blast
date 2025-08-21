
import React, { useState, useEffect } from 'react';
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

export const Game: React.FC<GameProps> = ({ playerCount: initialPlayerCount = 4 }) => {
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playerCount = selectedPlayerCount || initialPlayerCount;
  
  const {
    gameState,
    turnTimer,
    rollDice,
    movePieceHandler,
    getValidMoves,
    resetGame,
    startGame
  } = useGameLogic(playerCount);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const validMoves = gameState.diceValue ? getValidMoves(gameState.diceValue) : [];

  const handleDiceRoll = () => {
    if (soundEnabled) playSound('dice');
    rollDice();
  };

  const handlePieceMove = (pieceId: string) => {
    if (soundEnabled) playSound('move');
    movePieceHandler(pieceId);
  };

  const handlePlayAgain = () => {
    setSelectedPlayerCount(null);
    resetGame();
  };

  const handlePlayerCountSelect = (count: number) => {
    setSelectedPlayerCount(count);
  };

  // Player selection screen
  if (selectedPlayerCount === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(25_15%_8%)] to-[hsl(35_20%_12%)]">
        <div className="max-w-lg w-full text-center game-card">
          <div className="space-y-8">
            <div className="text-6xl">🎲</div>
            <h1 className="text-4xl font-bold text-shadow">
              LUDO
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Choose your adventure and let the fun begin!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[2, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountSelect(count)}
                  className="game-button"
                >
                  <div className="text-3xl mb-2">
                    {count === 2 ? '👥' : '👨‍👩‍👧‍👦'}
                  </div>
                  <div className="text-xl">{count} Players</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for game to start
  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(25_15%_8%)] to-[hsl(35_20%_12%)]">
        <div className="max-w-2xl w-full text-center game-card">
          <div className="space-y-8">
            <div className="text-6xl">🎲</div>
            <h1 className="text-4xl font-bold text-shadow">
              LUDO
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Ready to play with {playerCount} players!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {gameState.players.map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    "game-card p-4 text-center",
                    `border-2 border-[hsl(var(--${player.color}-600))]`
                  )}
                >
                  <div className="text-2xl mb-2">
                    {player.color === 'red' ? '🔴' : 
                     player.color === 'blue' ? '🔵' : 
                     player.color === 'green' ? '🟢' : '🟡'}
                  </div>
                  <div className="font-bold text-lg">{player.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{player.color}</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={startGame}
              className="game-button success text-xl px-8 py-4"
            >
              🚀 Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game finished
  if (gameState.gameStatus === 'finished' && gameState.winner) {
    return (
      <WinScreen
        winner={gameState.winner}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Main game
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-[hsl(25_15%_8%)] to-[hsl(35_20%_12%)]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-shadow">LUDO</h1>
            <p className="text-muted-foreground font-medium">
              {gameState.gameMessage}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "game-button text-sm px-4 py-2",
                soundEnabled ? "success" : "bg-muted text-muted-foreground"
              )}
            >
              {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
            </button>
            
            <button
              onClick={resetGame}
              className="game-button text-sm px-4 py-2"
            >
              🔄 New Game
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Layout - Fixed Vintage Style */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Panel - Players 1 & 2 */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-center text-shadow">Players</h2>
          {gameState.players.slice(0, 2).map((player, index) => (
            <PlayerIndicator
              key={player.id}
              player={player}
              isActive={gameState.players.indexOf(player) === gameState.currentPlayerIndex}
              timer={gameState.players.indexOf(player) === gameState.currentPlayerIndex ? turnTimer : undefined}
            />
          ))}
        </div>

        {/* Center - Game Board */}
        <div className="xl:col-span-8 flex flex-col items-center space-y-6">
          <GameMessage message={gameState.gameMessage} />
          <GameBoard
            gameState={gameState}
            onPieceClick={handlePieceMove}
            validMoves={validMoves}
          />
        </div>

        {/* Right Panel - Players 3 & 4 + Dice */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-center text-shadow">Players</h2>
          {gameState.players.slice(2, 4).map((player, index) => (
            <PlayerIndicator
              key={player.id}
              player={player}
              isActive={gameState.players.indexOf(player) === gameState.currentPlayerIndex}
              timer={gameState.players.indexOf(player) === gameState.currentPlayerIndex ? turnTimer : undefined}
            />
          ))}
          
          {/* Dice positioned on the right side */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-center text-shadow mb-4">Dice</h3>
            <Dice
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              onRoll={handleDiceRoll}
              disabled={gameState.diceValue !== null || gameState.gameStatus !== 'playing'}
            />
          </div>

          {/* Game Status Messages */}
          <div className="space-y-3">
            {gameState.diceValue && validMoves.length === 0 && (
              <div className="game-card text-center">
                <p className="text-sm font-bold text-warning">⚠️ No valid moves!</p>
                <p className="text-xs text-muted-foreground mt-1">Auto-advancing turn...</p>
              </div>
            )}

            {validMoves.length > 0 && (
              <div className="game-card text-center">
                <p className="text-sm font-bold text-success">✨ Click a glowing piece!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {validMoves.length} piece{validMoves.length > 1 ? 's' : ''} can move
                </p>
              </div>
            )}

            {gameState.consecutiveSixes > 0 && (
              <div className="game-card text-center">
                <p className="text-sm font-bold text-warning">
                  🎲 {gameState.consecutiveSixes} consecutive 6{gameState.consecutiveSixes > 1 ? 's' : ''}!
                </p>
                <p className="text-xs text-muted-foreground">
                  {gameState.consecutiveSixes === 2 ? 'One more 6 ends your turn!' : 'Keep rolling!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
