import { useMemo } from 'react';
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, Plug, Wallet } from 'lucide-react';
import { TARGET_CHAIN_ID } from '@/configs';
import { cn } from '@/lib/utils';

const WalletConnectButton = () => {
  const { address, chainId } = useAccount();
  const { connectors, connect, isLoading: isConnecting, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching, chains } = useSwitchChain();
  const { data: balanceData } = useBalance({
    address,
    chainId: TARGET_CHAIN_ID,
    enabled: Boolean(address),
    watch: true,
  });

  const isWrongNetwork = Boolean(address && chainId && chainId !== TARGET_CHAIN_ID);
  const targetChainName = useMemo(() => {
    const chain = chains.find((c) => c.id === TARGET_CHAIN_ID);
    return chain?.name ?? 'Target Chain';
  }, [chains]);

  const availableConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      if (seen.has(connector.id)) return false;
      seen.add(connector.id);
      return true;
    });
  }, [connectors]);

  const readyConnectors = useMemo(
    () => availableConnectors.filter((connector) => connector.ready),
    [availableConnectors],
  );

  const primaryConnector = useMemo(() => {
    const priority = ['metaMask', 'injected', 'walletConnect'];
    for (const id of priority) {
      const candidate = readyConnectors.find((connector) => connector.id === id);
      if (candidate) return candidate;
    }
    return readyConnectors[0] ?? availableConnectors.find((connector) => connector.id === 'walletConnect') ?? availableConnectors[0];
  }, [availableConnectors, readyConnectors]);

  const handleConnect = (connector: typeof availableConnectors[number] | undefined) => {
    if (!connector) return;
    connect({ connector }).catch((error) => {
      console.error('[wallet] Failed to connect', error);
    });
  };

  if (!address) {
    const connectorsPresent = Boolean(primaryConnector);
    const primaryPending = pendingConnector?.uid === primaryConnector?.uid && isConnecting;

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => handleConnect(primaryConnector)}
          className="flex items-center gap-2"
          disabled={!connectorsPresent || isConnecting}
        >
          {primaryPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
          Connect Wallet
        </Button>
        {availableConnectors.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10" disabled={isConnecting && !primaryPending}>
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">More wallets</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableConnectors.map((connector) => {
                const isPending = pendingConnector?.uid === connector.uid && isConnecting;
                return (
                  <DropdownMenuItem
                    key={connector.uid}
                    disabled={!connector.ready}
                    onSelect={(event) => {
                      event.preventDefault();
                      handleConnect(connector);
                    }}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{connector.name}</span>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!connectorsPresent && (
          <p className="text-xs text-muted-foreground">Install MetaMask or use WalletConnect to continue.</p>
        )}
      </div>
    );
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const balanceFormatted = balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '–';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="font-semibold text-sm">{shortAddress}</span>
        </div>
        <div className="hidden sm:block h-6 w-px bg-border" />
        <div className="text-xs text-muted-foreground flex flex-col">
          <span className={cn('font-semibold', isWrongNetwork && 'text-red-500')}>
            Chain: {isWrongNetwork ? 'Wrong network' : targetChainName}
          </span>
          <span>Balance: {balanceFormatted}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isWrongNetwork && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => switchChain?.({ chainId: TARGET_CHAIN_ID })}
            disabled={isSwitching}
            className="flex items-center gap-2"
          >
            <Plug className="h-4 w-4" />
            {isSwitching ? 'Switching…' : `Switch to ${targetChainName}`}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default WalletConnectButton;
