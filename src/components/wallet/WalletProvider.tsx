import { PropsWithChildren, useMemo } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, defaultChain, supportedChains, PRIVY_APP_ID } from '@/configs';

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

const WalletProvider = ({ children }: PropsWithChildren) => {
  const privyConfig = useMemo(
    () => ({
      supportedChains,
      defaultChain,
      appearance: {
        loginMessage: 'Cartoon Ludo Blast',
        theme: 'light',
        accentColor: '#8B5CF6',
      },
      embeddedWallets: {
        createOnLogin: 'all-users',
        requireUserPasswordOnCreate: false,
        showWalletUIs: false,
      },
      loginMethods: ['email', 'wallet'],
      fundingMethodConfig: {
        moonpay: {
          useSandbox: true,
        },
      },
    }),
    []
  );

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default WalletProvider;
