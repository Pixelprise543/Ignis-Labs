import type { SVGProps } from 'react'

/**
 * Ignis flame mark: a warm flat SVG icon, no gradients/glows/shadows.
 * Colors come from the Ember Professional palette:
 *  - flame body: --ig-flame-blue (deep ochre brand)
 *  - flame streak: --ig-on-accent (cream highlight)
 *  - ring / dot / crosshairs: --ig-frost (dark ink)
 *
 * Scales cleanly from favicon size up to header size.
 */
export function LogoMark({
  size = 24,
  className,
  ...props
}: { size?: number; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ignis"
      className={className}
      {...props}
    >
      {/* orbital ring */}
      <path
        d="M8 34C8 18 56 18 56 34C56 50 8 50 8 34"
        stroke="var(--ig-frost)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* flame body (deep ochre brand) */}
      <path
        d="M21 42Q15 36 15 28Q18 22 22 24Q25 22 28 28Q28 36 22 42Z"
        fill="var(--ig-flame-blue)"
      />
      {/* flame inner streak (cream highlight) */}
      <path
        d="M21 40Q18 34 18 30Q20 26 22 26Q24 26 22 30Q22 34 21 40Z"
        fill="var(--ig-on-accent)"
      />
      {/* planet dot */}
      <circle cx="18" cy="40" r="2.5" fill="var(--ig-frost)" />
      {/* compass crosshairs */}
      <path
        d="M4 34H12M52 34H60M34 4V12M34 52V60"
        stroke="var(--ig-frost)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Logo mark + wordmark. "Ignis" in brand ochre, "Labs" in dark ink.
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2",
        className,
      ].filter(Boolean).join(" ")}
    >
      <LogoMark size={size * 0.85} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-[var(--ig-flame-blue)]">
          Ignis
        </span>
        <span className="block text-xs leading-tight text-[var(--ig-frost)]">
          Labs
        </span>
      </span>
    </span>
  )
}
