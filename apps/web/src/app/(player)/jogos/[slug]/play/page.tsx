import { notFound } from "next/navigation";
import { PlayClient } from "./play-client";
import { getGameBySlug } from "@/lib/games.server";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    session?: string;
    wallet?: string;
  }>;
}

// This page is rendered inside the GameFrame iframe.
// Layout has no headers or chrome — full-screen game canvas only.
export default async function PlayPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const game = await getGameBySlug(slug);
  if (!game) notFound();

  return (
    <PlayClient
      slug={slug}
      gameName={game.name}
      category={game.category}
      sessionId={sp.session ?? "no-session"}
      walletType={(sp.wallet as "demo" | "real" | "bonus") ?? "demo"}
    />
  );
}
