import { Link } from 'react-router-dom';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

const Index = () => {
  const highlights = [
    {
      icon: '🎨',
      title: 'Illustrated arenas',
      body: 'Custom boards, glowing paths, and expressive tokens make every roll feel like a Saturday-morning cartoon.',
    },
    {
      icon: '🛡️',
      title: 'On-chain trust',
      body: 'All bets, turns, and captures settle on Ethereum. No hidden logic—only verifiable smart contracts.',
    },
    {
      icon: '🤝',
      title: 'Instant matchmaking',
      body: 'Pick your stake, auto-queue with other players, and let the contract seat you at a fair table.',
    },
    {
      icon: '⚙️',
      title: 'Wallet-native UX',
      body: 'WalletConnect, MetaMask, Coinbase Wallet, or Privy—connect once and play across devices.',
    },
  ];

  const steps = [
    {
      label: '01',
      title: 'Connect & choose your stake',
      copy: 'Set your wager in ETH, lock it in the contract, and pick a turn timer that matches your playstyle.',
    },
    {
      label: '02',
      title: 'Auto-match with opponents',
      copy: 'Cartoon Ludo Blast pairs you with players who picked the same stake. No manual invites required.',
    },
    {
      label: '03',
      title: 'Roll, race, and cash out',
      copy: 'The last player standing takes the entire prize pool. Celebratory confetti highly encouraged.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff3f7] via-[#fef6e4] to-[#e9f6ff] flex flex-col text-slate-900">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <span className="text-3xl">🎨</span>
            Cartoon Ludo Blast
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link to="/lobby" className="hover:text-slate-900 transition-colors">
              Lobby
            </Link>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
              Docs
            </a>
          </nav>
          <WalletConnectButton />
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-16 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-pink-600 bg-pink-100/80 px-3 py-1 rounded-full shadow-sm">
              ⚡ Cartoon crypto arcade
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-900">
              Roll the dice in a whimsical, provably-fair Ludo stadium.
            </h1>
            <p className="text-lg text-slate-700">
              Stake ETH, auto-match with the same wager, and let our smart contract handle every move, capture, and payout. It’s childhood nostalgia meets on-chain finality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/lobby"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-transform"
              >
                Play now
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl border border-slate-300 text-slate-800 font-semibold hover:bg-white transition-colors"
              >
                Audit the contract
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-slate-600">
              <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
                <p className="text-pink-500 text-xl font-black">500+</p>
                <p>Unique players matched</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
                <p className="text-indigo-500 text-xl font-black">12Ξ</p>
                <p>Prize pools paid out</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 border border-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-10 -left-4 w-40 h-40 bg-sky-100 rounded-full blur-3xl opacity-60" />
            <div className="relative space-y-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">🎲</span> Match preview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['Red Rovers', 'Blue Breezers', 'Green Guardians', 'Yellow Yaks'].map((team, index) => (
                  <div key={team} className="rounded-2xl border border-slate-100 p-4 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Seat {index + 1}</p>
                    <p className="text-sm font-semibold text-slate-800">{team}</p>
                    <p className="text-xs text-slate-500 mt-1">Stake 0.05 ETH</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-pink-100 bg-pink-50/80 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-pink-500 font-semibold">Prize pool</p>
                  <p className="text-2xl font-black text-pink-600">0.20 ETH</p>
                  <p className="text-xs text-pink-600">Winner takes 100%</p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Why players love BLAST arenas</h2>
          <p className="text-center text-slate-600 mb-10">Cartoon art direction meets battle-tested solidity.</p>
          <div className="grid gap-6 md:grid-cols-2">
            {highlights.map((card) => (
              <div key={card.title} className="rounded-3xl bg-white/90 border border-white/80 p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/80 border-y border-white/70">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-10">How it works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">{step.label}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-10 shadow-[0_20px_60px_rgba(99,102,241,0.4)]">
            <p className="uppercase text-xs font-bold tracking-[0.35em] text-white/80 mb-3">Join the cartoon cohort</p>
            <h2 className="text-3xl font-black mb-4">Ready to roll for the pot?</h2>
            <p className="text-white/90 mb-8">
              Queue up with your friends—or total strangers. Either way, the smart contract keeps score.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/lobby" className="px-6 py-3 rounded-2xl bg-white text-pink-600 font-semibold shadow-lg hover:-translate-y-0.5 transition-transform">
                Find a match
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl border border-white/70 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                View contract
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Cartoon Ludo Blast · Illustrated with ❤️ on-chain
      </footer>
    </div>
  );
};

export default Index;
