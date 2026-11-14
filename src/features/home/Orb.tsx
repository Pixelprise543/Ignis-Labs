import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useMemo, useState } from "react";

const CENTER_X = 110;
const CENTER_Y = 128;
const RADIUS = 54;
const SAMPLES = 96;

/**
 * Flat flame shape: a pale-gold circle at 0g that lengthens into an amber
 * teardrop as gravity rises. The radius is a smooth polar function, sampled
 * into a path so the outline interpolates without any gradient or glow.
 *
 * This is a schematic of the buoyancy regime, not measured flame geometry.
 */
function flamePath(gravityG: number): string {
  const t = Math.min(Math.max(gravityG, 0), 1);
  const points: string[] = [];

  for (let index = 0; index < SAMPLES; index += 1) {
    const theta = (index / SAMPLES) * Math.PI * 2; // 0 points up
    const sharp = Math.pow((1 + Math.cos(theta)) / 2, 2.4);
    const radius = RADIUS * (1 + 0.9 * t * sharp);
    const x = CENTER_X + radius * Math.sin(theta);
    const y = CENTER_Y - radius * Math.cos(theta);
    points.push(`${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `${points.join(" ")} Z`;
}

const GOLD = "#E3B76B";
const AMBER = "#F5B942";

export interface FlameOrbProps {
  gravityG: number;
  scenarioLabel: string;
}

export function FlameOrb({ gravityG, scenarioLabel }: FlameOrbProps) {
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const path = useMemo(() => flamePath(gravityG), [gravityG]);
  const t = Math.min(Math.max(gravityG, 0), 1);

  return (
    <div className="rounded-panel border border-ig-line bg-ig-hull p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ig-muted">Flame shape</p>
          <p className="mt-1 text-sm font-semibold text-ig-frost">{scenarioLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="inline-flex h-8 items-center gap-1.5 rounded-control border border-ig-line px-2 text-xs text-ig-muted hover:bg-ig-raised hover:text-ig-frost"
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {paused ? "Play motion" : "Pause motion"}
        </button>
      </div>

      <div className="mt-2 flex justify-center">
        <div
          className="ig-orb-pulse"
          data-paused={paused ? "true" : "false"}
          style={{ width: "min(100%, 260px)" }}
        >
          <svg
            viewBox="0 0 220 240"
            role="img"
            aria-label={`Schematic flame shape at ${gravityG.toFixed(2)}g. A round flame sphere at microgravity, an elongated teardrop as gravity increases.`}
            className="h-auto w-full"
          >
            <title>Flame shape at {scenarioLabel}</title>
            <motion.circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS + 10}
              fill="none"
              stroke="var(--ig-line)"
              strokeWidth={1}
              initial={false}
              animate={{ opacity: t < 0.12 ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5 }}
            />
            <motion.path
              initial={false}
              animate={{ d: path, fill: t < 0.5 ? GOLD : AMBER }}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeInOut" }}
              stroke="var(--ig-line)"
              strokeWidth={1}
            />
          </svg>
        </div>
      </div>

      <p className="mt-2 text-center text-xs leading-5 text-ig-muted">
        A round flame sphere without buoyancy, an amber teardrop with it. Schematic only, not measured
        flame geometry.
      </p>
    </div>
  );
}
