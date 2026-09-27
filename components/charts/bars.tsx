"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useTokens() {
  if (typeof window === "undefined") {
    return { grid: "rgba(255,255,255,0.06)", tick: "#5d6f86", bg: "#101826", border: "rgba(255,255,255,0.1)", ink: "#e9f0fb" };
  }
  const light = document.documentElement.classList.contains("light");
  return {
    grid: light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
    tick: light ? "#8796ad" : "#5d6f86",
    bg: light ? "#ffffff" : "#101826",
    border: light ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)",
    ink: light ? "#0f172e" : "#e9f0fb",
  };
}

export function CountBarChart({
  data,
  height = 240,
  format,
  defaultColor = "#55a1ff",
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  format?: (v: number) => string;
  defaultColor?: string;
}) {
  const tk = useTokens();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barSize={28}>
          <CartesianGrid stroke={tk.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: tk.tick, fontSize: 10.5 }}
            tickLine={false}
            axisLine={{ stroke: tk.grid }}
            interval={0}
          />
          <YAxis
            tick={{ fill: tk.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`)}
          />
          <Tooltip
            cursor={{ fill: "rgba(85,161,255,0.06)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const value = Number(payload[0].value ?? 0);
              const color = (payload[0].payload as { color?: string })?.color ?? defaultColor;
              return (
                <div
                  className="rounded-xl border px-3 py-2 text-[12px] shadow-pop"
                  style={{ background: tk.bg, borderColor: tk.border, color: tk.ink }}
                >
                  <p className="font-medium">{label}</p>
                  <p className="mt-0.5 font-semibold tabular-nums" style={{ color }}>
                    {format ? format(value) : value.toLocaleString("en-US")}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color ?? defaultColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({
  data,
  centerValue,
  centerLabel,
  height = 190,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  centerValue: string;
  centerLabel: string;
  height?: number;
}) {
  const tk = useTokens();
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={54}
            outerRadius={74}
            paddingAngle={3}
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              return (
                <div
                  className="rounded-xl border px-3 py-2 text-[12px] shadow-pop"
                  style={{ background: tk.bg, borderColor: tk.border, color: tk.ink }}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-0.5 font-semibold tabular-nums">
                    {Number(p.value ?? 0).toLocaleString("en-US")}
                  </p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-2xl font-bold tabular-nums text-ink">{centerValue}</p>
        <p className="text-[10.5px] text-ink-3">{centerLabel}</p>
      </div>
    </div>
  );
}