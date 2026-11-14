import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./Button";

const THEME_KEY = "ignis-theme";

function getStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem(THEME_KEY) as "light" | "dark" | null) ?? null;
}

function setTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(THEME_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = getStoredTheme();
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (system ? "dark" : "light");
    setTheme(initial);
    setThemeState(initial);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    setThemeState(next);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Dark mode" : "Light mode"}
    >
      {theme === "light" ? (
        <Moon size={14} aria-hidden="true" />
      ) : (
        <Sun size={14} aria-hidden="true" />
      )}
    </Button>
  );
}
