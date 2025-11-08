import { Address } from 'viem';

export const LUDO_CONTRACT_ADDRESS: Address = '0x01C4B7B09d287531AbFa3393576aFEd8B52AB580';

export enum GameStatusEnum {
  WaitingForPlayers = 0,
  Ready = 1,
  Playing = 2,
  Finished = 3,
}

export enum PlayerColorEnum {
  Red = 0,
  Blue = 1,
  Green = 2,
  Yellow = 3,
}

export enum ActivityKindEnum {
  DiceRoll = 0,
  Move = 1,
  TurnPassed = 2,
  TurnForfeited = 3,
  PlayerDropped = 4,
  PlayerResigned = 5,
  PlayerWon = 6,
}

export const ludoAbi = [
  {
    inputs: [
      { internalType: 'uint8', name: 'maxPlayers', type: 'uint8' },
      { internalType: 'uint256', name: 'turnDurationSeconds', type: 'uint256' },
    ],
    name: 'createGame',
    outputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'resign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'rollDice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { internalType: 'address', name: 'player', type: 'address' },
    ],
    name: 'legalMoves',
    outputs: [{ internalType: 'bool[4]', name: 'canMove', type: 'bool[4]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { internalType: 'uint8', name: 'pieceIndex', type: 'uint8' },
    ],
    name: 'movePiece',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'forcePass',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { internalType: 'address', name: 'player', type: 'address' },
    ],
    name: 'getPlayerView',
    outputs: [
      { internalType: 'bool', name: 'found', type: 'bool' },
      { internalType: 'uint8', name: 'playerIndex', type: 'uint8' },
      { internalType: 'uint8', name: 'color', type: 'uint8' },
      { internalType: 'int8[4]', name: 'positions', type: 'int8[4]' },
      { internalType: 'bool[4]', name: 'finished', type: 'bool[4]' },
      { internalType: 'bool', name: 'active', type: 'bool' },
      { internalType: 'uint8', name: 'missedDeadlinesCount', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'getTurn',
    outputs: [
      { internalType: 'address', name: 'whoseTurn', type: 'address' },
      { internalType: 'uint8', name: 'dice', type: 'uint8' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint8', name: 'playerIndex', type: 'uint8' },
      { internalType: 'uint8', name: 'sixStreak', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { internalType: 'uint8', name: 'count', type: 'uint8' },
    ],
    name: 'getRecentActivity',
    outputs: [
      {
        components: [
          { internalType: 'uint8', name: 'kind', type: 'uint8' },
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint8', name: 'dice', type: 'uint8' },
          { internalType: 'uint8', name: 'pieceIndex', type: 'uint8' },
          { internalType: 'int16', name: 'fromPos', type: 'int16' },
          { internalType: 'int16', name: 'toPos', type: 'int16' },
          { internalType: 'bool', name: 'captured', type: 'bool' },
          { internalType: 'uint8', name: 'victimPlayerIdx', type: 'uint8' },
          { internalType: 'uint8', name: 'victimPieceIdx', type: 'uint8' },
          { internalType: 'uint256', name: 'at', type: 'uint256' },
        ],
        internalType: 'struct LudoGame.ActivityEntry[]',
        name: 'out',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'getPlayerAddresses',
    outputs: [{ internalType: 'address[]', name: 'players', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'getGameSnapshot',
    outputs: [
      {
        components: [
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'uint8', name: 'maxPlayers', type: 'uint8' },
          { internalType: 'uint8', name: 'currentPlayerIndex', type: 'uint8' },
          { internalType: 'uint8', name: 'activePlayerCount', type: 'uint8' },
          { internalType: 'uint8', name: 'sixStreak', type: 'uint8' },
          { internalType: 'uint8', name: 'diceValue', type: 'uint8' },
          { internalType: 'uint32', name: 'turnDuration', type: 'uint32' },
          { internalType: 'uint256', name: 'turnDeadline', type: 'uint256' },
          { internalType: 'address', name: 'roller', type: 'address' },
          {
            components: [
              { internalType: 'address', name: 'account', type: 'address' },
              { internalType: 'uint8', name: 'color', type: 'uint8' },
              { internalType: 'bool', name: 'active', type: 'bool' },
              { internalType: 'uint8', name: 'missedDeadlines', type: 'uint8' },
              { internalType: 'int8[4]', name: 'positions', type: 'int8[4]' },
              { internalType: 'bool[4]', name: 'finished', type: 'bool[4]' },
            ],
            internalType: 'struct LudoGame.PlayerStateView[]',
            name: 'players',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct LudoGame.GameSnapshot',
        name: 'snapshot',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'cursor', type: 'uint256' },
      { internalType: 'uint256', name: 'limit', type: 'uint256' },
    ],
    name: 'getOpenGames',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'gameId', type: 'uint256' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'uint8', name: 'maxPlayers', type: 'uint8' },
          { internalType: 'uint32', name: 'turnDuration', type: 'uint32' },
          { internalType: 'uint8', name: 'playerCount', type: 'uint8' },
          { internalType: 'uint8', name: 'activePlayerCount', type: 'uint8' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'address[]', name: 'players', type: 'address[]' },
          { internalType: 'uint8[]', name: 'colors', type: 'uint8[]' },
          { internalType: 'bool[]', name: 'actives', type: 'bool[]' },
        ],
        internalType: 'struct LudoGame.LobbyView[]',
        name: 'lobbies',
        type: 'tuple[]',
      },
      { internalType: 'uint256', name: 'nextCursor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'maxPlayers', type: 'uint8' },
      { indexed: false, internalType: 'uint256', name: 'turnDuration', type: 'uint256' },
    ],
    name: 'GameCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'playerIndex', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'color', type: 'uint8' },
    ],
    name: 'PlayerJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'GameStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'value', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'sixStreak', type: 'uint8' },
    ],
    name: 'DiceRolled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'pieceIndex', type: 'uint8' },
      { indexed: false, internalType: 'int8', name: 'fromPos', type: 'int8' },
      { indexed: false, internalType: 'int8', name: 'toPos', type: 'int8' },
      { indexed: false, internalType: 'bool', name: 'captured', type: 'bool' },
      { indexed: false, internalType: 'bool', name: 'finished', type: 'bool' },
      { indexed: false, internalType: 'bool', name: 'extraTurn', type: 'bool' },
      { indexed: false, internalType: 'uint8', name: 'victimPlayerIdx', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'victimPieceIdx', type: 'uint8' },
    ],
    name: 'PieceMoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'nextPlayerIndex', type: 'uint8' },
    ],
    name: 'TurnPassed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'nextPlayerIndex', type: 'uint8' },
    ],
    name: 'TurnForfeited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'misses', type: 'uint8' },
      { indexed: false, internalType: 'bool', name: 'dropped', type: 'bool' },
    ],
    name: 'DeadlineMissed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
    ],
    name: 'PlayerDropped',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
    ],
    name: 'PlayerResigned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
    ],
    name: 'PlayerWon',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'status', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'playerCount', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'activePlayerCount', type: 'uint8' },
    ],
    name: 'LobbyUpdated',
    type: 'event',
  },
] as const;
