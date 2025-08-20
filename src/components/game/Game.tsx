
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

  // Auto-advance turn when no valid moves
  useEffect(() => {
    if (gameState.diceValue !== null && validMoves.length === 0 && gameState.gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        const nextPlayer = gameState.players[nextPlayerIndex];
        
        // Reset game state for next turn
        setGameState(prev => ({
          ...prev,
          diceValue: null,
          currentPlayerIndex: nextPlayerIndex,
          consecutiveSixes: 0,
          gameMessage: `No valid moves. ${nextPlayer.name}'s turn.`
        }));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.diceValue, validMoves.length, gameState.gameStatus, gameState.currentPlayerIndex]);

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-6xl animate-bounce">🎲</div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Ludo!</h1>
            <p className="text-gray-600">
              Get ready for an exciting game of Ludo with {playerCount} players.
            </p>
            
            <div className="space-y-4 text-left bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-center">Quick Rules:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Roll 6 to get your pieces out of home</li>
                <li>• Capture opponents by landing on them</li>
                <li>• Safe squares (★) protect your pieces</li>
                <li>• First to get all 4 pieces home wins!</li>
                <li>• 30 seconds per turn</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            🎲 Cartoonish Ludo 🎲
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'px-4 py-2 rounded-lg transition-all font-medium',
                soundEnabled 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              )}
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
            >
              🔄 Reset Game
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Players */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-gray-800">Players</h2>
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
          <div className="lg:col-span-2 flex flex-col items-center space-y-4">
            <GameMessage message={gameState.gameMessage} />
            <GameBoard
              gameState={gameState}
              onPieceClick={handlePieceMove}
              validMoves={validMoves}
            />
          </div>

          {/* Right Panel - Dice & Controls */}
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Game Controls</h2>
            
            <Dice
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              onRoll={handleDiceRoll}
              disabled={gameState.diceValue !== null || gameState.gameStatus !== 'playing'}
            />

            {gameState.diceValue && validMoves.length === 0 && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-yellow-800">
                  No valid moves available!
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Turn will end automatically...
                </p>
              </div>
            )}

            {validMoves.length > 0 && (
              <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-blue-800">
                  Click a glowing piece to move!
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {validMoves.length} piece{validMoves.length > 1 ? 's' : ''} can move
                </p>
              </div>
            )}

            {gameState.consecutiveSixes > 0 && (
              <div className="bg-orange-100 border border-orange-300 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-orange-800">
                  🎲 {gameState.consecutiveSixes} consecutive 6{gameState.consecutiveSixes > 1 ? 's' : ''}!
                </p>
                <p className="text-xs text-orange-600">
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
