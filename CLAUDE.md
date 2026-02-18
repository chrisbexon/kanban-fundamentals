# Kanban Fundamentals Training Platform

## Project Overview

Interactive web-based training platform teaching Kanban principles through hands-on simulations. Each lesson combines theory, interactive games, data visualization, and knowledge checks to build understanding progressively.

## Vision

Replace static training materials with engaging, simulation-driven lessons where learners **experience** Kanban concepts (batch size, WIP limits, flow metrics) before being taught the theory.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion + CSS keyframes
- **Fonts**: Outfit (sans), JetBrains Mono (mono)

## Project Structure

```
app/                    → Next.js App Router pages
  (platform)/           → Route group for main platform shell
    dashboard/          → Lesson overview / landing
    lessons/            → Individual lesson pages
components/
  ui/                   → Reusable UI primitives (Button, Card, Shell, Header, Footer)
  lesson/               → Lesson navigation (LessonNav, StepHeader)
  game/                 → Game-specific components (Coin, StageColumn, GameBoard, GameControls)
  charts/               → Chart components (Throughput, CycleTime, ItemBreakdown, LeadTime)
lib/
  engine/               → Pure simulation functions (no side effects, no React)
  stats/                → Statistics computation (pure functions)
  constants/            → Shared constants (stages, colors, work states)
content/
  lesson-1-penny-game/  → Lesson config, quiz questions, intro content
hooks/                  → Custom React hooks (game state management)
types/                  → TypeScript interfaces and types
```

## Game Roadmap

1. **Penny Game** (Lesson 1) — Batch size & flow. Simulates coins through 4 stages with variable batch sizes. Demonstrates how smaller batches improve lead time and throughput.
2. **WIP Limits Game** (Lesson 2) — Work-in-progress limits and work item age.
3. **Little's Law Explorer** (Lesson 3) — Interactive demonstration of Little's Law (Lead Time = WIP / Throughput).
4. **Pull vs Push** (Lesson 4) — Comparing push and pull systems.
5. **Flow Metrics Dashboard** (Lesson 5) — Building and reading Kanban flow metrics.

## Coding Conventions

- **Pure engine functions**: All simulation logic in `lib/engine/` must be pure functions (no React, no side effects). They take state in, return new state out.
- **Lesson-as-config**: Each lesson's metadata, quiz questions, and step definitions live in `content/` as structured config objects.
- **Custom hooks for state**: Game state management is encapsulated in custom hooks (`hooks/`), keeping page components thin.
- **Component composition**: UI is built from small, typed components. No monolithic components.
- **Tailwind for styling**: Use Tailwind utility classes. Avoid inline styles except where dynamic values are required.
- **Client components**: Game/interactive components use `"use client"` directive. Keep server components where possible.

## Key Architectural Decisions

- **App Router route groups**: `(platform)` groups lesson pages under a shared layout without affecting URL paths.
- **Separation of concerns**: Engine (pure logic) → Hook (state management) → Components (rendering) → Page (composition).
- **Snapshot-based comparison**: Each simulation run captures a snapshot of all items, enabling cross-run comparison in debrief charts.
- **Step-based lesson flow**: Each lesson follows Intro → Simulation → Debrief → Quiz, controlled by a step index.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (verifies TypeScript)
npm run lint      # ESLint
```
