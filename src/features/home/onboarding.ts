/**
 * First-run guide state.
 *
 * The guide is a dismissible panel, not a modal: a visitor can ignore it and
 * still use the app. Dismissal is remembered in this browser only, and the
 * palette can bring the guide back without a reload, which is why there is a
 * small event channel instead of another store field (the store belongs to PC1).
 */

export const ONBOARDING_KEY = "ignis.start-here-dismissed.v1";
const ONBOARDING_EVENT = "ignis:show-onboarding";

export function isOnboardingDismissed(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    // Private mode or a blocked storage API: show the guide, never crash.
    return false;
  }
}

export function dismissOnboarding(): void {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {
    // Ignore: the guide is already hidden for this session.
  }
}

export function showOnboarding(): void {
  try {
    window.localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Ignore: the event below still opens the guide for this session.
  }
  window.dispatchEvent(new Event(ONBOARDING_EVENT));
}

export function onShowOnboarding(handler: () => void): () => void {
  window.addEventListener(ONBOARDING_EVENT, handler);
  return () => window.removeEventListener(ONBOARDING_EVENT, handler);
}
