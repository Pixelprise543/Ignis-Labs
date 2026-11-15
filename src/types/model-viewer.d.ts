/**
 * Type declaration for the <model-viewer> web component.
 *
 * model-viewer is loaded via a <script> tag in index.html (Google CDN) — no npm
 * package is installed, so TypeScript doesn't know it as a JSX intrinsic element.
 * Declare it here so tsc -b (Vercel build) doesn't fail on the unknown tag.
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean;
        "camera-controls"?: boolean;
        "camera-orbit"?: string;
        width?: string | number;
        height?: string | number;
      };
    }
  }
}

export {};
