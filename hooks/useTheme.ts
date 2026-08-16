"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export const THEME_KEY = "jarvis-ui-sandbox-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("theme");
    const next =
      fromUrl === "dark" || fromUrl === "light" ? fromUrl : readStoredTheme();
    applyTheme(next);
    setThemeState(next);
    if (fromUrl === "dark" || fromUrl === "light") {
      window.localStorage.setItem(THEME_KEY, next);
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
