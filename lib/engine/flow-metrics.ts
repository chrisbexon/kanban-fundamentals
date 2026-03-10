import type {
  FlowItem, FlowSeedData, ThroughputDay, MCTrial, MCBucket, CalendarCell,
} from "@/types/flow-metrics";

// ─── Date Helpers ───────────────────────────────────────────

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

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

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

// ─── Date Shifting ──────────────────────────────────────────

/** Shift all dates so dataEndDate becomes today */
export function shiftItemsToToday(seed: FlowSeedData): FlowItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = parseDate(seed.dataEndDate);
  const shift = diffDays(today, endDate);

  function shiftDate(d: string | null): string | null {
    if (!d) return null;
    return formatDate(addDays(parseDate(d), shift));
  }

  return seed.items.map((item) => ({
    ...item,
    backlog: shiftDate(item.backlog),
    analysisActive: shiftDate(item.analysisActive),
    analysisDone: shiftDate(item.analysisDone),
    devActive: shiftDate(item.devActive),
    devDone: shiftDate(item.devDone),
    testing: shiftDate(item.testing),
    done: shiftDate(item.done),
  }));
}

// ─── Throughput ─────────────────────────────────────────────

/** Get daily throughput (items completed per day) for a date range */
export function getDailyThroughput(items: FlowItem[], startDate: string, endDate: string): ThroughputDay[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const days: ThroughputDay[] = [];

  const doneItems = items.filter((it) => it.done !== null);

  let d = new Date(start);
  while (d <= end) {
    const ds = formatDate(d);
    const count = doneItems.filter((it) => it.done === ds).length;
    days.push({ date: ds, count });
    d = addDays(d, 1);
  }

  return days;
}

/** Get throughput samples (non-zero weekday counts) for Monte Carlo */
export function getThroughputSamples(items: FlowItem[], startDate: string, endDate: string): number[] {
  const daily = getDailyThroughput(items, startDate, endDate);
  // Include all weekdays (even zero throughput days) for realistic sampling
  return daily
    .filter((d) => {
      const dow = parseDate(d.date).getDay();
      return dow !== 0 && dow !== 6;
    })
    .map((d) => d.count);
}

// ─── Monte Carlo ────────────────────────────────────────────

/** Run Monte Carlo: How Many items in N days? */
export function mcHowMany(
  throughputSamples: number[],
  days: number,
  trials: number,
): MCTrial[] {
  if (throughputSamples.length === 0) return [];

  const results: MCTrial[] = [];
  for (let t = 0; t < trials; t++) {
    let total = 0;
    for (let d = 0; d < days; d++) {
      const sample = throughputSamples[Math.floor(Math.random() * throughputSamples.length)];
      total += sample;
    }
    results.push({ value: total });
  }
  return results;
}

/** Run Monte Carlo: How many days to complete N items? */
export function mcWhen(
  throughputSamples: number[],
  targetItems: number,
  trials: number,
): MCTrial[] {
  if (throughputSamples.length === 0 || targetItems <= 0) return [];

  const results: MCTrial[] = [];
  const maxDays = 365; // safety cap

  for (let t = 0; t < trials; t++) {
    let remaining = targetItems;
    let days = 0;
    while (remaining > 0 && days < maxDays) {
      const sample = throughputSamples[Math.floor(Math.random() * throughputSamples.length)];
      remaining -= sample;
      days++;
    }
    results.push({ value: days });
  }
  return results;
}

/** Bucket trial results into a distribution with cumulative percentages */
export function bucketTrials(trials: MCTrial[], bucketSize: number = 1): MCBucket[] {
  if (trials.length === 0) return [];

  const values = trials.map((t) => t.value).sort((a, b) => a - b);
  const min = values[0];
  const max = values[values.length - 1];

  const buckets: MCBucket[] = [];
  let cumCount = 0;

  for (let b = min; b <= max; b += bucketSize) {
    const count = values.filter((v) => v >= b && v < b + bucketSize).length;
    cumCount += count;
    buckets.push({
      bucket: b,
      count,
      cumPct: Math.round((cumCount / trials.length) * 100),
    });
  }

  return buckets;
}

/** Get percentile value from trials */
export function getPercentile(trials: MCTrial[], pct: number): number {
  if (trials.length === 0) return 0;
  const sorted = trials.map((t) => t.value).sort((a, b) => a - b);
  const idx = Math.floor((pct / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// ─── Calendar Heatmap ───────────────────────────────────────

/** Generate calendar heatmap for "When" mode — probability of completion by each date */
export function mcWhenCalendar(
  throughputSamples: number[],
  targetItems: number,
  startDate: string,
  trials: number,
): CalendarCell[] {
  const trialResults = mcWhen(throughputSamples, targetItems, trials);
  const start = parseDate(startDate);

  // For each day, what % of trials completed by that day?
  const sortedDays = trialResults.map((t) => t.value).sort((a, b) => a - b);
  const maxDay = sortedDays[sortedDays.length - 1] || 30;

  const cells: CalendarCell[] = [];
  for (let d = 0; d <= Math.min(maxDay + 14, 180); d++) {
    const date = addDays(start, d);
    const completedByDay = sortedDays.filter((v) => v <= d).length;
    const probability = Math.round((completedByDay / trials) * 100);

    cells.push({
      date: formatDate(date),
      probability,
      dayOfWeek: date.getDay(),
    });
  }

  return cells;
}

/** Generate calendar heatmap for "How Many" mode — probability of completing >= N items by end date */
export function mcHowManyCalendar(
  throughputSamples: number[],
  startDate: string,
  endDate: string,
  trials: number,
): CalendarCell[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const totalDays = diffDays(end, start);
  if (totalDays <= 0) return [];

  // Run one set of trials to get the distribution
  const trialResults = mcHowMany(throughputSamples, totalDays, trials);
  const sorted = trialResults.map((t) => t.value).sort((a, b) => a - b);

  // For each date from start, show probability of having completed
  // a progressively scaled target (proportional day of the range)
  // Actually for "how many" the calendar shows: for each day,
  // what's the probability of completing at LEAST the median by that day?
  // Better: run per-day simulations
  const cells: CalendarCell[] = [];
  const median = sorted[Math.floor(sorted.length / 2)];

  for (let d = 0; d <= totalDays; d++) {
    const date = addDays(start, d);
    if (d === 0) {
      cells.push({ date: formatDate(date), probability: 0, dayOfWeek: date.getDay() });
      continue;
    }
    // What % of trials would complete >= median items in d days?
    const dayTrials = mcHowMany(throughputSamples, d, Math.min(trials, 1000));
    const hitCount = dayTrials.filter((t) => t.value >= median).length;
    const probability = Math.round((hitCount / dayTrials.length) * 100);

    cells.push({
      date: formatDate(date),
      probability,
      dayOfWeek: date.getDay(),
    });
  }

  return cells;
}
