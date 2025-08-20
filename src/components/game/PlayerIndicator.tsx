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
      case 'red': return 'border-player-red text-player-red';
      case 'blue': return 'border-player-blue text-player-blue';
      case 'green': return 'border-player-green text-player-green';
      case 'yellow': return 'border-player-yellow text-player-yellow';
      default: return 'border-muted text-muted-foreground';
    }
  };

  const finishedPieces = player.pieces.filter(p => p.isFinished).length;
  const activePieces = player.pieces.filter(p => !p.isInHome && !p.isFinished).length;

  return (
    <div className={cn(
      'player-indicator border-2 transition-all duration-300',
      getPlayerColorClass(player.color),
      isActive && 'active scale-105'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-6 h-6 rounded-full border-2',
            getPlayerColorClass(player.color)
          )} />
          <div>
            <h3 className="font-bold text-sm">{player.name}</h3>
            <p className="text-xs text-muted-foreground">
              Home: {finishedPieces}/4 • Active: {activePieces}
            </p>
          </div>
        </div>
        
        {isActive && timer !== undefined && (
          <div className="flex flex-col items-center">
            <div className={cn(
              'text-lg font-bold',
              timer <= 10 && 'text-destructive animate-pulse'
            )}>
              {timer}s
            </div>
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-1000 ease-linear',
                  timer <= 10 ? 'bg-destructive' : 'bg-success'
                )}
                style={{ width: `${(timer / 30) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {player.skippedTurns > 0 && (
        <div className="mt-2 text-xs text-warning">
          ⚠️ Skipped turns: {player.skippedTurns}/3
        </div>
      )}
    </div>
  );
};