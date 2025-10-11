import { useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';

const WalletConnectButton = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.connectorType === 'embedded') ?? null,
    [wallets]
  );

  useEffect(() => {
    if (!embeddedWallet?.address) return;
    if (address?.toLowerCase() === embeddedWallet.address.toLowerCase()) return;
    setActiveWallet(embeddedWallet).catch(() => undefined);
  }, [embeddedWallet, address, setActiveWallet]);

  const handleConnect = () => {
    login();
  };

  const handleDisconnect = async () => {
    disconnect();
    await logout();
  };

  if (!ready) {
    return (
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        Initializing
      </Button>
    );
  }

  if (authenticated) {
    const shortAddress = embeddedWallet?.address
      ? `${embeddedWallet.address.slice(0, 6)}...${embeddedWallet.address.slice(-4)}`
      : 'Wallet';
    return (
      <Button variant="outline" className="flex items-center gap-2" onClick={handleDisconnect}>
        <Wallet className="h-4 w-4" />
        {shortAddress}
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnectButton;
