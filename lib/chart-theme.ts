export const CHART_TOOLTIP = {
  contentStyle: {
    background: "var(--bg-tooltip)",
    border: "1px solid var(--border-tooltip)",
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
  },
  labelStyle: { color: "var(--text-secondary)" },
  itemStyle: { color: "var(--text-primary)" },
};

export const CHART_GRID = "var(--chart-grid)";
export const CHART_AXIS = "var(--chart-axis)";
export const CHART_TICK = { fontSize: 10, fontFamily: "'JetBrains Mono', monospace" } as const;
export const CHART_TICK_SM = { fontSize: 9, fontFamily: "'JetBrains Mono', monospace" } as const;
export const CHART_LABEL = { fontSize: 10, fill: "var(--chart-axis)" } as const;
export const CHART_LABEL_SM = { fontSize: 9, fill: "var(--chart-axis)" } as const;
