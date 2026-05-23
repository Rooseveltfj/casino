"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@casino/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiTransaction {
  id: string;
  type:
    | "deposit"
    | "withdrawal"
    | "bet"
    | "win"
    | "bonus_grant"
    | "bonus_release"
    | "adjustment"
    | "rollback";
  walletType: "demo" | "real" | "bonus";
  amount: string;
  balanceAfter: string;
  gameRoundId: string | null;
  provider: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ApiResponse {
  rows: ApiTransaction[];
  nextCursor: string | null;
}

const TYPE_LABEL: Record<ApiTransaction["type"], string> = {
  deposit: "Depósito",
  withdrawal: "Saque",
  bet: "Aposta",
  win: "Ganho",
  bonus_grant: "Bônus recebido",
  bonus_release: "Bônus liberado",
  adjustment: "Ajuste",
  rollback: "Estorno",
};

const TYPE_VARIANT: Record<ApiTransaction["type"], string> = {
  deposit: "bg-success/15 text-success border-success/30",
  withdrawal: "bg-warning/15 text-warning border-warning/30",
  bet: "bg-error/15 text-error border-error/30",
  win: "bg-success/15 text-success border-success/30",
  bonus_grant: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30",
  bonus_release: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30",
  adjustment: "bg-text-muted/15 text-text-muted border-border-default",
  rollback: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const TYPE_OPTIONS: { value: ApiTransaction["type"] | ""; label: string }[] = [
  { value: "", label: "Todos os tipos" },
  { value: "bet", label: "Apostas" },
  { value: "win", label: "Ganhos" },
  { value: "deposit", label: "Depósitos" },
  { value: "withdrawal", label: "Saques" },
  { value: "bonus_grant", label: "Bônus recebidos" },
  { value: "adjustment", label: "Ajustes" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBRL(v: string) {
  return parseFloat(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportCsv(rows: ApiTransaction[]) {
  const headers = ["Data", "Tipo", "Carteira", "Valor", "Saldo após", "ID"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        new Date(r.createdAt).toISOString(),
        TYPE_LABEL[r.type],
        r.walletType,
        r.amount,
        r.balanceAfter,
        r.id,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([`﻿${lines}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transacoes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HistorySection() {
  // Filters
  const [type, setType] = useState<ApiTransaction["type"] | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data
  const [rows, setRows] = useState<ApiTransaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Reset + load whenever filters change
  const fetchPage = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (type) params.set("type", type);
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);
        if (cursor) params.set("cursor", cursor);
        params.set("limit", "50");

        const res = await fetch(`/api/profile/transactions?${params.toString()}`);
        const body = (await res.json()) as ApiResponse;

        if (cursor) {
          setRows((prev) => [...prev, ...body.rows]);
        } else {
          setRows(body.rows);
        }
        setNextCursor(body.nextCursor);
      } catch {
        // empty
      } finally {
        setIsLoading(false);
      }
    },
    [type, fromDate, toDate],
  );

  useEffect(() => {
    void fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, fromDate, toDate]);

  // ── TanStack Table setup ──────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<ApiTransaction>[]>(
    () => [
      {
        id: "expander",
        size: 32,
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() =>
              setExpandedId((id) => (id === row.original.id ? null : row.original.id))
            }
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Expandir detalhes"
            aria-expanded={expandedId === row.original.id}
          >
            {expandedId === row.original.id ? (
              <ChevronDown size={12} aria-hidden="true" />
            ) : (
              <ChevronRight size={12} aria-hidden="true" />
            )}
          </button>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Data",
        cell: ({ getValue }) => (
          <span className="text-text-secondary text-xs font-mono">
            {formatDate(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ getValue }) => {
          const t = getValue() as ApiTransaction["type"];
          return (
            <span
              className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_VARIANT[t]}`}
            >
              {TYPE_LABEL[t]}
            </span>
          );
        },
      },
      {
        accessorKey: "walletType",
        header: "Carteira",
        cell: ({ getValue }) => (
          <span className="text-xs uppercase text-text-muted">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Valor",
        cell: ({ row }) => {
          const t = row.original.type;
          const isPositive = t === "deposit" || t === "win" || t === "bonus_grant" || t === "bonus_release" || t === "adjustment";
          return (
            <span
              className={`font-mono tabular-nums text-sm ${isPositive ? "text-success" : "text-error"}`}
            >
              {isPositive ? "+" : "-"}R$ {formatBRL(row.original.amount)}
            </span>
          );
        },
      },
      {
        accessorKey: "balanceAfter",
        header: "Saldo após",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-text-secondary tabular-nums">
            R$ {formatBRL(getValue() as string)}
          </span>
        ),
      },
    ],
    [expandedId],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Virtualization ────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: useCallback(
      (i: number) => (tableRows[i]?.original.id === expandedId ? 180 : 48),
      [expandedId, tableRows],
    ),
    overscan: 8,
  });

  // Recompute on expand change
  useEffect(() => {
    virtualizer.measure();
  }, [expandedId, virtualizer]);

  // Infinite scroll: load next page when near the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !nextCursor || isLoading) return;

    const onScroll = () => {
      const distFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distFromBottom < 200) void fetchPage(nextCursor);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [nextCursor, isLoading, fetchPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Histórico
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Todas as suas transações em um só lugar
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter
              size={14}
              className="text-accent-primary"
              aria-hidden="true"
            />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="filter-type" className="text-xs">Tipo</Label>
              <select
                id="filter-type"
                value={type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setType(e.target.value as ApiTransaction["type"] | "")
                }
                className="w-full h-9 px-2 rounded-lg bg-input border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-from" className="text-xs">De</Label>
              <Input
                id="filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-to" className="text-xs">Até</Label>
              <Input
                id="filter-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => exportCsv(rows)}
                variant="outline"
                size="sm"
                disabled={rows.length === 0}
                className="w-full gap-1.5"
              >
                <Download size={13} aria-hidden="true" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {rows.length === 0 && !isLoading ? (
            <p className="text-sm text-text-muted text-center py-12">
              Nenhuma transação encontrada.
            </p>
          ) : (
            <>
              {/* Sticky header */}
              <div className="grid grid-cols-[32px_1fr_120px_80px_140px_140px] gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-elevated text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {table.getFlatHeaders().map((header) => (
                  <div key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </div>
                ))}
              </div>

              {/* Virtualized body */}
              <div
                ref={scrollRef}
                className="overflow-y-auto"
                style={{ height: 480 }}
              >
                <div
                  style={{
                    height: virtualizer.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((vItem) => {
                    const row = tableRows[vItem.index];
                    if (!row) return null;
                    const isExpanded = expandedId === row.original.id;

                    return (
                      <div
                        key={row.id}
                        data-index={vItem.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${vItem.start}px)`,
                        }}
                        className="border-b border-border-subtle/40 hover:bg-surface-elevated/40 transition-colors"
                      >
                        <div className="grid grid-cols-[32px_1fr_120px_80px_140px_140px] gap-2 px-4 items-center" style={{ minHeight: 48 }}>
                          {row.getVisibleCells().map((cell) => (
                            <div key={cell.id} className="py-2">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          ))}
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-3 text-[11px] bg-surface/40">
                            <div className="rounded-lg border border-border-subtle p-3 space-y-1.5 font-mono">
                              <div className="flex gap-2">
                                <span className="text-text-muted w-20 shrink-0">ID</span>
                                <span className="text-text-secondary break-all">
                                  {row.original.id}
                                </span>
                              </div>
                              {row.original.gameRoundId && (
                                <div className="flex gap-2">
                                  <span className="text-text-muted w-20 shrink-0">Round ID</span>
                                  <span className="text-text-secondary break-all">
                                    {row.original.gameRoundId}
                                  </span>
                                </div>
                              )}
                              {row.original.provider && (
                                <div className="flex gap-2">
                                  <span className="text-text-muted w-20 shrink-0">Provider</span>
                                  <span className="text-text-secondary">
                                    {row.original.provider}
                                  </span>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <span className="text-text-muted w-20 shrink-0">Metadata</span>
                                <pre className="text-text-secondary text-[10px] overflow-x-auto flex-1">
                                  {JSON.stringify(row.original.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-text-muted">
                    <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                    Carregando…
                  </div>
                )}
              </div>

              {/* Footer count */}
              <div className="px-4 py-2.5 border-t border-border-subtle text-[11px] text-text-muted">
                <Badge variant="secondary" className="text-[10px]">
                  {rows.length} transações carregadas
                </Badge>
                {nextCursor && (
                  <span className="ml-2">• Role para carregar mais</span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
