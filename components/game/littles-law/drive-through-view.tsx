"use client";

import { useRef, useEffect, useState } from "react";
import type { SimState, Car } from "@/types/littles-law";
import { CAR_COLORS } from "@/lib/constants/littles-law";

interface DriveThruProps {
  state: SimState;
}

/** Station X positions (percentage along lane) */
const POS: Record<string, number> = {
  "order-queue": 8,
  "ordering": 26,
  "wait-pay": 40,
  "paying": 52,
  "wait-collect": 62,
  "collecting": 72,
};

/** Real-time duration (ms) for the departure slide animation */
const DEPART_DURATION_MS = 1200;

/** Y offset for the two order window lanes (percentage from lane center) */
const LANE_OFFSET = 30;

interface DepartingCar {
  id: number;
  orderSize: Car["orderSize"];
  startTime: number;
}

function carX(station: string, index: number): number {
  const base = POS[station] ?? 50;
  if (station === "order-queue") return Math.max(2, base - index * 5);
  return base;
}

export function DriveThruView({ state }: DriveThruProps) {
  const activeCars = state.cars.filter((c) => c.station !== "departed" && c.station !== "balked");

  // Track departing cars in real wall-clock time (independent of sim speed)
  const prevDepartedRef = useRef(state.totalDepartures);
  const [departingCars, setDepartingCars] = useState<DepartingCar[]>([]);

  useEffect(() => {
    if (state.totalDepartures > prevDepartedRef.current) {
      const newlyDeparted = state.cars
        .filter((c) => c.station === "departed" && c.departureTick === state.tick - 1)
        .map((c) => ({ id: c.id, orderSize: c.orderSize, startTime: Date.now() }));

      if (newlyDeparted.length > 0) {
        setDepartingCars((prev) => [...prev, ...newlyDeparted]);
      }
    }
    prevDepartedRef.current = state.totalDepartures;
  }, [state.totalDepartures, state.cars, state.tick]);

  // Clean up finished animations
  useEffect(() => {
    if (departingCars.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setDepartingCars((prev) => prev.filter((c) => now - c.startTime < DEPART_DURATION_MS));
    }, 200);
    return () => clearInterval(timer);
  }, [departingCars.length]);

  const hasTwoWindows = state.settings.orderServers === 2;

  const stationCounts: Record<string, number> = {};
  for (const car of activeCars) {
    stationCounts[car.station] = (stationCounts[car.station] ?? 0) + 1;
  }

  return (
    <div
      className="relative rounded-2xl select-none"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        border: "1px solid var(--border-faint)",
        height: 380,
        overflow: "hidden",
      }}
    >
      {/* Building / Kitchen */}
      <div
        className="absolute rounded-xl"
        style={{
          top: 16, left: "6%", right: "6%", height: 150,
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        <div className="text-xs font-bold uppercase tracking-[3px] text-center pt-3" style={{ color: "rgba(139,92,246,0.5)" }}>
          Kitchen
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {state.kitchenSlots.map((slot, i) => {
            const cookingCar = slot.carId ? state.cars.find((c) => c.id === slot.carId) : null;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300"
                  style={{
                    background: slot.busy ? "rgba(245,158,11,0.15)" : "rgba(100,116,139,0.08)",
                    border: slot.busy ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(100,116,139,0.1)",
                  }}
                >
                  {slot.busy ? "\uD83D\uDC68\u200D\uD83C\uDF73" : "\uD83D\uDC68\u200D\uD83C\uDF73"}
                </div>
                <div className="text-[9px] font-mono font-bold" style={{ color: slot.busy ? "#fbbf24" : "var(--text-faint)" }}>
                  {slot.busy && cookingCar ? `#${cookingCar.id}` : "idle"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Road / Lane */}
      <div
        className="absolute left-0 right-0"
        style={{ top: 190, height: 110, background: "rgba(100,116,139,0.08)" }}
      >
        {/* Lane markings */}
        {hasTwoWindows ? (
          <>
            <div className="absolute top-1/2 h-[1px]" style={{ left: 0, width: "14%", background: "rgba(250,204,21,0.15)", borderTop: "1px dashed rgba(250,204,21,0.12)" }} />
            <div className="absolute h-[1px]" style={{ top: `calc(50% - ${LANE_OFFSET}%)`, left: "14%", width: "20%", background: "rgba(250,204,21,0.15)", borderTop: "1px dashed rgba(250,204,21,0.12)" }} />
            <div className="absolute h-[1px]" style={{ top: `calc(50% + ${LANE_OFFSET}%)`, left: "14%", width: "20%", background: "rgba(250,204,21,0.15)", borderTop: "1px dashed rgba(250,204,21,0.12)" }} />
            <div className="absolute top-1/2 h-[1px]" style={{ left: "34%", right: 0, background: "rgba(250,204,21,0.15)", borderTop: "1px dashed rgba(250,204,21,0.12)" }} />
          </>
        ) : (
          <div className="absolute top-1/2 left-0 right-0 h-[1px]" style={{ background: "rgba(250,204,21,0.2)", borderTop: "1px dashed rgba(250,204,21,0.15)" }} />
        )}

        {/* Station markers */}
        {[
          { label: "ORDER", icon: "\uD83D\uDCCB", x: 26 },
          { label: "PAY", icon: "\uD83D\uDCB3", x: 52 },
          { label: "COLLECT", icon: "\uD83C\uDF54", x: 72 },
        ].map((s) => (
          <div
            key={s.label}
            className="absolute top-0 flex flex-col items-center pt-1.5"
            style={{ left: `${s.x}%`, transform: "translateX(-50%)" }}
          >
            <div className="text-xl">{s.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {s.label}
              {s.label === "ORDER" && hasTwoWindows && <span className="text-amber-400"> x2</span>}
            </div>
          </div>
        ))}

        {/* Wait markers */}
        {[
          { label: "wait", x: 40 },
          { label: "wait", x: 62 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${s.x}%`, top: 6, transform: "translateX(-50%)" }}
          >
            <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              {s.label}
            </div>
          </div>
        ))}

        {/* Active cars */}
        {activeCars.map((car) => {
          const isBeingServed = car.station === "ordering" || car.station === "paying" || car.station === "collecting";
          const isWaiting = car.station === "wait-pay" || car.station === "wait-collect";

          let idx = 0;
          if (car.station === "order-queue") {
            const queueCars = activeCars
              .filter((c) => c.station === "order-queue")
              .sort((a, b) => a.arrivalTick - b.arrivalTick);
            idx = queueCars.indexOf(car);
          }

          const x = carX(car.station, idx);
          const opacity = isBeingServed ? 1 : isWaiting ? 0.6 : 0.7;

          let yOffset = 0;
          if (hasTwoWindows && car.station === "ordering" && car.orderWindow !== null) {
            yOffset = car.orderWindow === 0 ? -LANE_OFFSET : LANE_OFFSET;
          }

          return (
            <div
              key={car.id}
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                left: `${x}%`,
                top: `calc(50% + ${yOffset}%)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="relative rounded-lg flex items-center justify-center text-[11px] font-bold font-mono"
                style={{
                  width: 40,
                  height: 22,
                  background: CAR_COLORS[car.orderSize],
                  opacity,
                  boxShadow: isBeingServed ? `0 0 12px ${CAR_COLORS[car.orderSize]}50` : "none",
                  color: "#fff",
                }}
              >
                {car.id}
              </div>
            </div>
          );
        })}

        {/* Departing cars — animated in real wall-clock time */}
        {departingCars.map((dc) => {
          const elapsed = Date.now() - dc.startTime;
          const progress = Math.min(1, elapsed / DEPART_DURATION_MS);
          const eased = 1 - Math.pow(1 - progress, 2);
          const x = 72 + eased * 26;
          const opacity = 1 - progress;

          return (
            <div
              key={`dep-${dc.id}`}
              className="absolute"
              style={{
                left: `${x}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              <div
                className="relative rounded-lg flex items-center justify-center text-[11px] font-bold font-mono"
                style={{
                  width: 40,
                  height: 22,
                  background: CAR_COLORS[dc.orderSize],
                  opacity,
                  color: "#fff",
                }}
              >
                {dc.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow: entrance */}
      <div className="absolute text-sm font-bold" style={{ left: "1.5%", top: 238, color: "var(--text-muted)" }}>
        IN &rarr;
      </div>
      {/* Arrow: exit */}
      <div className="absolute text-sm font-bold" style={{ right: "1.5%", top: 238, color: "var(--text-muted)" }}>
        &rarr; OUT
      </div>

      {/* Queue lengths */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-5 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
        <span>Order Q: {stationCounts["order-queue"] ?? 0}</span>
        <span>Wait Pay: {stationCounts["wait-pay"] ?? 0}</span>
        <span>Wait Collect: {stationCounts["wait-collect"] ?? 0}</span>
      </div>
    </div>
  );
}
