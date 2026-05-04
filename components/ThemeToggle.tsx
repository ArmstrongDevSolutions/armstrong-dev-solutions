"use client";

/**
 * Tim Silva–style toggle (track + ::before / ::after only). CSS: ./tim-theme-toggle.css
 */

import "./tim-theme-toggle.css";

import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";

const DARKMODE_KEY = "darkmode";
const LEGACY_THEME_KEY = "theme";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("theme-change", onStoreChange);
  return () => window.removeEventListener("theme-change", onStoreChange);
}

function getSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
  return false;
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  window.dispatchEvent(new Event("theme-change"));
}

function stayDark() {
  applyDark(true);
  try {
    localStorage.setItem(DARKMODE_KEY, "true");
  } catch {
    /* ignore */
  }
}

function stayLight() {
  applyDark(false);
  try {
    localStorage.setItem(DARKMODE_KEY, "false");
  } catch {
    /* ignore */
  }
}

function migrateLegacyTheme() {
  try {
    if (localStorage.getItem(DARKMODE_KEY) != null) return;
    const legacy = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacy === "dark") localStorage.setItem(DARKMODE_KEY, "true");
    else if (legacy === "light") localStorage.setItem(DARKMODE_KEY, "false");
  } catch {
    /* ignore */
  }
}

function tempDisableAnim(el: HTMLElement | null) {
  if (!el) return;
  el.classList.add("disableEasingTemporarily");
  setTimeout(() => el.classList.remove("disableEasingTemporarily"), 20);
}

export default function ThemeToggle() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    migrateLegacyTheme();
    try {
      const dm = localStorage.getItem(DARKMODE_KEY);
      if (dm === "true") {
        applyDark(true);
      } else if (dm === "false") {
        applyDark(false);
      } else {
        applyDark(document.documentElement.classList.contains("dark"));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onDark = (e: MediaQueryListEvent) => {
      if (e.matches) stayDark();
    };
    const onLight = (e: MediaQueryListEvent) => {
      if (e.matches) stayLight();
    };
    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    const mqLight = window.matchMedia("(prefers-color-scheme: light)");
    mqDark.addEventListener("change", onDark);
    mqLight.addEventListener("change", onLight);
    return () => {
      mqDark.removeEventListener("change", onDark);
      mqLight.removeEventListener("change", onLight);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      tempDisableAnim(toggleRef.current);
      setTimeout(() => tempDisableAnim(toggleRef.current), 0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onToggleClick = useCallback(() => {
    if (document.documentElement.classList.contains("dark")) {
      stayLight();
    } else {
      stayDark();
    }
  }, []);

  return (
    <div className="tim-theme-toggle noselect">
      <button
        ref={toggleRef}
        type="button"
        className="toggle-switch"
        role="switch"
        aria-checked={isDark}
        title={isDark ? "Go light" : "Go dark"}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={onToggleClick}
      />
    </div>
  );
}
