
import React, { useEffect, useMemo, useState } from 'react';
import { useGameLogic, type LobbySummary } from '@/hooks/useGameLogic';
import { GameBoard } from './GameBoard';
import { Dice } from './Dice';
import { PlayerIndicator } from './PlayerIndicator';
import { GameMessage } from './GameMessage';
import { WinScreen } from './WinScreen';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';
import { cn } from '@/lib/utils';
import { playSound } from '@/utils/gameUtils';
import type { ActivityEntryView } from '@/types/game';
import { useNavigate, useParams } from 'react-router-dom';

const shorten = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const LobbyCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="game-card w-full max-w-3xl mx-auto space-y-6 text-center">
    <div className="text-6xl">🎲</div>
    <div>
      <h1 className="text-4xl font-bold text-shadow">LUDO</h1>
      <p className="text-muted-foreground font-medium mt-2">{description}</p>
    </div>
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </div>
  </div>
);

const GameLobby: React.FC<{
  onCreate: (seats: number, turnDuration: number) => void;
  onJoin: (gameId: bigint) => void;
  onEnterGame?: (gameId: bigint) => void;
  availableGames: LobbySummary[];
  isLoading: boolean;
  pendingAction: string | null;
  selectedTurnDuration: number;
  onTurnDurationChange: (duration: number) => void;
  currentAccount?: string | null;
  canResume: boolean;
  resumeGameId?: bigint | null;
  onResume?: () => void;
}> = ({
  onCreate,
  onJoin,
  onEnterGame,
  availableGames,
  isLoading,
  pendingAction,
  selectedTurnDuration,
  onTurnDurationChange,
  currentAccount,
  canResume,
  resumeGameId,
  onResume,
}) => {
  const createOptions = [2, 4];
  const durationOptions = [30, 45, 60];

  return (
    <LobbyCard title="Choose your adventure" description="Create a new lobby or join an open table.">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {durationOptions.map((duration) => (
          <button
            key={duration}
            onClick={() => onTurnDurationChange(duration)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200',
              selectedTurnDuration === duration
                ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                : 'bg-white text-muted-foreground border-border hover:bg-muted'
            )}
          >
            ⏱️ {duration}s turns
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {canResume && resumeGameId && onResume && (
          <button className="game-button flex flex-col items-center justify-center py-6" onClick={onResume}>
            <span className="text-3xl mb-2">🔁</span>
            <span className="text-xl font-bold">Resume Game #{resumeGameId.toString()}</span>
            <span className="text-xs text-muted-foreground mt-1">Jump back into your last table</span>
          </button>
        )}
        {createOptions.map((count) => (
          <button
            key={count}
            onClick={() => onCreate(count, selectedTurnDuration)}
            className={cn(
              'game-button flex flex-col items-center justify-center py-6',
              pendingAction === 'create' && 'opacity-60 cursor-wait',
            )}
            disabled={pendingAction === 'create'}
          >
            <span className="text-3xl mb-2">{count === 2 ? '👥' : '👨‍👩‍👧‍👦'}</span>
            <span className="text-xl font-bold">Create {count}-Player Game</span>
            <span className="text-xs text-muted-foreground mt-1">⏱️ {selectedTurnDuration}s per turn</span>
          </button>
        ))}
      </div>

      <div className="border-t border-border/40 pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Open Lobbies</h3>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Fetching available games…</div>
        ) : availableGames.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No public lobbies right now. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableGames.map((lobby) => {
              const alreadyJoined = lobby.players.some(
                (player) => currentAccount && player.address.toLowerCase() === currentAccount.toLowerCase(),
              );
              const isFull = lobby.players.length >= lobby.maxPlayers;
              const canEnter = alreadyJoined && Boolean(onEnterGame);
              return (
                <button
                  key={lobby.gameId.toString()}
                  className={cn(
                    'game-button border-dashed border-2 flex flex-col items-center justify-center py-4 space-y-2',
                    (pendingAction === 'join' && !canEnter) && 'opacity-60 cursor-wait',
                    !canEnter && alreadyJoined && 'opacity-60 cursor-not-allowed',
                    !alreadyJoined && isFull && 'opacity-60 cursor-not-allowed',
                  )}
                  onClick={() => {
                    if (alreadyJoined && canEnter) {
                      onEnterGame?.(lobby.gameId);
                    } else {
                      onJoin(lobby.gameId);
                    }
                  }}
                  disabled={(!alreadyJoined && (pendingAction === 'join' || isFull)) || (alreadyJoined && !canEnter)}
                >
                  <span className="text-2xl">🪑</span>
                  <span className="text-sm text-muted-foreground">Lobby #{lobby.gameId.toString()}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {lobby.status === 'ready' ? 'Almost ready' : 'Open table'}
                  </span>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: lobby.maxPlayers }, (_, seat) => {
                    const player = lobby.players.find((summary) => summary.playerIndex === seat);
                    return (
                      <span
                        key={`${lobby.gameId}-${seat}`}
                        className={cn(
                          'w-2.5 h-2.5 rounded-full border border-border shadow-sm',
                          player && player.color === 'red' && 'bg-red-500 border-red-500',
                          player && player.color === 'blue' && 'bg-blue-500 border-blue-500',
                          player && player.color === 'green' && 'bg-green-500 border-green-500',
                          player && player.color === 'yellow' && 'bg-yellow-400 border-yellow-400',
                          !player && 'bg-muted'
                        )}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-muted-foreground">
                  {lobby.players.length}/{lobby.maxPlayers} players · ⏱️ {lobby.turnDuration}s turns
                </span>
                  <span className="text-base font-semibold">
                    {alreadyJoined
                      ? canEnter
                        ? 'Enter Game'
                        : 'Already joined'
                      : isFull
                        ? 'Lobby full'
                        : 'Join Game'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </LobbyCard>
  );
};

export const Game: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turnDurationSelection, setTurnDurationSelection] = useState(30);
  const navigate = useNavigate();
  const { gameId: routeGameIdParam } = useParams<{ gameId?: string }>();

  const {
    account,
    availableGames,
    isLoadingAvailableGames,
    selectedGameId,
    selectGame,
    lastKnownGameId,
    resumeLastGame,
    gameState,
    isGameLoading,
    turnTimer,
    validMoves,
    pendingAction,
    isPlayerSeated,
    isPlayerTurn,
    isWrongNetwork,
    createGame,
    joinGame,
    rollDice,
    movePiece,
    forcePass,
    resign,
  } = useGameLogic();

  const pendingLabel = pendingAction ?? null;

  const activePlayers = useMemo(() => gameState?.players ?? [], [gameState]);

  const routeGameId = routeGameIdParam ?? null;

  useEffect(() => {
    if (!routeGameId) return;
    try {
      const parsed = BigInt(routeGameId);
      if (selectedGameId === null || selectedGameId !== parsed) {
        selectGame(parsed);
      }
    } catch {
      navigate('/', { replace: true });
    }
  }, [navigate, routeGameId, selectGame, selectedGameId]);

  useEffect(() => {
    if (selectedGameId !== null) {
      const expected = selectedGameId.toString();
      if (routeGameId !== expected) {
        navigate(`/game/${expected}`, { replace: true });
      }
    }
  }, [navigate, routeGameId, selectedGameId]);

  const handleCreate = async (count: number, duration: number) => {
    try {
      await createGame(count, duration);
    } catch (err) {
      console.error('createGame failed', err);
    }
  };

  const handleJoin = async (gameId: bigint) => {
    try {
      await joinGame(gameId);
      if (soundEnabled) playSound('enter');
    } catch (err) {
      console.error('joinGame failed', err);
    }
  };

  const handleRollDice = async () => {
    try {
      await rollDice();
      if (soundEnabled) playSound('dice');
    } catch (err) {
      console.error('rollDice failed', err);
    }
  };

  const handlePieceMove = async (pieceId: string) => {
    if (!validMoves.includes(pieceId)) return;
    try {
      await movePiece(pieceId);
      if (soundEnabled) playSound('move');
    } catch (err) {
      console.error('movePiece failed', err);
    }
  };

  const handleReturnToLobby = () => {
    selectGame(null);
    navigate('/', { replace: true });
  };

  const handleEnterExistingGame = (gameId: bigint) => {
    selectGame(gameId);
  };

  const handleForcePass = async () => {
    try {
      await forcePass();
    } catch (err) {
      console.error('forcePass failed', err);
    }
  };

  const handleResign = async () => {
    try {
      await resign();
    } catch (err) {
      console.error('resign failed', err);
    }
  };

  const activityItems = useMemo(() => {
    if (!gameState) return [];
    const nameLookup = new Map<string, string>();
    gameState.players.forEach((player) => {
      nameLookup.set(player.address.toLowerCase(), player.name);
    });
    const formatEntry = (entry: ActivityEntryView) => {
      const actor = nameLookup.get(entry.player.toLowerCase()) ?? shorten(entry.player);
      switch (entry.kind) {
        case 'dice':
          return `${actor} rolled a ${entry.dice ?? '-'}.`;
        case 'move':
          return `${actor} moved piece #${(entry.pieceIndex ?? 0) + 1} from ${entry.from ?? '-'} to ${entry.to ?? '-'}${
            entry.captured ? ' and captured!' : ''
          }`;
        case 'turnPassed':
          return `${actor}'s turn auto-passed.`;
        case 'turnForfeited':
          return `${actor} forfeited the turn.`;
        case 'playerDropped':
          return `${actor} was dropped due to inactivity.`;
        case 'playerResigned':
          return `${actor} resigned.`;
        case 'playerWon':
          return `${actor} won the game!`;
        default:
          return `${actor} acted.`;
      }
    };

    const meaningfulActivity = gameState.activity.filter((entry) => entry.timestamp > 0);
    return meaningfulActivity.slice(0, 12).map((entry) => ({
      id: entry.id,
      message: formatEntry(entry),
      time: new Date(entry.timestamp).toLocaleTimeString(),
    }));
  }, [gameState]);

  const canRoll =
    gameState?.gameStatus === 'playing' &&
    gameState.diceValue === null &&
    isPlayerTurn &&
    pendingAction !== 'roll';

  const canForcePass =
    gameState?.gameStatus === 'playing' &&
    !isPlayerTurn &&
    gameState.turnDeadline !== null &&
    Math.floor(Date.now() / 1000) > gameState.turnDeadline &&
    pendingAction !== 'forcePass';

  const showNoMovesBanner = Boolean(
    isPlayerTurn && gameState?.diceValue !== null && validMoves.length === 0,
  );

  let body: React.ReactNode;

  if (isWrongNetwork) {
    body = (
      <div className="flex flex-1 items-center justify-center">
        <LobbyCard
          title="Wrong Network"
          description="Switch your wallet to the Sepolia network to continue playing."
        >
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Use your wallet to change the active network, then reconnect.
            </div>
          </div>
        </LobbyCard>
      </div>
    );
  } else if (!account) {
    body = (
      <div className="flex flex-1 items-center justify-center">
        <LobbyCard title="Welcome to Cartoon Ludo Blast" description="Connect your wallet to enter the arena.">
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </LobbyCard>
      </div>
    );
  } else if (selectedGameId === null) {
    body = (
      <div className="flex flex-1 items-center justify-center">
        <GameLobby
          onCreate={handleCreate}
          onJoin={handleJoin}
          onEnterGame={handleEnterExistingGame}
          availableGames={availableGames}
          isLoading={isLoadingAvailableGames}
          pendingAction={pendingLabel}
          selectedTurnDuration={turnDurationSelection}
          onTurnDurationChange={setTurnDurationSelection}
          currentAccount={account ?? null}
          canResume={Boolean(lastKnownGameId)}
          resumeGameId={lastKnownGameId}
          onResume={resumeLastGame}
        />
      </div>
    );
  } else if (isGameLoading || !gameState) {
    body = (
      <div className="flex flex-1 flex-col items-center justify-center space-y-4">
        <div className="text-4xl animate-bounce">🌀</div>
        <p className="text-muted-foreground">Loading game #{selectedGameId.toString()}…</p>
        <button className="game-button" onClick={handleReturnToLobby}>
          ⬅️ Back to lobby
        </button>
      </div>
    );
  } else if (gameState.gameStatus === 'waiting' || gameState.gameStatus === 'ready') {
    body = (
      <div className="flex flex-1 items-center justify-center">
        <LobbyCard
          title={`Lobby #${selectedGameId.toString()}`}
          description={
            gameState.gameStatus === 'ready'
              ? 'Almost ready! The game will start as soon as all seats are filled.'
              : 'Waiting for all players to join before the contract auto-starts the match.'
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activePlayers.map((player) => (
              <div
                key={player.id}
                className={cn(
                  'game-card p-4 text-center border-2',
                  `border-[hsl(var(--${player.color}-600))]`,
                )}
              >
                <div className="text-2xl mb-2">
                  {player.color === 'red'
                    ? '🔴'
                    : player.color === 'blue'
                      ? '🔵'
                      : player.color === 'green'
                        ? '🟢'
                        : '🟡'}
                </div>
                <div className="font-bold text-lg">{player.name}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Seat {player.playerIndex + 1}</div>
              </div>
            ))}
          </div>
          <button className="game-button" onClick={handleReturnToLobby}>
            ⬅️ Back to lobby
          </button>
        </LobbyCard>
      </div>
    );
  } else if (gameState.gameStatus === 'finished' && gameState.winner) {
    body = (
      <div className="flex-1 flex items-center justify-center">
        <WinScreen
          winner={gameState.winner}
          onPlayAgain={handleReturnToLobby}
          soundEnabled={soundEnabled}
        />
      </div>
    );
  } else {
    body = (
      <div className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-center text-shadow">Players</h2>
            {activePlayers.slice(0, 2).map((player) => {
              const isCurrentTurn =
                gameState.gameStatus === 'playing' && player.playerIndex === gameState.currentPlayerIndex;
              return (
                <PlayerIndicator
                  key={player.id}
                  player={player}
                  isCurrentTurn={isCurrentTurn}
                  timer={isCurrentTurn ? turnTimer : undefined}
                  turnDuration={gameState.turnDuration}
                />
              );
            })}
          </div>

          <div className="xl:col-span-8 flex flex-col items-center space-y-6">
            <GameMessage
              message={gameState.gameMessage}
              type={isPlayerTurn && canRoll ? 'success' : 'info'}
            />
            <GameBoard gameState={gameState} onPieceClick={handlePieceMove} validMoves={validMoves} />
          </div>

          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-center text-shadow">Players</h2>
            {activePlayers.slice(2, 4).map((player) => {
              const isCurrentTurn =
                gameState.gameStatus === 'playing' && player.playerIndex === gameState.currentPlayerIndex;
              return (
                <PlayerIndicator
                  key={player.id}
                  player={player}
                  isCurrentTurn={isCurrentTurn}
                  timer={isCurrentTurn ? turnTimer : undefined}
                  turnDuration={gameState.turnDuration}
                />
              );
            })}

            <div className="mt-6">
              <h3 className="text-lg font-bold text-center text-shadow mb-4">Dice</h3>
              <Dice
                value={gameState.diceValue}
                isRolling={pendingAction === 'roll'}
                onRoll={handleRollDice}
                disabled={!canRoll}
              />
              {!isPlayerTurn && (
                <p className="text-xs text-center text-muted-foreground mt-2">Waiting for active player…</p>
              )}
              {canForcePass && (
                <div className="mt-3 flex justify-center">
                  <button
                    className="game-button text-sm px-4 py-2 bg-amber-500 text-white"
                    onClick={handleForcePass}
                    disabled={pendingAction === 'forcePass'}
                  >
                    ⏭ Force Pass
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {showNoMovesBanner && (
                <div className="game-card text-center">
                  <p className="text-sm font-bold text-warning">⚠️ No legal moves available</p>
                  <p className="text-xs text-muted-foreground mt-1">Turn will auto-pass after the contract update.</p>
                </div>
              )}
              {validMoves.length > 0 && (
                <div className="game-card text-center">
                  <p className="text-sm font-bold text-success">✨ Select a glowing piece to move</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {validMoves.length} piece{validMoves.length === 1 ? '' : 's'} ready to advance
                  </p>
                </div>
              )}
              {gameState.sixStreak > 0 && (
                <div className="game-card text-center">
                  <p className="text-sm font-bold text-warning">
                    🎲 {gameState.sixStreak} consecutive 6{gameState.sixStreak > 1 ? 's' : ''}!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gameState.sixStreak >= 2
                      ? 'Next six will forfeit your turn.'
                      : 'Roll again to keep the streak!'}
                  </p>
                </div>
              )}
              {activityItems.length > 0 && (
                <div className="game-card">
                  <h4 className="text-sm font-semibold mb-2 text-center">Recent Activity</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs text-muted-foreground">
                    {activityItems.map((item) => (
                      <div key={item.id} className="flex flex-col border-b border-border/40 pb-1 last:border-none last:pb-0">
                        <span className="text-foreground font-medium">{item.message}</span>
                        <span className="text-[10px] uppercase tracking-wide">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const headerSubtitle = useMemo(() => {
    if (isWrongNetwork) return 'Switch to the Sepolia network to keep playing.';
    if (!account) return 'Connect your wallet to start or join a lobby.';
    if (selectedGameId === null) return 'Create a new lobby or join an existing one.';
    if (isGameLoading || !gameState) return `Loading game #${selectedGameId.toString()}…`;
    return gameState.gameMessage;
  }, [account, gameState, isGameLoading, isWrongNetwork, selectedGameId]);

  const showLobbyButton = selectedGameId !== null;
  const showResignButton = Boolean(isPlayerSeated && gameState?.gameStatus === 'playing');

  return (
    <div className="min-h-screen p-4 cartoon-stage flex flex-col">
      <div className="max-w-7xl w-full mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            {selectedGameId !== null && (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Game #{selectedGameId.toString()}
              </p>
            )}
            <h1 className="text-3xl font-bold text-shadow">LUDO</h1>
            <p className="text-muted-foreground font-medium">{headerSubtitle}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <WalletConnectButton />
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={cn(
                'game-button text-sm px-4 py-2',
                soundEnabled ? 'success' : 'bg-muted text-muted-foreground',
              )}
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
            {showResignButton && (
              <button
                className="game-button text-sm px-4 py-2 bg-destructive text-white"
                onClick={handleResign}
                disabled={pendingAction === 'resign'}
              >
                🏳️ Resign
              </button>
            )}
            {showLobbyButton && (
              <button className="game-button text-sm px-4 py-2" onClick={handleReturnToLobby}>
                ⬅️ Lobby
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">{body}</div>
    </div>
  );
};
