"use client";

import { useState, useMemo } from "react";
import type { FlowItem, MCMode, MCConfig } from "@/types/flow-metrics";
import seedData from "@/data/flow-metrics-seed.json";
import {
  shiftItemsToToday,
  getDailyThroughput,
  getThroughputSamples,
  mcHowMany,
  mcWhen,
  bucketTrials,
  getPercentile,
  mcWhenCalendar,
  mcHowManyCalendar,
} from "@/lib/engine/flow-metrics";
import type { FlowSeedData } from "@/types/flow-metrics";

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function useFlowMetrics() {
  const items = useMemo(() => shiftItemsToToday(seedData as unknown as FlowSeedData), []);

  // Find date range of completed items
  const dateRange = useMemo(() => {
    const doneItems = items.filter((it) => it.done !== null);
    const doneDates = doneItems.map((it) => it.done!).sort();
    const earliest = doneDates[0] || formatDate(new Date());
    const latest = doneDates[doneDates.length - 1] || formatDate(new Date());
    return { earliest, latest };
  }, [items]);

  const today = formatDate(new Date());

  // MC config state
  const [mode, setMode] = useState<MCMode>("when");
  const [throughputStart, setThroughputStart] = useState(dateRange.earliest);
  const [throughputEnd, setThroughputEnd] = useState(dateRange.latest);
  const [trials, setTrials] = useState(10000);

  // "When" mode: target items
  const backlogCount = items.filter((it) => it.done === null).length;
  const [targetItems, setTargetItems] = useState(Math.max(backlogCount, 10));

  // "How Many" mode: forecast window
  const [forecastDays, setForecastDays] = useState(30);

  // Derived data
  const throughput = useMemo(
    () => getDailyThroughput(items, throughputStart, throughputEnd),
    [items, throughputStart, throughputEnd],
  );

  const samples = useMemo(
    () => getThroughputSamples(items, throughputStart, throughputEnd),
    [items, throughputStart, throughputEnd],
  );

  const mcResults = useMemo(() => {
    if (samples.length === 0) return null;

    if (mode === "when") {
      const trialResults = mcWhen(samples, targetItems, trials);
      const buckets = bucketTrials(trialResults);
      const p50 = getPercentile(trialResults, 50);
      const p85 = getPercentile(trialResults, 85);
      const p95 = getPercentile(trialResults, 95);
      const calendar = mcWhenCalendar(samples, targetItems, today, Math.min(trials, 2000));
      return { trialResults, buckets, p50, p85, p95, calendar };
    } else {
      const trialResults = mcHowMany(samples, forecastDays, trials);
      const buckets = bucketTrials(trialResults);
      // For "how many", confidence is inverted: 85% confidence = "at least X items"
      // so we read from the LEFT of the distribution (low percentiles)
      const p50 = getPercentile(trialResults, 50);
      const p85 = getPercentile(trialResults, 15); // 85% of sims did at least this many
      const p95 = getPercentile(trialResults, 5);  // 95% of sims did at least this many
      const calendar = mcHowManyCalendar(samples, today, formatDate(addDays(new Date(), forecastDays)), Math.min(trials, 2000));
      return { trialResults, buckets, p50, p85, p95, calendar };
    }
  }, [samples, mode, targetItems, forecastDays, trials, today]);

  return {
    items,
    mode,
    setMode,
    throughputStart,
    setThroughputStart,
    throughputEnd,
    setThroughputEnd,
    trials,
    setTrials,
    targetItems,
    setTargetItems,
    forecastDays,
    setForecastDays,
    throughput,
    samples,
    mcResults,
    dateRange,
    today,
    backlogCount,
  };
}
