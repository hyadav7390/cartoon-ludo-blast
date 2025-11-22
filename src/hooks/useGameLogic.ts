import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Address,
  BaseError,
  decodeErrorResult,
  decodeEventLog,
  getAddress,
  parseEther,
  zeroAddress,
} from 'viem';
import {
  useAccount,
  usePublicClient,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi';

import { useToast } from '@/hooks/use-toast';
import { TARGET_CHAIN_ID } from '@/configs';
import { LUDO_CONTRACT_ADDRESS, PlayerColorEnum, ludoAbi } from '@/contracts/ludo';
import {
  ActivityEntryView,
  ActivityKind,
  GamePiece,
  GameState,
  Player,
  PlayerColor,
  HOME_COLUMN_SQUARES,
  HOME_POSITIONS,
  PIECES_PER_PLAYER,
  TOTAL_MAIN_SQUARES,
} from '@/types/game';
import { getBoardPosition, getHomeColumnPosition } from '@/utils/boardPositions';

const DICE_WAIT_TIMER = 30;
const LEGAL_MOVES_CACHE_TTL_MS = 3_000;
const LOBBY_PAGE_SIZE = 12n;
const MAX_OPEN_LOBBIES = 48;
const ACTIVITY_HISTORY_COUNT = 20;
const LAST_GAME_STORAGE_KEY = 'ludo:lastGameId';

type PendingAction = 'create' | 'join' | 'match' | 'roll' | 'move' | 'forcePass' | 'resign' | null;

type LobbyStatus = 'waiting' | 'ready' | 'playing' | 'finished';

interface SendTransactionOptions {
  refreshGame?: boolean;
  refreshLobbies?: boolean;
}

interface LobbyPlayerSummary {
  address: Address;
  color: PlayerColor;
  playerIndex: number;
  active: boolean;
}

interface LobbySummary {
  gameId: bigint;
  maxPlayers: number;
  turnDuration: number;
  betAmount: bigint;
  prizePool: bigint;
  creator: Address;
  status: LobbyStatus;
  players: LobbyPlayerSummary[];
}

interface UseGameLogicReturn {
  account: Address | undefined;
  availableGames: LobbySummary[];
  isLoadingAvailableGames: boolean;
  refetchAvailableGames: () => Promise<void>;
  selectedGameId: bigint | null;
  selectGame: (gameId: bigint | null) => void;
  lastKnownGameId: bigint | null;
  resumeLastGame: () => void;
  gameState: GameState | null;
  isGameLoading: boolean;
  turnTimer: number;
  validMoves: string[];
  pendingAction: PendingAction;
  isPlayerSeated: boolean;
  isPlayerTurn: boolean;
  isWrongNetwork: boolean;
  joinGame: (gameId: bigint, betAmountWei?: bigint) => Promise<void>;
  matchGame: (maxPlayers: number, turnDuration: number, betAmountEth: string) => Promise<void>;
  rollDice: () => Promise<void>;
  movePiece: (pieceId: string) => Promise<void>;
  forcePass: () => Promise<void>;
  resign: () => Promise<void>;
  refetchGameState: () => Promise<void>;
}

interface WinnerRecord {
  winner: Address;
  timestamp: number;
}

type ContractLobbyView = {
  gameId: bigint;
  status: number;
  maxPlayers: number;
  turnDuration: number;
  playerCount: number;
  activePlayerCount: number;
  betAmount: bigint;
  prizePool: bigint;
  creator: Address;
  players: readonly Address[];
  colors: readonly number[];
  actives: readonly boolean[];
};

type ContractPlayerState = {
  account: Address;
  color: number;
  active: boolean;
  missedDeadlines: number;
  positions: readonly number[];
  finished: readonly boolean[];
};

type ContractGameSnapshot = {
  status: number;
  maxPlayers: number;
  currentPlayerIndex: number;
  activePlayerCount: number;
  sixStreak: number;
  diceValue: number;
  turnDuration: number;
  turnDeadline: bigint;
  betAmount: bigint;
  prizePool: bigint;
  roller: Address;
  players: readonly ContractPlayerState[];
};

const shortenAddress = (address: Address) =>
  `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const playerColorFromEnum = (value: number): PlayerColor => {
  switch (value) {
    case PlayerColorEnum.Red:
      return 'red';
    case PlayerColorEnum.Blue:
      return 'blue';
    case PlayerColorEnum.Green:
      return 'green';
    case PlayerColorEnum.Yellow:
      return 'yellow';
    default:
      return 'red';
  }
};

const parseError = (error: unknown): string => {
  if (error instanceof BaseError) {
    try {
      const decoded = decodeErrorResult({ abi: ludoAbi, data: (error as BaseError).shortMessageData ?? error.data ?? '0x' });
      if (decoded?.errorName) {
        return decoded.errorName;
      }
    } catch {
      // ignore decode issues
    }
    return error.shortMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
};

const toPlayerId = (address: Address) => address.toLowerCase();

const mapGameStatus = (value: number): LobbyStatus => {
  switch (value) {
    case 0:
      return 'waiting';
    case 1:
      return 'ready';
    case 2:
      return 'playing';
    case 3:
      return 'finished';
    default:
      return 'waiting';
  }
};

const mapActivityKind = (kind: number): ActivityKind => {
  switch (kind) {
    case 0:
      return 'dice';
    case 1:
      return 'move';
    case 2:
      return 'turnPassed';
    case 3:
      return 'turnForfeited';
    case 4:
      return 'playerDropped';
    case 5:
      return 'playerResigned';
    case 6:
      return 'playerWon';
    default:
      return 'dice';
  }
};

const mapPiecePosition = (
  color: PlayerColor,
  boardPosition: number,
  pieceIndex: number,
): Pick<GamePiece, 'position' | 'isInHome' | 'isInHomeColumn' | 'isFinished'> => {
  if (boardPosition === -1) {
    return {
      position: HOME_POSITIONS[color][pieceIndex],
      isInHome: true,
      isInHomeColumn: false,
      isFinished: false,
    };
  }

  if (boardPosition === TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES) {
    return {
      position: { x: 7, y: 7 },
      isInHome: false,
      isInHomeColumn: false,
      isFinished: true,
    };
  }

  if (boardPosition >= TOTAL_MAIN_SQUARES) {
    const columnIndex = boardPosition - TOTAL_MAIN_SQUARES;
    return {
      position: getHomeColumnPosition(color, columnIndex),
      isInHome: false,
      isInHomeColumn: true,
      isFinished: false,
    };
  }

  return {
    position: getBoardPosition(boardPosition),
    isInHome: false,
    isInHomeColumn: false,
    isFinished: false,
  };
};

const buildGameMessage = (state: GameState | null, account?: Address): string => {
  if (!state) {
    return 'Select a lobby to play Ludo on-chain.';
  }

  const joined = state.players.length;
  const remaining = Math.max(state.maxPlayers - joined, 0);
  const isSeated = account
    ? state.players.some((player) => player.address.toLowerCase() === account.toLowerCase())
    : false;

  if (state.gameStatus === 'finished') {
    return state.winner ? `${state.winner.name} wins the game!` : 'Game finished.';
  }

  if (state.gameStatus === 'waiting') {
    return remaining === 0
      ? 'Waiting for players to join.'
      : isSeated
        ? `Waiting for ${remaining} more player${remaining === 1 ? '' : 's'} to join…`
        : `Lobby has ${joined}/${state.maxPlayers} players. Join in to start!`;
  }

  if (state.gameStatus === 'ready') {
    const seatsLeft = Math.max(state.maxPlayers - joined, 0);
    return seatsLeft === 0
      ? 'Starting soon…'
      : `Almost ready! ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} remaining.`;
  }

  if (state.gameStatus === 'playing') {
    const activePlayer = state.players[state.currentPlayerIndex];
    if (!activePlayer) {
      return 'Awaiting the next turn…';
    }
    const isUsersTurn = account
      ? activePlayer.address.toLowerCase() === account.toLowerCase()
      : false;

    if (state.diceValue !== null) {
      return `${activePlayer.name} rolled a ${state.diceValue}. ${
        isUsersTurn ? 'Choose a piece to move.' : 'Waiting for their move.'
      }`;
    }

    const deadlineMessage = state.turnDeadline
      ? `Turn ends in ${Math.max(0, Math.floor(state.turnDeadline - Date.now() / 1000))}s.`
      : '';

    return `${activePlayer.name}'s turn. ${isUsersTurn ? 'Roll the dice!' : 'Waiting for roll.'} ${deadlineMessage}`.trim();
  }

  return 'Loading game state…';
};

