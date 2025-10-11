import React, { useEffect } from 'react';
import { Player } from '@/types/game';
import { playSound } from '@/utils/gameUtils';
import { cn } from '@/lib/utils';

interface WinScreenProps {
  winner: Player;
  onPlayAgain: () => void;
  soundEnabled?: boolean;
}

export const WinScreen: React.FC<WinScreenProps> = ({ winner, onPlayAgain, soundEnabled = true }) => {
  useEffect(() => {
    if (!soundEnabled) return;
    playSound('win');
  }, [soundEnabled]);

  const getPlayerColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-100 bg-gradient-to-r from-red-700 to-red-800';
      case 'blue': return 'text-blue-100 bg-gradient-to-r from-blue-700 to-blue-800';
      case 'green': return 'text-green-100 bg-gradient-to-r from-green-700 to-green-800';
      case 'yellow': return 'text-yellow-100 bg-gradient-to-r from-yellow-700 to-yellow-800';
      default: return 'text-muted-foreground bg-gradient-to-r from-muted to-muted';
    }
  };

  const getPlayerEmoji = (color: string) => {
    switch (color) {
      case 'red': return '🔴';
      case 'blue': return '🔵';
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="game-card max-w-md w-full text-center">
        <div className="space-y-6">
          {/* Celebration */}
          <div className="text-5xl">
            🏆
          </div>
          
          {/* Winner Announcement */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-shadow">
              WINNER!
            </h1>
            <div className={cn(
              'text-xl font-bold text-shadow rounded-lg p-3 text-white shadow-md border-2',
              getPlayerColorClass(winner.color)
            )}>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">{getPlayerEmoji(winner.color)}</span>
                <span>{winner.name}</span>
              </div>
            </div>
            <p className="text-muted-foreground font-medium">
              Congratulations on your victory!
            </p>
          </div>

          {/* Fireworks Effect */}
          <div className="relative h-12 overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="absolute opacity-75"
                style={{
                  left: `${15 + i * 12}%`,
                  fontSize: `${1.2 + Math.random()}rem`,
                }}
              >
                ✨
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="game-button success"
              onClick={onPlayAgain}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
