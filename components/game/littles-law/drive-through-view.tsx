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

/** Top-down car shape */
function CarShape({ id, orderSize, glow, opacity }: { id: number; orderSize: Car["orderSize"]; glow: boolean; opacity: number }) {
  const color = CAR_COLORS[orderSize];
  return (
    <div className="relative" style={{ width: 38, height: 24, opacity }}>
      {/* Car body */}
      <div
        className="absolute inset-0 rounded-[6px]"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          boxShadow: glow
            ? `0 0 12px ${color}60, 0 2px 6px rgba(0,0,0,0.3)`
            : "0 2px 4px rgba(0,0,0,0.25)",
        }}
      />
      {/* Windshield (front) */}
      <div
        className="absolute rounded-[3px]"
        style={{
          top: 3, right: 2, width: 10, height: 18,
          background: "rgba(180,220,255,0.35)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      />
      {/* Rear window */}
      <div
        className="absolute rounded-[2px]"
        style={{
          top: 5, left: 3, width: 6, height: 14,
          background: "rgba(180,220,255,0.2)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      {/* ID label */}
      <div
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono z-10"
        style={{ color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
      >
        {id}
      </div>
    </div>
  );
}

export function DriveThruView({ state }: DriveThruProps) {
  const activeCars = state.cars.filter((c) => c.station !== "departed");

  // Track departing cars in real wall-clock time (independent of sim speed)
  const prevDepartedRef = useRef(state.totalDepartures);
  const seenDepartedIds = useRef(new Set<number>());
  const [departingCars, setDepartingCars] = useState<DepartingCar[]>([]);

  useEffect(() => {
    // Reset tracking on sim reset
    if (state.totalDepartures === 0) {
      seenDepartedIds.current.clear();
      prevDepartedRef.current = 0;
      setDepartingCars([]);
      return;
    }
    if (state.totalDepartures > prevDepartedRef.current) {
      // Find all departed cars we haven't animated yet
      const newlyDeparted = state.cars
        .filter((c) => c.station === "departed" && !seenDepartedIds.current.has(c.id))
        .map((c) => {
          seenDepartedIds.current.add(c.id);
          return { id: c.id, orderSize: c.orderSize, startTime: Date.now() };
        });

      if (newlyDeparted.length > 0) {
        setDepartingCars((prev) => [...prev, ...newlyDeparted]);
      }
    }
    prevDepartedRef.current = state.totalDepartures;
  }, [state.totalDepartures, state.cars]);

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
      className="relative rounded-2xl select-none overflow-hidden"
      style={{ height: 400 }}
    >
      {/* Sky / background gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #87CEEB 0%, #B0E0E6 30%, #90b090 40%, #6b8e6b 50%, #555 50%, #4a4a4a 100%)",
      }} />

      {/* Grass patches */}
      <div className="absolute" style={{ top: 0, left: 0, right: 0, height: "48%", overflow: "hidden" }}>
        {/* Trees (simple circles) */}
        {[
          { x: "3%", y: 60, s: 28 },
          { x: "8%", y: 45, s: 22 },
          { x: "92%", y: 55, s: 26 },
          { x: "88%", y: 40, s: 20 },
          { x: "50%", y: 30, s: 18 },
        ].map((t, i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: t.x, top: t.y, width: t.s, height: t.s,
            background: `radial-gradient(circle at 40% 35%, #5a9e5a, #3d7a3d)`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transform: "translateX(-50%)",
          }} />
        ))}
      </div>

      {/* ═══ Restaurant Building ═══ */}
      <div className="absolute" style={{ top: 28, left: "10%", right: "10%", height: 155 }}>
        {/* Building shadow */}
        <div className="absolute rounded-xl" style={{
          inset: "4px -4px -4px 4px",
          background: "rgba(0,0,0,0.15)",
          filter: "blur(6px)",
        }} />
        {/* Main building */}
        <div className="absolute inset-0 rounded-xl overflow-hidden" style={{
          background: "linear-gradient(180deg, #c0392b 0%, #a93226 60%, #922b21 100%)",
          border: "2px solid #7b241c",
        }}>
          {/* Roof stripe */}
          <div className="absolute top-0 left-0 right-0 h-[18px]" style={{
            background: "linear-gradient(180deg, #e74c3c, #c0392b)",
            borderBottom: "2px solid #a93226",
          }} />

          {/* Restaurant name */}
          <div className="text-center pt-[22px]">
            <span className="text-[13px] font-extrabold tracking-[4px] uppercase" style={{
              color: "#ffd700",
              textShadow: "0 1px 3px rgba(0,0,0,0.4)",
              letterSpacing: "4px",
            }}>
              Burger Barn
            </span>
          </div>

          {/* Kitchen area */}
          <div className="mx-3 mt-2 rounded-lg px-2 pt-1.5 pb-2" style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div className="text-[8px] font-bold uppercase tracking-[2px] text-center mb-1.5" style={{
              color: "rgba(255,215,0,0.7)",
            }}>
              Kitchen
            </div>
            <div className="flex justify-center gap-3">
              {state.kitchenSlots.map((slot, i) => {
                const cookingCar = slot.carId ? state.cars.find((c) => c.id === slot.carId) : null;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all duration-300"
                      style={{
                        background: slot.busy
                          ? "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.15))"
                          : "rgba(255,255,255,0.05)",
                        border: slot.busy
                          ? "1.5px solid rgba(245,158,11,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: slot.busy ? "0 0 10px rgba(245,158,11,0.2)" : "none",
                      }}
                    >
                      {slot.busy ? "\uD83D\uDD25" : "\uD83D\uDC68\u200D\uD83C\uDF73"}
                    </div>
                    <div className="text-[8px] font-mono font-bold" style={{
                      color: slot.busy ? "#fbbf24" : "rgba(255,255,255,0.3)",
                    }}>
                      {slot.busy && cookingCar ? `#${cookingCar.id}` : "idle"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Service windows on the building wall (bottom edge) */}
        {[
          { label: "ORDER", x: "20%", icon: "\uD83D\uDCE2", active: (stationCounts["ordering"] ?? 0) > 0 },
          { label: "PAY", x: "53%", icon: "\uD83D\uDCB3", active: (stationCounts["paying"] ?? 0) > 0 },
          { label: "COLLECT", x: "80%", icon: "\uD83C\uDF54", active: (stationCounts["collecting"] ?? 0) > 0 },
        ].map((w) => (
          <div key={w.label} className="absolute flex flex-col items-center" style={{
            left: w.x, bottom: -14, transform: "translateX(-50%)",
          }}>
            <div className="rounded-t-md flex items-center justify-center" style={{
              width: 36, height: 20,
              background: w.active
                ? "linear-gradient(180deg, #27ae60, #219a52)"
                : "linear-gradient(180deg, #5a5a5a, #4a4a4a)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderBottom: "none",
              boxShadow: w.active ? "0 0 8px rgba(39,174,96,0.3)" : "none",
            }}>
              <span className="text-sm">{w.icon}</span>
            </div>
            <div className="text-[7px] font-bold uppercase tracking-wider mt-0.5" style={{
              color: w.active ? "#27ae60" : "rgba(255,255,255,0.4)",
            }}>
              {w.label}
              {w.label === "ORDER" && hasTwoWindows && <span style={{ color: "#f59e0b" }}> x2</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Road / Drive Lane ═══ */}
      <div className="absolute left-0 right-0" style={{ top: 200, height: 120 }}>
        {/* Asphalt */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #3a3a3a 0%, #444 50%, #3a3a3a 100%)",
        }} />

        {/* Road edge markings */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.15)" }} />

        {/* Center lane markings */}
        {hasTwoWindows ? (
          <>
            <div className="absolute top-1/2 h-[1px]" style={{ left: 0, width: "14%", background: "transparent", borderTop: "2px dashed rgba(250,204,21,0.4)" }} />
            <div className="absolute h-[1px]" style={{ top: `calc(50% - ${LANE_OFFSET}%)`, left: "14%", width: "20%", borderTop: "2px dashed rgba(250,204,21,0.4)" }} />
            <div className="absolute h-[1px]" style={{ top: `calc(50% + ${LANE_OFFSET}%)`, left: "14%", width: "20%", borderTop: "2px dashed rgba(250,204,21,0.4)" }} />
            <div className="absolute top-1/2 h-[1px]" style={{ left: "34%", right: 0, borderTop: "2px dashed rgba(250,204,21,0.4)" }} />
          </>
        ) : (
          <div className="absolute top-1/2 left-0 right-0 h-[1px]" style={{ borderTop: "2px dashed rgba(250,204,21,0.35)" }} />
        )}

        {/* Station position markers on road */}
        {[
          { label: "ORDER", x: 26 },
          { label: "PAY", x: 52 },
          { label: "COLLECT", x: 72 },
        ].map((s) => (
          <div
            key={s.label}
            className="absolute bottom-1 flex flex-col items-center"
            style={{ left: `${s.x}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-[2px] h-3 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
          </div>
        ))}

        {/* Wait zone indicators */}
        {[
          { x: 40, count: stationCounts["wait-pay"] ?? 0 },
          { x: 62, count: stationCounts["wait-collect"] ?? 0 },
        ].map((wz, i) => wz.count > 0 ? (
          <div key={i} className="absolute" style={{
            left: `${wz.x}%`, top: "15%", transform: "translateX(-50%)",
          }}>
            <div className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{
              background: "rgba(245,158,11,0.2)",
              color: "#fbbf24",
              border: "1px solid rgba(245,158,11,0.3)",
            }}>
              wait
            </div>
          </div>
        ) : null)}

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
          const opacity = isBeingServed ? 1 : isWaiting ? 0.7 : 0.8;

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
              <CarShape id={car.id} orderSize={car.orderSize} glow={isBeingServed} opacity={opacity} />
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
              <CarShape id={dc.id} orderSize={dc.orderSize} glow={false} opacity={opacity} />
            </div>
          );
        })}
      </div>

      {/* ═══ Entrance / Exit signs ═══ */}
      <div className="absolute flex items-center gap-1" style={{ left: "1%", top: 252 }}>
        <div className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{
          background: "rgba(39,174,96,0.2)",
          color: "#27ae60",
          border: "1px solid rgba(39,174,96,0.3)",
        }}>
          IN &rarr;
        </div>
      </div>
      <div className="absolute flex items-center gap-1" style={{ right: "1%", top: 252 }}>
        <div className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{
          background: "rgba(39,174,96,0.2)",
          color: "#27ae60",
          border: "1px solid rgba(39,174,96,0.3)",
        }}>
          &rarr; OUT
        </div>
      </div>

      {/* ═══ Bottom info strip ═══ */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.7))",
        backdropFilter: "blur(4px)",
      }}>
        <div className="flex gap-4 text-[10px] font-mono font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
          <span>Queue: <span style={{ color: "#3b82f6" }}>{stationCounts["order-queue"] ?? 0}</span></span>
          <span>Wait Pay: <span style={{ color: "#f59e0b" }}>{stationCounts["wait-pay"] ?? 0}</span></span>
          <span>Wait Collect: <span style={{ color: "#22c55e" }}>{stationCounts["wait-collect"] ?? 0}</span></span>
        </div>
        <div className="flex gap-3">
          {[
            { size: "S", color: CAR_COLORS.small },
            { size: "M", color: CAR_COLORS.medium },
            { size: "L", color: CAR_COLORS.large },
          ].map((c) => (
            <div key={c.size} className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-[2px]" style={{ background: c.color }} />
              <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{c.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
