
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
    setGameState,
    turnTimer,
    rollDice,
    movePieceOnBoard,
    getValidMoves,
    resetGame,
    startGame
  } = useGameLogic(playerCount);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const validMoves = currentPlayer ? getValidMoves(currentPlayer.id).map(p => p.id) : [];

  // Auto-advance turn when no valid moves
  useEffect(() => {
    if (gameState.diceValue !== null && validMoves.length === 0 && gameState.gameStatus === 'playing') {
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
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.diceValue, validMoves.length, gameState.gameStatus, gameState.currentPlayerIndex, gameState.players, setGameState]);

  const handleDiceRoll = () => {
    if (soundEnabled) playSound('dice');
    rollDice();
  };

  const handlePieceMove = (pieceId: string) => {
    if (soundEnabled) playSound('move');
    movePieceOnBoard(pieceId);
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-lg w-full text-center bg-white rounded-3xl p-8 shadow-2xl border-4 border-blue-200">
          <div className="space-y-8">
            <div className="text-8xl animate-bounce">🎲</div>
            <h1 className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cartoonish Ludo!
            </h1>
            <p className="text-lg text-gray-600">
              Choose the number of players to start your adventure!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[2, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountSelect(count)}
                  className="group relative bg-gradient-to-br from-green-400 to-blue-500 text-white font-bold py-6 px-8 rounded-2xl hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-white opacity-20 rounded-2xl transform group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative">
                    <div className="text-3xl mb-2">
                      {count === 2 ? '👥' : '👨‍👩‍👧‍👦'}
                    </div>
                    <div className="text-xl">{count} Players</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-4 text-left bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h3 className="font-bold text-center text-lg text-orange-800">Quick Rules:</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="text-lg">⚀</span>
                  <span>Roll 6 to get your pieces out of home</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-lg">⚡</span>
                  <span>Capture opponents by landing on them</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-lg">⭐</span>
                  <span>Safe squares (★) protect your pieces</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-lg">🏆</span>
                  <span>First to get all 4 pieces home wins!</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-lg">⏰</span>
                  <span>30 seconds per turn</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <label className="flex items-center space-x-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded border-2 border-gray-300"
                />
                <span className="text-gray-700">🔊 Sound Effects</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 shadow-2xl border-4 border-green-200">
          <div className="space-y-6">
            <div className="text-6xl animate-bounce">🎮</div>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Ready to Play!
            </h1>
            <p className="text-gray-600 text-lg">
              {playerCount} players selected. Let the fun begin!
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {gameState.players.map((player, index) => (
                <div key={player.id} className={cn(
                  "p-3 rounded-xl border-2 font-medium",
                  player.color === 'red' && "bg-red-50 border-red-200 text-red-800",
                  player.color === 'blue' && "bg-blue-50 border-blue-200 text-blue-800",
                  player.color === 'green' && "bg-green-50 border-green-200 text-green-800",
                  player.color === 'yellow' && "bg-yellow-50 border-yellow-200 text-yellow-800"
                )}>
                  <div className="text-2xl mb-1">
                    {player.color === 'red' && '🔴'}
                    {player.color === 'blue' && '🔵'}
                    {player.color === 'green' && '🟢'}
                    {player.color === 'yellow' && '🟡'}
                  </div>
                  {player.name}
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-4">
              <button
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={startGame}
              >
                🚀 Start Game
              </button>
              
              <button
                onClick={handlePlayAgain}
                className="text-gray-600 hover:text-gray-800 underline text-sm transition-colors"
              >
                ← Change Player Count
              </button>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎲 Cartoonish Ludo 🎲
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'px-4 py-2 rounded-lg transition-all font-medium shadow-md',
                soundEnabled 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              )}
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
            <button
              onClick={handlePlayAgain}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium shadow-md"
            >
              🔄 New Game
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Players */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Players</h2>
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
            <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Game Controls</h2>
            
            <Dice
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              onRoll={handleDiceRoll}
              disabled={gameState.diceValue !== null || gameState.gameStatus !== 'playing'}
            />

            {gameState.diceValue && validMoves.length === 0 && (
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-4 text-center shadow-md">
                <p className="text-sm font-bold text-yellow-800">⚠️ No valid moves!</p>
                <p className="text-xs text-yellow-700 mt-1">Auto-advancing turn...</p>
              </div>
            )}

            {validMoves.length > 0 && (
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl p-4 text-center shadow-md">
                <p className="text-sm font-bold text-blue-800">✨ Click a glowing piece!</p>
                <p className="text-xs text-blue-700 mt-1">
                  {validMoves.length} piece{validMoves.length > 1 ? 's' : ''} can move
                </p>
              </div>
            )}

            {gameState.consecutiveSixes > 0 && (
              <div className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl p-4 text-center shadow-md">
                <p className="text-sm font-bold text-orange-800">
                  🎲 {gameState.consecutiveSixes} consecutive 6{gameState.consecutiveSixes > 1 ? 's' : ''}!
                </p>
                <p className="text-xs text-orange-700">
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
