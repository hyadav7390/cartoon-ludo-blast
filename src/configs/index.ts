import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';

export const TARGET_CHAIN = sepolia;
export const TARGET_CHAIN_ID = sepolia.id;

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!WALLETCONNECT_PROJECT_ID) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not defined. Please set it before running the dapp.');
}
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://cartoon-ludo-blast.app';
const APP_METADATA = {
  name: 'Cartoon Ludo Blast',
  description: 'On-chain multiplayer Ludo experience.',
  url: APP_URL,
  icons: [`${APP_URL}/icon.png`],
};

const baseConnectors = [
  injected({ shimDisconnect: true }),
  metaMask({ shimDisconnect: true }),
  coinbaseWallet({ appName: APP_METADATA.name, preference: 'all' }),
  walletConnect({
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: true,
    metadata: APP_METADATA,
  }),
];

const connectors = baseConnectors.filter((connector, index, arr) => {
  const firstIndex = arr.findIndex((candidate) => candidate.id === connector.id);
  return firstIndex === index;
});

const sepoliaTransport = http(SEPOLIA_RPC_URL || undefined, { batch: true });

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet] as const,
  transports: {
    [sepolia.id]: sepoliaTransport,
    [mainnet.id]: http(),
  },
  connectors,
  multiInjectedProviderDiscovery: false,
  pollingInterval: 15_000,
});
