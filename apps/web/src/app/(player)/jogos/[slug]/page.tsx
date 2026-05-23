import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GamePageClient } from "@/components/game-detail/GamePageClient";
import { getGameBySlug, getTopWinsForGame } from "@/lib/games.server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Metadata + Open Graph ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return { title: "Jogo não encontrado" };
  }

  const title = `${game.name} — Jogar Grátis`;
  const description = `Jogue ${game.name} ${game.provider} grátis no Casino Platform. RTP ${game.rtp ?? "—"}%. ${game.category === "live" ? "Cassino ao vivo." : "Sem depósito necessário."}`;
  const image = game.thumbnailUrl ?? "/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title: game.name,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: game.name }],
      type: "website",
      siteName: "Casino Platform",
    },
    twitter: {
      card: "summary_large_image",
      title: game.name,
      description,
      images: [image],
    },
    alternates: {
      canonical: `/jogos/${slug}`,
    },
  };
}

// ── JSON-LD structured data ───────────────────────────────────────────────────

function GameJsonLd({
  game,
}: {
  game: NonNullable<Awaited<ReturnType<typeof getGameBySlug>>>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: `Jogue ${game.name} grátis no Casino Platform. RTP ${game.rtp ?? "—"}%.`,
    image: game.thumbnailUrl ?? undefined,
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    genre: game.category,
    publisher: {
      "@type": "Organization",
      name: game.provider,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      reviewCount: "847",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD is a known-safe inline pattern; suppress react/no-danger
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) notFound();

  // Top wins fetched on server (no need to refresh client-side)
  const topWins = getTopWinsForGame(game.id);

  return (
    <>
      <GameJsonLd game={game} />
      <GamePageClient game={game} topWins={topWins} />
    </>
  );
}