export const useGameLogic = (): UseGameLogicReturn => {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();

  const isWrongNetwork = Boolean(chainId && chainId !== TARGET_CHAIN_ID);
  const effectiveAddress = isWrongNetwork ? undefined : address;

  const [availableGames, setAvailableGames] = useState<LobbySummary[]>([]);
  const [isLoadingLobbies, setIsLoadingLobbies] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<bigint | null>(null);
  const [storedGameRef, setStoredGameRef] = useState<{ id: bigint; owner: string } | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isHydratingGame, setIsHydratingGame] = useState(false);
  const [turnTimer, setTurnTimer] = useState(DICE_WAIT_TIMER);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [chainTimeOffset, setChainTimeOffset] = useState(0);

  const winnerByGameRef = useRef<Map<string, WinnerRecord>>(new Map());
  const legalMovesCacheRef = useRef<{ key: string; timestamp: number; moves: string[] } | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingReloadRef = useRef<boolean>(false);
  const lobbyReloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotAtRef = useRef<number>(0);
  const hasLoadedLastGameRef = useRef(false);

  const lastKnownGameId = useMemo(() => storedGameRef?.id ?? null, [storedGameRef]);

  const persistLastGameRef = useCallback((value: { id: bigint; owner: string } | null) => {
    if (typeof window === 'undefined') return;
    if (value) {
      window.localStorage.setItem(
        LAST_GAME_STORAGE_KEY,
        JSON.stringify({ gameId: value.id.toString(), owner: value.owner }),
      );
    } else {
      window.localStorage.removeItem(LAST_GAME_STORAGE_KEY);
    }
  }, []);

  const clearStoredGameRef = useCallback(() => {
    setStoredGameRef(null);
    persistLastGameRef(null);
  }, [persistLastGameRef]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasLoadedLastGameRef.current) return;
    hasLoadedLastGameRef.current = true;
    const stored = window.localStorage.getItem(LAST_GAME_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { gameId: string; owner: string };
      if (!parsed?.gameId || !parsed?.owner) return;
      setStoredGameRef({ id: BigInt(parsed.gameId), owner: parsed.owner.toLowerCase() });
    } catch {
      window.localStorage.removeItem(LAST_GAME_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (effectiveAddress) return;
    setSelectedGameId(null);
    setGameState(null);
    setValidMoves([]);
    if (storedGameRef) {
      clearStoredGameRef();
    }
  }, [clearStoredGameRef, effectiveAddress, storedGameRef]);

  const scheduleRefresh = useCallback(
    (gameId?: bigint) => {
      const target = gameId ?? selectedGameId;
      if (target === null || target === undefined) return;
      if (refreshTimeoutRef.current) return;
      const now = Date.now();
      if (now - lastSnapshotAtRef.current < 750) {
        return;
      }
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTimeoutRef.current = null;
        void refreshGameSnapshot(target);
      }, 120);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGameId],
  );

  const refreshGameSnapshot = useCallback(
    async (gameId: bigint) => {
      if (!publicClient || !effectiveAddress) return;
      setIsHydratingGame(true);
      try {
        const [snapshotRaw, activityRaw, latestBlock] = await Promise.all([
          publicClient.readContract({
            address: LUDO_CONTRACT_ADDRESS,
            abi: ludoAbi,
            functionName: 'getGameSnapshot',
            args: [gameId],
            chainId: TARGET_CHAIN_ID,
          }) as Promise<ContractGameSnapshot>,
          publicClient.readContract({
            address: LUDO_CONTRACT_ADDRESS,
            abi: ludoAbi,
            functionName: 'getRecentActivity',
            args: [gameId, ACTIVITY_HISTORY_COUNT],
            chainId: TARGET_CHAIN_ID,
          }) as Promise<
            Array<{
              kind: bigint;
              player: Address;
              dice: bigint;
              pieceIndex: bigint;
              fromPos: bigint;
              toPos: bigint;
              captured: boolean;
              victimPlayerIdx: bigint;
              victimPieceIdx: bigint;
              at: bigint;
            }>
          >,
          publicClient.getBlock({ chainId: TARGET_CHAIN_ID }),
        ]);

        const players: Player[] = snapshotRaw.players.map((playerState, index) => {
          const playerAddress = getAddress(playerState.account as Address);
          const color = playerColorFromEnum(Number(playerState.color ?? 0));

          const pieces: GamePiece[] = Array.from({ length: PIECES_PER_PLAYER }, (_, pieceIndex) => {
            const boardPosition = Number(playerState.positions[pieceIndex] ?? -1);
            const base = mapPiecePosition(color, boardPosition, pieceIndex);
            return {
              id: `${color}-${pieceIndex}`,
              playerId: playerAddress,
              color,
              position: base.position,
              boardPosition,
              isInHome: base.isInHome,
              isInHomeColumn: base.isInHomeColumn,
              isFinished:
                Boolean(playerState.finished[pieceIndex]) ||
                boardPosition === TOTAL_MAIN_SQUARES + HOME_COLUMN_SQUARES,
              pieceIndex,
            };
          });

          const name = `${capitalise(color)} · ${shortenAddress(playerAddress)}`;

          return {
            id: toPlayerId(playerAddress),
            address: playerAddress,
            name,
            color,
            pieces,
            isActive: Boolean(playerState.active),
            missedDeadlines: Number(playerState.missedDeadlines ?? 0),
            playerIndex: index,
          };
        });

        const activity: ActivityEntryView[] = activityRaw.map((entry, index) => {
          const diceValue = Number(entry.dice ?? 0n);
          const pieceIdx = Number(entry.pieceIndex ?? -1n);
          const victimPlayerIdx = Number(entry.victimPlayerIdx ?? -1n);
          const victimPieceIdx = Number(entry.victimPieceIdx ?? -1n);
          return {
            id: `${gameId.toString()}-${entry.at.toString()}-${index}`,
            kind: mapActivityKind(Number(entry.kind)),
            player: entry.player,
            dice: diceValue > 0 ? diceValue : undefined,
            pieceIndex: pieceIdx >= 0 ? pieceIdx : undefined,
            from: Number(entry.fromPos ?? 0n),
            to: Number(entry.toPos ?? 0n),
            captured: Boolean(entry.captured),
            victimPlayerIdx: victimPlayerIdx >= 0 ? victimPlayerIdx : undefined,
            victimPieceIdx: victimPieceIdx >= 0 ? victimPieceIdx : undefined,
            timestamp: Number(entry.at ?? 0n) * 1000,
          };
        });
        const filteredActivity = activity.filter((entry) => entry.timestamp > 0);

        const currentPlayerIndex = Number(snapshotRaw.currentPlayerIndex ?? 0);
        const diceValueNumber = Number(snapshotRaw.diceValue ?? 0);
        const turnDeadlineNumber = Number(snapshotRaw.turnDeadline ?? 0n);
        const winnerRecord = winnerByGameRef.current.get(gameId.toString());

        let gameStatus: GameState['gameStatus'] = mapGameStatus(Number(snapshotRaw.status ?? 0));
        let winnerPlayer = winnerRecord
          ? players.find((player) => player.address.toLowerCase() === winnerRecord.winner.toLowerCase()) ?? null
          : null;

        if (!winnerPlayer) {
          const winEntry = filteredActivity.find((entry) => entry.kind === 'playerWon');
          if (winEntry) {
            winnerPlayer =
              players.find((player) => player.address.toLowerCase() === winEntry.player.toLowerCase()) ?? null;
            if (winnerPlayer) {
              winnerByGameRef.current.set(gameId.toString(), { winner: winnerPlayer.address, timestamp: Date.now() });
              gameStatus = 'finished';
            }
          }
        } else {
          gameStatus = 'finished';
        }

        if (latestBlock?.timestamp !== undefined) {
          const chainTimestamp = Number(latestBlock.timestamp ?? 0n);
          if (chainTimestamp > 0) {
            const nowSeconds = Math.floor(Date.now() / 1000);
            setChainTimeOffset(nowSeconds - chainTimestamp);
          }
        }

        const diceValueOrNull = diceValueNumber === 0 ? null : diceValueNumber;
        const currentPlayer = players[currentPlayerIndex];
        const rollerAddress =
          snapshotRaw.roller && snapshotRaw.roller !== zeroAddress
            ? snapshotRaw.roller
            : currentPlayer
              ? currentPlayer.address
              : null;

        const state: GameState = {
          gameId,
          maxPlayers: Number(snapshotRaw.maxPlayers ?? players.length),
          turnDuration: Number(snapshotRaw.turnDuration ?? DICE_WAIT_TIMER),
          turnDeadline: turnDeadlineNumber === 0 ? null : turnDeadlineNumber,
          betAmount: snapshotRaw.betAmount ?? 0n,
          prizePool: snapshotRaw.prizePool ?? 0n,
          players,
          currentPlayerIndex,
          diceValue: diceValueOrNull,
          isRolling: pendingAction === 'roll',
          gameStatus,
          winner: winnerPlayer,
          moveHistory: [],
          sixStreak: Number(snapshotRaw.sixStreak ?? 0),
          gameMessage: '',
          roller: rollerAddress,
          activity: filteredActivity,
        };

        state.gameMessage = buildGameMessage(state, effectiveAddress);
        setGameState(state);
        lastSnapshotAtRef.current = Date.now();

        const userSeated = effectiveAddress
          ? players.some((player) => player.address.toLowerCase() === effectiveAddress.toLowerCase())
          : false;

        if (userSeated && state.gameStatus !== 'finished' && effectiveAddress) {
          const nextRef = { id: gameId, owner: effectiveAddress.toLowerCase() };
          const isSameRef =
            storedGameRef &&
            storedGameRef.id === nextRef.id &&
            storedGameRef.owner === nextRef.owner;
          if (!isSameRef) {
            setStoredGameRef(nextRef);
            persistLastGameRef(nextRef);
          }
        } else if (
          storedGameRef &&
          storedGameRef.id === gameId &&
          (!userSeated || state.gameStatus === 'finished')
        ) {
          clearStoredGameRef();
        }
      } catch (error) {
        console.error('Failed to refresh game snapshot', error);
        const message = parseError(error);
        toast({
          title: 'Failed to fetch game state',
          description: message,
          variant: 'destructive',
        });
        if (message === 'InvalidGameId') {
          clearStoredGameRef();
          setSelectedGameId(null);
        }
      } finally {
        setIsHydratingGame(false);
      }
    },
    [clearStoredGameRef, effectiveAddress, pendingAction, persistLastGameRef, publicClient, storedGameRef, toast],
  );

  const reloadLobbies = useCallback(async () => {
    if (!publicClient || pendingReloadRef.current) return;
    pendingReloadRef.current = true;
    setIsLoadingLobbies(true);
    try {
      const aggregated: LobbySummary[] = [];
      let cursor = 0n;
      let shouldContinue = true;

      while (shouldContinue) {
        const response = (await publicClient.readContract({
          address: LUDO_CONTRACT_ADDRESS,
          abi: ludoAbi,
          functionName: 'getOpenGames',
          args: [cursor, LOBBY_PAGE_SIZE],
          chainId: TARGET_CHAIN_ID,
        })) as [ContractLobbyView[], bigint];

        const rawLobbies = response[0] ?? [];
        const nextCursor = response[1] ?? 0n;

        rawLobbies.forEach((view) => {
          const players: LobbyPlayerSummary[] = view.players.map((playerAddress, index) => ({
            address: getAddress(playerAddress as Address),
            color: playerColorFromEnum(Number(view.colors[index] ?? 0)),
            playerIndex: index,
            active: Boolean(view.actives[index]),
          }));

          aggregated.push({
            gameId: view.gameId,
            maxPlayers: Number(view.maxPlayers ?? players.length),
            turnDuration: Number(view.turnDuration ?? DICE_WAIT_TIMER),
            betAmount: view.betAmount ?? 0n,
            prizePool: view.prizePool ?? 0n,
            creator: getAddress(view.creator as Address),
            status: mapGameStatus(Number(view.status ?? 0)),
            players,
          });
        });

        cursor = nextCursor;
        shouldContinue =
          rawLobbies.length > 0 && cursor !== 0n && aggregated.length < MAX_OPEN_LOBBIES;
      }

      setAvailableGames(
        aggregated
          .sort((a, b) => (a.gameId < b.gameId ? 1 : -1))
          .slice(0, MAX_OPEN_LOBBIES),
      );
    } catch (error) {
      console.error('Failed to load lobbies', error);
      toast({
        title: 'Unable to load lobbies',
        description: parseError(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLobbies(false);
      pendingReloadRef.current = false;
    }
  }, [publicClient, toast]);

  const scheduleLobbyReload = useCallback(() => {
    if (lobbyReloadTimeoutRef.current) return;
    lobbyReloadTimeoutRef.current = setTimeout(() => {
      lobbyReloadTimeoutRef.current = null;
      void reloadLobbies();
    }, 600);
  }, [reloadLobbies]);

  useEffect(() => {
    void reloadLobbies();
  }, [reloadLobbies]);

  useEffect(() => {
    if (selectedGameId === null) {
      setGameState(null);
      setValidMoves([]);
      return;
    }
    void refreshGameSnapshot(selectedGameId);
  }, [refreshGameSnapshot, selectedGameId]);

  useEffect(() => {
    if (!gameState) {
      setTurnTimer(DICE_WAIT_TIMER);
      return;
    }

    if (!gameState.turnDeadline || gameState.gameStatus !== 'playing') {
      setTurnTimer(gameState.turnDuration || DICE_WAIT_TIMER);
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000) - chainTimeOffset;
      const remaining = Math.max(0, gameState.turnDeadline - now);
      setTurnTimer(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1_000);
    return () => clearInterval(interval);
  }, [chainTimeOffset, gameState]);

  useEffect(() => {
    if (!publicClient || selectedGameId === null || !gameState || !effectiveAddress) {
      setValidMoves([]);
      legalMovesCacheRef.current = null;
      return;
    }

    if (isWrongNetwork) {
      setValidMoves([]);
      legalMovesCacheRef.current = null;
      return;
    }

    if (gameState.gameStatus !== 'playing' || gameState.diceValue === null) {
      setValidMoves([]);
      legalMovesCacheRef.current = null;
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.address.toLowerCase() !== effectiveAddress.toLowerCase()) {
      setValidMoves([]);
      legalMovesCacheRef.current = null;
      return;
    }

    const cacheKey = `${selectedGameId}-${gameState.gameStatus}-${gameState.diceValue}-${gameState.currentPlayerIndex}-${effectiveAddress}`;
    const now = Date.now();
    if (
      legalMovesCacheRef.current &&
      legalMovesCacheRef.current.key === cacheKey &&
      now - legalMovesCacheRef.current.timestamp < LEGAL_MOVES_CACHE_TTL_MS
    ) {
      setValidMoves(legalMovesCacheRef.current.moves);
      return;
    }

    let cancelled = false;
    const fetchLegalMoves = async () => {
      try {
        const canMove = (await publicClient.readContract({
          address: LUDO_CONTRACT_ADDRESS,
          abi: ludoAbi,
          functionName: 'legalMoves',
          args: [selectedGameId, effectiveAddress],
          chainId: TARGET_CHAIN_ID,
        })) as boolean[];

        if (cancelled) return;

        const moves = currentPlayer.pieces
          .filter((piece, index) => Boolean(canMove[index]))
          .map((piece) => piece.id);

        legalMovesCacheRef.current = {
          key: cacheKey,
          timestamp: now,
          moves,
        };
        setValidMoves(moves);
      } catch (error) {
        console.warn('Failed to fetch legal moves', error);
        if (!cancelled) {
          setValidMoves([]);
        }
      }
    };

    fetchLegalMoves();
    return () => {
      cancelled = true;
    };
  }, [
    effectiveAddress,
    gameState,
    isWrongNetwork,
    publicClient,
    selectedGameId,
  ]);

  const refetchGameState = useCallback(async () => {
    if (selectedGameId !== null) {
      await refreshGameSnapshot(selectedGameId);
    }
  }, [refreshGameSnapshot, selectedGameId]);

  const refetchAvailableGames = useCallback(async () => {
    await reloadLobbies();
  }, [reloadLobbies]);

  const sendTransaction = useCallback(
    async (
      action: PendingAction,
      params:
        (
          | { functionName: 'joinGame'; args: [bigint] }
          | { functionName: 'matchGame'; args: [bigint, bigint, bigint] }
          | { functionName: 'rollDice'; args: [bigint] }
          | { functionName: 'movePiece'; args: [bigint, bigint] }
          | { functionName: 'forcePass'; args: [bigint] }
          | { functionName: 'resign'; args: [bigint] }
        ) & { value?: bigint },
      successMessage: string,
      options?: SendTransactionOptions,
    ) => {
      const { refreshGame = true, refreshLobbies = false } = options ?? {};
      if (!publicClient) {
        toast({
          title: 'Wallet not connected',
          description: 'Connect your wallet to continue.',
          variant: 'destructive',
        });
        return;
      }

      if (isWrongNetwork) {
        toast({
          title: 'Wrong network',
          description: 'Switch your wallet to the Sepolia network.',
          variant: 'destructive',
        });
        return;
      }

      setPendingAction(action);
      try {
        const hash = await writeContractAsync({
          address: LUDO_CONTRACT_ADDRESS,
          abi: ludoAbi,
          functionName: params.functionName,
          args: params.args,
          value: params.value,
          chainId: TARGET_CHAIN_ID,
        });

        toast({ title: 'Transaction submitted', description: 'Waiting for confirmation…' });

        const receipt = await publicClient.waitForTransactionReceipt({ hash, chainId: TARGET_CHAIN_ID });

        toast({ title: 'Success', description: successMessage });

        const refreshJobs: Promise<void>[] = [];
        if (refreshLobbies) {
          refreshJobs.push(reloadLobbies());
        }
        if (refreshGame) {
          refreshJobs.push(refetchGameState());
        }
        if (refreshJobs.length > 0) {
          await Promise.allSettled(refreshJobs);
        }
      } catch (error) {
        const message = parseError(error);
        toast({
          title: 'Transaction failed',
          description: message,
          variant: 'destructive',
        });
        throw error;
      } finally {
        setPendingAction(null);
      }
    },
    [isWrongNetwork, publicClient, refetchGameState, reloadLobbies, toast, writeContractAsync],
  );

  const joinGame = useCallback(
    async (gameId: bigint, betAmountOverride?: bigint) => {
      if (!effectiveAddress) {
        toast({ title: 'Connect wallet', description: 'Sign in to join the lobby.' });
        return;
      }

      const lobby = availableGames.find((game) => game.gameId === gameId);
      const stake = betAmountOverride ?? lobby?.betAmount ?? 0n;

      if (lobby) {
        const alreadyJoined = lobby.players.some(
          (player) => player.address.toLowerCase() === effectiveAddress.toLowerCase(),
        );
        if (alreadyJoined) {
          toast({ title: 'Already joined', description: 'You are already seated in this lobby.' });
          setSelectedGameId(gameId);
          return;
        }

        if (lobby.players.length >= lobby.maxPlayers) {
          toast({
            title: 'Lobby is full',
            description: 'This lobby has already reached the maximum number of players.',
            variant: 'destructive',
          });
          scheduleRefresh(gameId);
          return;
        }

      }

      if (stake <= 0n) {
        toast({
          title: 'Invalid wager',
          description: 'A non-zero betting amount is required to join.',
          variant: 'destructive',
        });
        return;
      }

      await sendTransaction(
        'join',
        { functionName: 'joinGame', args: [gameId], value: stake },
        'Joined the lobby.',
        { refreshGame: false, refreshLobbies: true },
      );
      setSelectedGameId(gameId);
      const ref = { id: gameId, owner: effectiveAddress.toLowerCase() };
      setStoredGameRef(ref);
      persistLastGameRef(ref);
    },
    [availableGames, effectiveAddress, persistLastGameRef, scheduleRefresh, sendTransaction, toast],
  );

  const matchGame = useCallback(
    async (maxPlayers: number, turnDuration: number, betAmountEth: string) => {
      if (!effectiveAddress) {
        toast({ title: 'Connect wallet', description: 'Sign in to find a match.' });
        return;
      }

      if (isWrongNetwork) {
        toast({
          title: 'Wrong network',
          description: 'Switch to the Sepolia network to continue.',
          variant: 'destructive',
        });
        return;
      }

      const trimmed = betAmountEth.trim();
      let stake: bigint;
      try {
        stake = parseEther(trimmed === '' ? '0' : trimmed);
      } catch {
        toast({ title: 'Invalid amount', description: 'Enter a valid numeric value in ETH.', variant: 'destructive' });
        return;
      }

      if (stake <= 0n) {
        toast({ title: 'Invalid wager', description: 'Bet amount must be greater than zero.', variant: 'destructive' });
        return;
      }

      await sendTransaction(
        'match',
        { functionName: 'matchGame', args: [BigInt(maxPlayers), stake, BigInt(turnDuration)], value: stake },
        'Matching you with other players…',
        { refreshLobbies: true },
      );
    },
    [effectiveAddress, isWrongNetwork, sendTransaction, toast],
  );

  const rollDice = useCallback(async () => {
    if (selectedGameId === null) return;
    await sendTransaction('roll', { functionName: 'rollDice', args: [selectedGameId] }, 'Dice rolled.');
  }, [selectedGameId, sendTransaction]);

  const movePiece = useCallback(
    async (pieceId: string) => {
      if (selectedGameId === null) return;
      const pieceIndex = Number(pieceId.split('-')[1] ?? '0');
      await sendTransaction(
        'move',
        { functionName: 'movePiece', args: [selectedGameId, BigInt(pieceIndex)] },
        'Piece moved.',
      );
    },
    [selectedGameId, sendTransaction],
  );

  const forcePass = useCallback(async () => {
    if (selectedGameId === null) return;
    await sendTransaction('forcePass', { functionName: 'forcePass', args: [selectedGameId] }, 'Turn forced to next player.');
  }, [selectedGameId, sendTransaction]);

  const resign = useCallback(async () => {
    if (selectedGameId === null) return;
    await sendTransaction(
      'resign',
      { functionName: 'resign', args: [selectedGameId] },
      'You have resigned from the game.',
      { refreshLobbies: true },
    );
    setSelectedGameId(null);
    clearStoredGameRef();
  }, [clearStoredGameRef, selectedGameId, sendTransaction]);

  const isSelectedGameActive = selectedGameId !== null && Boolean(effectiveAddress);

  useWatchContractEvent({
    address: LUDO_CONTRACT_ADDRESS,
    abi: ludoAbi,
    chainId: TARGET_CHAIN_ID,
    eventName: 'LobbyUpdated',
    enabled: Boolean(publicClient),
    onLogs: (logs) => {
      scheduleLobbyReload();
      logs.forEach((log) => {
        const gameId = BigInt(log.args.gameId ?? 0);
        if (selectedGameId !== null && selectedGameId === gameId) {
          scheduleRefresh(gameId);
        }
      });
    },
  });

  useEffect(() => {
    if (!publicClient || selectedGameId === null || !isSelectedGameActive) {
      return;
    }

    const gameScopedEvents: Array<{ name: 'PlayerWon' | 'PlayerDropped' | 'PlayerResigned' | 'DeadlineMissed' | 'DiceRolled' | 'PieceMoved' | 'TurnPassed' | 'TurnForfeited'; trackWinner?: boolean }> = [
      { name: 'PlayerWon', trackWinner: true },
      { name: 'PlayerDropped' },
      { name: 'PlayerResigned' },
      { name: 'DeadlineMissed' },
      { name: 'DiceRolled' },
      { name: 'PieceMoved' },
      { name: 'TurnPassed' },
      { name: 'TurnForfeited' },
    ];

    const unwatchers = gameScopedEvents.map(({ name, trackWinner }) => {
      try {
        return publicClient.watchContractEvent({
          address: LUDO_CONTRACT_ADDRESS,
          abi: ludoAbi,
          eventName: name,
          args: { gameId: selectedGameId },
          onLogs: (logs) => {
            logs.forEach((log) => {
              const args = log.args as { gameId: bigint; player?: Address };
              const gameId = BigInt(args.gameId);
              if (trackWinner && args.player) {
                const winner = getAddress(args.player);
                winnerByGameRef.current.set(gameId.toString(), { winner, timestamp: Date.now() });
              }
              scheduleRefresh(gameId);
            });
          },
        });
      } catch (error) {
        console.error('Failed to watch event', name, error);
        return undefined;
      }
    });

    return () => {
      unwatchers.forEach((unwatch) => {
        if (typeof unwatch === 'function') {
          unwatch();
        }
      });
    };
  }, [isSelectedGameActive, publicClient, scheduleRefresh, selectedGameId]);

  const isPlayerSeated = useMemo(() => {
    if (!gameState || !effectiveAddress) return false;
    return gameState.players.some((player) => player.address.toLowerCase() === effectiveAddress.toLowerCase());
  }, [effectiveAddress, gameState]);

  const isPlayerTurn = useMemo(() => {
    if (!gameState || !effectiveAddress) return false;
    if (gameState.gameStatus !== 'playing') return false;
    const current = gameState.players[gameState.currentPlayerIndex];
    return current ? current.address.toLowerCase() === effectiveAddress.toLowerCase() : false;
  }, [effectiveAddress, gameState]);

  const resumeLastGame = useCallback(() => {
    if (!storedGameRef) {
      toast({ title: 'No resumable game', description: 'You do not have an active game to resume.', variant: 'destructive' });
      return;
    }
    if (!effectiveAddress) {
      toast({
        title: 'Connect wallet',
        description: 'Reconnect the wallet you used in the previous game to resume.',
      });
      return;
    }
    if (storedGameRef.owner && storedGameRef.owner !== effectiveAddress.toLowerCase()) {
      toast({
        title: 'Wrong wallet',
        description: 'Switch to the wallet that created this game to continue.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedGameId(storedGameRef.id);
  }, [effectiveAddress, storedGameRef, toast]);

  return {
    account: effectiveAddress,
    availableGames,
    isLoadingAvailableGames: isLoadingLobbies,
    refetchAvailableGames,
    selectedGameId,
    selectGame: setSelectedGameId,
    lastKnownGameId,
    resumeLastGame,
    gameState,
    isGameLoading: isHydratingGame,
    turnTimer,
    validMoves,
    pendingAction,
    isPlayerSeated,
    isPlayerTurn,
    isWrongNetwork,
    joinGame,
    matchGame,
    rollDice,
    movePiece,
    forcePass,
    resign,
    refetchGameState,
  };
};

export type { LobbySummary, LobbyPlayerSummary };
