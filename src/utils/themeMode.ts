/** light or dark look of the whole IM, chosen in the user menu */
export type ThemeMode = "light" | "dark";

// stored per browser on purpose, IM has no user preference field for it
const THEME_MODE_KEY = "im-theme-mode";

/** the stored look; light unless the user picked dark (the OS setting is ignored) */
export const loadThemeMode = (): ThemeMode => {
  try {
    return localStorage.getItem(THEME_MODE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const storeThemeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // storage blocked: the setting lasts until reload
  }
};
