import React, { useEffect } from 'react';
import { Player } from '@/types/game';
import { playSound } from '@/utils/gameUtils';
import { cn } from '@/lib/utils';

interface WinScreenProps {
  winner: Player;
  onPlayAgain: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ winner, onPlayAgain }) => {
  useEffect(() => {
    playSound('win');
  }, []);

  const getPlayerColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'text-player-red';
      case 'blue': return 'text-player-blue';
      case 'green': return 'text-player-green';
      case 'yellow': return 'text-player-yellow';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="game-card max-w-md w-full text-center animate-bounce-in">
        <div className="space-y-6">
          {/* Celebration Animation */}
          <div className="text-6xl animate-celebration">
            🏆
          </div>
          
          {/* Winner Announcement */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-shadow animate-fade-in">
              🎉 WINNER! 🎉
            </h1>
            <h2 className={cn(
              'text-2xl font-bold text-shadow animate-slide-in-up',
              getPlayerColorClass(winner.color)
            )}>
              {winner.name}
            </h2>
            <p className="text-muted-foreground">
              Congratulations on your victory!
            </p>
          </div>

          {/* Fireworks Effect */}
          <div className="relative h-16 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="absolute animate-bounce-in opacity-75"
                style={{
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.2}s`,
                  fontSize: `${1.5 + Math.random()}rem`,
                }}
              >
                ✨
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="game-button success text-success-foreground"
              onClick={onPlayAgain}
            >
              🎮 Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};