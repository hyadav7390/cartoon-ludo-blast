import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

export const TARGET_CHAIN = sepolia;
export const TARGET_CHAIN_ID = sepolia.id;

const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '9871f4b1d2f9403da6e8f2f4fba5f6b7';
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;

const baseConnectors = [
  injected({ shimDisconnect: true }),
  walletConnect({
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: true,
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
