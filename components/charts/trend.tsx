"use client";

import { useApp } from "@/lib/store";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useThemeTokens() {
  if (typeof window === "undefined") {
    return {
      isLight: false,
      grid: "rgba(255,255,255,0.06)",
      tick: "#5d6f86",
      tooltipBg: "#101826",
      tooltipBorder: "rgba(255,255,255,0.1)",
      ink: "#e9f0fb",
    };
  }
  const light = document.documentElement.classList.contains("light");
  return {
    isLight: light,
    grid: light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
    tick: light ? "#8796ad" : "#5d6f86",
    tooltipBg: light ? "#ffffff" : "#101826",
    tooltipBorder: light ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)",
    ink: light ? "#0f172e" : "#e9f0fb",
  };
}

const tickFmt = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}K` : `${Math.round(v)}`;

export function FinancialTrendChart({
  data,
  height = 240,
}: {
  data: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  height?: number;
}) {
  const { money } = useApp();
  const tk = useThemeTokens();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="finRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#55a1ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#55a1ff" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="finExpensesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={tk.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: tk.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: tk.grid }}
          />
          <YAxis
            tick={{ fill: tk.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={tickFmt}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const find = (k: string) =>
                Number(payload.find((p) => p.dataKey === k)?.value ?? 0);
              return (
                <div
                  className="rounded-xl border px-3 py-2 text-[12px] shadow-pop"
                  style={{
                    background: tk.tooltipBg,
                    borderColor: tk.tooltipBorder,
                    color: tk.ink,
                  }}
                >
                  <p className="font-medium">{label}</p>
                  <p className="mt-1 font-semibold tabular-nums text-accent">
                    Revenue · {money(find("revenue"))}
                  </p>
                  <p className="font-semibold tabular-nums text-warn">
                    Expenses · {money(find("expenses"))}
                  </p>
                  <p className="font-semibold tabular-nums text-cyan">
                    Profit · {money(find("profit"))}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#55a1ff"
            strokeWidth={2.2}
            fill="url(#finRevenueFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#fbbf24"
            strokeWidth={2}
            fill="url(#finExpensesFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#35d3f2"
            strokeWidth={1.6}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 3.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleTrendChart({
  data,
  color = "#55a1ff",
  format,
  height = 220,
}: {
  data: Array<{ month: string; value: number }>;
  color?: string;
  format?: (v: number) => string;
  height?: number;
}) {
  const { money } = useApp();
  const tk = useThemeTokens();
  const gid = `simple-${color.replace("#", "")}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={tk.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: tk.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: tk.grid }}
          />
          <YAxis
            tick={{ fill: tk.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={tickFmt}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const value = Number(payload[0].value ?? 0);
              return (
                <div
                  className="rounded-xl border px-3 py-2 text-[12px] shadow-pop"
                  style={{
                    background: tk.tooltipBg,
                    borderColor: tk.tooltipBorder,
                    color: tk.ink,
                  }}
                >
                  <p className="font-medium">{label}</p>
                  <p className="mt-0.5 font-semibold tabular-nums" style={{ color }}>
                    {format ? format(value) : money(value)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gid})`}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}