import React from 'react';
import { Player } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayerIndicatorProps {
  player: Player;
  isActive: boolean;
  timer?: number;
}

export const PlayerIndicator: React.FC<PlayerIndicatorProps> = ({ 
  player, 
  isActive, 
  timer 
}) => {
  const getPlayerColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-300 text-red-700 bg-red-50';
      case 'blue': return 'border-blue-300 text-blue-700 bg-blue-50';
      case 'green': return 'border-green-300 text-green-700 bg-green-50';
      case 'yellow': return 'border-yellow-300 text-yellow-700 bg-yellow-50';
      default: return 'border-muted text-muted-foreground';
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

  const getPlayerAvatar = (color: string) => {
    switch (color) {
      case 'red': return '👨';
      case 'blue': return '👩';
      case 'green': return '👨';
      case 'yellow': return '👩';
      default: return '👤';
    }
  };

  const finishedPieces = player.pieces.filter(p => p.isFinished).length;
  const activePieces = player.pieces.filter(p => !p.isInHome && !p.isFinished).length;

  return (
    <div className={cn(
      'player-indicator border-2 transition-all duration-300 rounded-lg p-3 shadow-md',
      getPlayerColorClass(player.color),
      isActive && 'active scale-105 ring-2 ring-[hsl(var(--primary))] ring-opacity-50'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold shadow-md bg-white',
            getPlayerColorClass(player.color)
          )}>
            {getPlayerAvatar(player.color)}
          </div>
          <div>
            <h3 className="font-bold text-sm">{player.name}</h3>
            <p className="text-xs text-muted-foreground font-medium">
              🏠 {finishedPieces}/4 • 🎯 {activePieces}
            </p>
          </div>
        </div>
        
        {isActive && timer !== undefined && (
          <div className="flex flex-col items-center">
            <div className={cn(
              'text-sm font-bold transition-all duration-300',
              timer <= 10 && 'text-red-500 scale-110'
            )}>
              {timer}s
            </div>
            <div className="w-10 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden shadow-inner">
              <div 
                className={cn(
                  'h-full transition-all duration-1000 ease-linear rounded-full',
                  timer <= 10 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]'
                )}
                style={{ width: `${(timer / 30) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {player.skippedTurns > 0 && (
        <div className="mt-2 text-xs text-warning font-medium bg-warning/10 rounded px-2 py-1 border border-warning/20">
          ⚠️ Skipped: {player.skippedTurns}/3
        </div>
      )}

      {/* Progress indicator for finished pieces */}
      {finishedPieces > 0 && (
        <div className="mt-2 flex space-x-1">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full border border-current transition-all duration-300',
                i < finishedPieces ? 'bg-current' : 'bg-transparent'
              )}
            />
          ))}
        </div>
      )}

      {/* Active turn indicator */}
      {isActive && (
        <div className="mt-2 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 rounded px-2 py-1 border border-[hsl(var(--primary))]/20 text-center">
          YOUR TURN
        </div>
      )}
    </div>
  );
};