"use client";

import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";

// ── Singleton browser client ──────────────────────────────────────────────────

let _client: SupabaseClient | null | undefined;

/**
 * Returns the browser Supabase client, or null if env vars aren't configured.
 * Pages should treat null as "Realtime unavailable" and fall back to polling.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (_client !== undefined) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  _client = url && key ? createClient(url, key, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  }) : null;
  return _client;
}

// ── Realtime helpers ──────────────────────────────────────────────────────────

export interface WalletSubscriptionOpts {
  userId: string;
  onWalletChange?: () => void;
  onTransactionInsert?: () => void;
}

/**
 * Subscribes to changes on the user's wallet and any inserts on their transactions.
 * Returns an unsubscribe function. Returns no-op when Supabase isn't configured.
 */
export function subscribeToWalletChanges(
  opts: WalletSubscriptionOpts,
): () => void {
  const client = getSupabaseBrowser();
  if (!client) return () => {};

  const channel: RealtimeChannel = client
    .channel(`wallet:${opts.userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "wallets",
        filter: `user_id=eq.${opts.userId}`,
      },
      () => opts.onWalletChange?.(),
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "transactions",
      },
      () => opts.onTransactionInsert?.(),
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

// ── Notifications channel ─────────────────────────────────────────────────────

export interface NotificationPayload {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationSubscriptionOpts {
  userId: string;
  onInsert: (payload: NotificationPayload) => void;
  onUpdate?: (payload: NotificationPayload) => void;
}

/**
 * Subscribes to inserts and updates on the user's notifications row.
 * Channel name `user:{id}` matches the convention used by server-side publish.
 */
export function subscribeToNotifications(
  opts: NotificationSubscriptionOpts,
): () => void {
  const client = getSupabaseBrowser();
  if (!client) return () => {};

  const channel: RealtimeChannel = client
    .channel(`user:${opts.userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${opts.userId}`,
      },
      (payload) => {
        opts.onInsert(payload.new as NotificationPayload);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${opts.userId}`,
      },
      (payload) => {
        opts.onUpdate?.(payload.new as NotificationPayload);
      },
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
