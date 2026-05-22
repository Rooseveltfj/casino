"use client";

import { ArrowDown, ArrowUp, Clock, DollarSign, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@casino/ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "alert";
  icon: React.ElementType;
  iconColor: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, iconColor }: StatCardProps) {
  const changeColor =
    changeType === "up"
      ? "text-success"
      : changeType === "alert"
        ? "text-error"
        : "text-text-muted";

  return (
    <Card className="bg-surface-elevated">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{title}</p>
            <p className="font-mono text-2xl font-bold text-text-primary">{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${changeColor}`}>
              {changeType === "up" && <ArrowUp size={12} />}
              {changeType === "down" && <ArrowDown size={12} />}
              {changeType === "alert" && <Clock size={12} />}
              {change}
            </div>
          </div>
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
          >
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Chart data ───────────────────────────────────────────────────────────────

const GGR_DATA = [
  { date: "15/05", ggr: 5420 },
  { date: "16/05", ggr: 7100 },
  { date: "17/05", ggr: 4850 },
  { date: "18/05", ggr: 9200 },
  { date: "19/05", ggr: 6300 },
  { date: "20/05", ggr: 11400 },
  { date: "21/05", ggr: 8420 },
];

const CASHFLOW_DATA = [
  { date: "15/05", depositos: 18000, saques: 6200 },
  { date: "16/05", depositos: 24000, saques: 8100 },
  { date: "17/05", depositos: 15000, saques: 5300 },
  { date: "18/05", depositos: 31000, saques: 12000 },
  { date: "19/05", depositos: 22000, saques: 9800 },
  { date: "20/05", depositos: 38000, saques: 15500 },
  { date: "21/05", depositos: 42100, saques: 13200 },
];

// Recharts shared theme
const CHART_THEME = {
  grid: "rgba(255,255,255,0.06)",
  axis: "#8892b0",
  tooltip: {
    contentStyle: { background: "#131826", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 },
    labelStyle: { color: "#f0f4ff", fontSize: 12 },
    itemStyle: { color: "#8892b0", fontSize: 12 },
  },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* ── Page title ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Visão geral da operação — dados de demonstração
        </p>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Jogadores Ativos"
          value="1.247"
          change="+12% vs semana passada"
          changeType="up"
          icon={Users}
          iconColor="#00D4FF"
        />
        <StatCard
          title="GGR Hoje"
          value="R$ 8.420"
          change="+5.2% vs ontem"
          changeType="up"
          icon={DollarSign}
          iconColor="#00F5A0"
        />
        <StatCard
          title="Depósitos 24h"
          value="R$ 42.100"
          change="+18% vs ontem"
          changeType="up"
          icon={Trophy}
          iconColor="#FFB800"
        />
        <StatCard
          title="Saques Pendentes"
          value="3"
          change="Aguardando aprovação"
          changeType="alert"
          icon={Clock}
          iconColor="#FF3D71"
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* GGR Line Chart */}
        <Card className="bg-surface-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-accent-primary" />
              GGR — Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={GGR_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_THEME.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={CHART_THEME.tooltip.contentStyle}
                  labelStyle={CHART_THEME.tooltip.labelStyle}
                  itemStyle={CHART_THEME.tooltip.itemStyle}
                  formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "GGR"]}
                />
                <Line
                  type="monotone"
                  dataKey="ggr"
                  stroke="#00D4FF"
                  strokeWidth={2.5}
                  dot={{ fill: "#00D4FF", r: 4 }}
                  activeDot={{ r: 6, fill: "#00D4FF", stroke: "#0A0E1A", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deposits vs Withdrawals Bar Chart */}
        <Card className="bg-surface-elevated">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-accent-primary" />
                <span className="text-text-muted">vs</span>
                <span className="h-3 w-3 rounded-full bg-accent-secondary" />
              </span>
              Depósitos vs Saques — 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CASHFLOW_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }} barSize={10}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_THEME.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={CHART_THEME.tooltip.contentStyle}
                  labelStyle={CHART_THEME.tooltip.labelStyle}
                  itemStyle={CHART_THEME.tooltip.itemStyle}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString("pt-BR")}`,
                    name === "depositos" ? "Depósitos" : "Saques",
                  ]}
                />
                <Bar dataKey="depositos" fill="#00D4FF" radius={[3, 3, 0, 0]} name="depositos" />
                <Bar dataKey="saques" fill="#FFB800" radius={[3, 3, 0, 0]} name="saques" />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-primary" />
                Depósitos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-secondary" />
                Saques
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
