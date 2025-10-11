import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { monadTestnet } from '@/types/monadTestnet';

export const PRIVY_APP_ID = 'cmgmmkerv016jjo0c8993auq1';

export const supportedChains = [monadTestnet, sepolia, mainnet] as const;
export const defaultChain = monadTestnet;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [monadTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});
