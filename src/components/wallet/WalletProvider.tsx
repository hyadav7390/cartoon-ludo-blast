import { PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { wagmiConfig } from '@/configs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

const WalletProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
  </QueryClientProvider>
);

export default WalletProvider;
