import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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

/**
 * Fill tokens. These were local hex literals that happened to match the theme
 * exactly; reading them from CSS keeps the orb in step with any future theme
 * change instead of silently drifting away from it.
 */
const GOLD = "var(--ig-flame-blue)";
const AMBER = "var(--ig-amber)";

export interface FlameOrbProps {
  gravityG: number;
  scenarioLabel: string;
}

export function FlameOrb({ gravityG, scenarioLabel }: FlameOrbProps) {
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const path = useMemo(() => flamePath(gravityG), [gravityG]);
  const t = Math.min(Math.max(gravityG, 0), 1);

  // Manual turn: accumulated across drag gestures so the model stays where
  // you leave it. rotateX from vertical drag, rotateY from horizontal drag.
  const [turn, setTurn] = useState({ x: 0, y: 0 });
  const base = useRef({ x: 0, y: 0 });

  const startDrag = () => {
    base.current = { ...turn };
  };

  function turnBy(dx: number, dy: number) {
    setTurn((current) => ({
      x: Math.min(Math.max(current.x + dy * 0.5, -90), 90),
      y: current.y + dx * 0.5,
    }));
  }

  return (
    <div className="ig-glass rounded-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ig-muted">Flame shape</p>
          <p className="mt-1 text-sm font-semibold text-ig-frost">{scenarioLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="inline-flex h-8 items-center gap-1.5 rounded-control border border-ig-glass-control-rim px-2 text-xs text-ig-muted hover:bg-ig-glass-hover hover:text-ig-frost"
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {paused ? "Play motion" : "Pause motion"}
        </button>
      </div>

      <div className="mt-2 flex justify-center">
        {/* Outer layer handles the drag gesture; inner layer spins in place so
            the drag transform and the rotation transform never fight. */}
        <motion.div
          drag={true}
          dragConstraints={{ left: -90, right: 90, top: -90, bottom: 90 }}
          dragElastic={0.15}
          onDragStart={startDrag}
          onDrag={(_, info) => {
            setTurn({
              x: Math.min(Math.max(base.current.x + info.point.y * 0.5, -90), 90),
              y: base.current.y + info.point.x * 0.5,
            });
          }}
          className="relative inline-block cursor-grab active:cursor-grabbing select-none"
        >
          <div
            style={{
              transform: `rotateX(${turn.x}deg) rotateY(${turn.y}deg)`,
              transformOrigin: "center center",
              display: "inline-block",
            }}
            onKeyDown={(event) => {
              switch (event.key) {
                case "ArrowLeft":
                  event.preventDefault();
                  turnBy(-12, 0);
                  break;
                case "ArrowRight":
                  event.preventDefault();
                  turnBy(12, 0);
                  break;
                case "ArrowUp":
                  event.preventDefault();
                  turnBy(0, -12);
                  break;
                case "ArrowDown":
                  event.preventDefault();
                  turnBy(0, 12);
                  break;
                default:
                  break;
              }
            }}
            tabIndex={0}
            role="region"
            aria-label={`Flame model for ${scenarioLabel}. Drag or use arrow keys to turn.`}
          >
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
        </motion.div>
      </div>

      <p className="mt-2 text-center text-xs leading-5 text-ig-muted">
        A round flame sphere without buoyancy, an amber teardrop with it. Drag to
        turn, arrow keys to rotate. Schematic only, not measured flame geometry.
      </p>
    </div>
  );
}
