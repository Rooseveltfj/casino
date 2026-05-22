import Link from "next/link";
import { Gamepad2, Tv, Zap } from "lucide-react";
import { Badge, Button, Logo } from "@casino/ui";

// ── Static game data ─────────────────────────────────────────────────────────

interface GameData {
  slug: string;
  name: string;
  provider: string;
  category: string;
  rtp: string;
  isFeatured: boolean;
  color: string;
}

const FEATURED_GAMES: GameData[] = [
  { slug: "aviatorx", name: "AviatorX", provider: "Internal", category: "Crash", rtp: "97.0", isFeatured: true, color: "from-[#0A0E1A] to-[#003d5c]" },
  { slug: "diamond-mines", name: "Diamond Mines", provider: "Internal", category: "Instant", rtp: "97.0", isFeatured: true, color: "from-[#0A0E1A] to-[#1a1a4e]" },
  { slug: "neon-dragon", name: "Neon Dragon", provider: "Internal", category: "Slot", rtp: "96.1", isFeatured: true, color: "from-[#0A0E1A] to-[#1a0030]" },
  { slug: "plinko-pro", name: "Plinko Pro", provider: "Internal", category: "Instant", rtp: "97.0", isFeatured: false, color: "from-[#0A0E1A] to-[#002a1a]" },
  { slug: "pirates-fortune", name: "Pirate's Fortune", provider: "Internal", category: "Slot", rtp: "95.5", isFeatured: true, color: "from-[#0A0E1A] to-[#2a1a00]" },
  { slug: "live-roulette-royale", name: "Live Roulette Royale", provider: "Internal", category: "Ao Vivo", rtp: "97.3", isFeatured: true, color: "from-[#0A0E1A] to-[#1a0a2a]" },
];

const LIVE_GAMES = [
  { name: "Baccarat Prestige", players: 142, color: "from-[#0A0E1A] to-[#1a2a0a]" },
  { name: "Roulette Royale", players: 89, color: "from-[#0A0E1A] to-[#2a0a1a]" },
  { name: "Blackjack VIP", players: 56, color: "from-[#0A0E1A] to-[#0a1a2a]" },
  { name: "Dragon Tiger", players: 34, color: "from-[#0A0E1A] to-[#1a1a0a]" },
];

const PROMOS = [
  { title: "Bônus de Boas-vindas", desc: "100% até R$ 500 no primeiro depósito", cta: "Resgatar", color: "cyan" },
  { title: "Cashback Semanal", desc: "10% de cashback toda segunda-feira", cta: "Saiba mais", color: "gold" },
  { title: "Free Spins Quinta", desc: "50 giros grátis no jogo da semana", cta: "Participar", color: "cyan" },
];

// ── Game Card ────────────────────────────────────────────────────────────────

function GameCard({ game }: { game: GameData }) {
  return (
    <Link href={`/jogos/${game.slug}`} className="group block">
      <div className="relative rounded-xl overflow-hidden border border-border-default hover:border-accent-primary/50 transition-all hover:shadow-glow-primary bg-surface-elevated">
        {/* Thumbnail */}
        <div
          className={`aspect-[3/4] bg-gradient-to-br ${game.color} flex flex-col items-center justify-center gap-3 relative`}
        >
          <Gamepad2 size={32} className="text-text-muted opacity-30" />
          <p className="text-[10px] text-text-muted uppercase tracking-wider">
            {game.category}
          </p>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="sm" className="text-xs scale-90 group-hover:scale-100 transition-transform">
              Jogar
            </Button>
          </div>

          {game.isFeatured && (
            <span className="absolute top-2 left-2 text-[9px] font-bold bg-accent-secondary text-background px-1.5 py-0.5 rounded-full uppercase">
              Destaque
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="text-xs font-medium text-text-primary truncate">{game.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-text-muted truncate flex-1">{game.provider}</span>
            <span className="text-[10px] font-mono text-accent-primary shrink-0">
              {game.rtp}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PlayerHomePage() {
  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[340px] sm:min-h-[400px] flex items-center px-4 sm:px-8 py-12">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 80% 50%, rgba(0,212,255,0.1) 0%, rgba(255,184,0,0.05) 50%, transparent 80%)",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Logo size={48} />
            <Badge variant="default" className="text-xs">Demo</Badge>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-text-primary leading-tight">
            A melhor plataforma{" "}
            <span className="text-accent-primary">de cassino</span>
          </h1>
          <p className="mt-4 text-text-secondary text-sm sm:text-base max-w-lg">
            Slots, ao vivo, crash e esportes — tudo em um só lugar. Comece com
            R$&nbsp;1.000 de saldo demo sem depósito.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild size="lg">
              <Link href="/register">Jogar Grátis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/jogos">Ver Todos os Jogos</Link>
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-8 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              30+ jogos disponíveis
            </span>
            <span>RTP médio 96.5%</span>
            <span>Sem depósito</span>
          </div>
        </div>
      </section>

      {/* ── Featured games ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2">
            <Zap size={20} className="text-accent-primary" />
            Jogos em Destaque
          </h2>
          <Link
            href="/jogos"
            className="text-sm text-accent-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {FEATURED_GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      {/* ── Live casino ───────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-8 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2">
            <Tv size={20} className="text-error" />
            Casino ao Vivo
            <span className="text-xs font-normal text-error bg-error/20 border border-error/30 px-2 py-0.5 rounded-full animate-pulse">
              AO VIVO
            </span>
          </h2>
          <Link href="/ao-vivo" className="text-sm text-accent-primary hover:underline">
            Ver sala →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LIVE_GAMES.map(({ name, players, color }) => (
            <Link
              key={name}
              href="/ao-vivo"
              className="group relative rounded-xl overflow-hidden border border-border-default hover:border-error/50 transition-all"
            >
              <div
                className={`aspect-video bg-gradient-to-br ${color} flex flex-col items-center justify-center gap-2`}
              >
                <Tv size={24} className="text-text-muted opacity-40" />
                <span className="text-[10px] text-error bg-error/20 border border-error/30 px-2 py-0.5 rounded-full">
                  ● AO VIVO
                </span>
              </div>
              <div className="p-2.5 bg-surface-elevated">
                <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{players} jogadores</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Promotions ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-8 border-t border-border-subtle">
        <h2 className="font-heading text-xl font-bold text-text-primary mb-5">
          Promoções Ativas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROMOS.map(({ title, desc, cta, color }) => (
            <div
              key={title}
              className="relative rounded-xl border border-border-default bg-surface-elevated overflow-hidden p-5 hover:border-accent-primary/40 transition-all"
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background:
                    color === "cyan"
                      ? "radial-gradient(ellipse at 80% 20%, #00D4FF, transparent 70%)"
                      : "radial-gradient(ellipse at 80% 20%, #FFB800, transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${color === "cyan" ? "text-accent-primary" : "text-accent-secondary"}`}
                >
                  Promoção
                </p>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  {title}
                </h3>
                <p className="text-sm text-text-secondary mt-1.5 mb-4">{desc}</p>
                <Button
                  variant={color === "gold" ? "gold" : "default"}
                  size="sm"
                  asChild
                >
                  <Link href="/promocoes">{cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
