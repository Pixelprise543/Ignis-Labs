import { createElement } from "react";
import type { ComponentType } from "react";
import { EmptyState } from "@/design-system";

export type FeatureLoader = () => Promise<{ default: ComponentType }>;

type FeatureModule = Record<string, unknown>;

/**
 * Every feature page is discovered at build time. A folder that PC2 or PC3
 * has not written yet resolves to an EmptyState, never a broken build.
 * Assistant and palette are shell chrome, imported directly by AppShell,
 * so they are excluded here to keep them out of the lazy route graph.
 */
const featureModules = import.meta.glob([
  "/src/features/*/index.tsx",
  "!/src/features/assistant/**",
  "!/src/features/palette/**",
]);

function MissingFeature({ folder, exportName }: { folder: string; exportName: string }) {
  return createElement(EmptyState, {
    title: "This view is still being built",
    message: `The ${folder} view (${exportName}) has not landed on this branch yet. Other areas of Ignis keep working while it is under construction.`,
  });
}

export function getFeatureLoader(folder: string, exportName: string): FeatureLoader {
  const key = `/src/features/${folder}/index.tsx`;
  const load = featureModules[key];

  if (!load) {
    return async () => ({ default: () => createElement(MissingFeature, { folder, exportName }) });
  }

  return async () => {
    const module = await load();
    const candidate = (module as FeatureModule)[exportName];

    if (typeof candidate !== "function") {
      return { default: () => createElement(MissingFeature, { folder, exportName }) };
    }

    return { default: candidate as ComponentType };
  };
}
