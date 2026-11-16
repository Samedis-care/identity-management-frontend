import { loadBrowserSetting, storeBrowserSetting } from "./browserSetting";

/** light or dark look of the whole IM, chosen in the user menu */
export type ThemeMode = "light" | "dark";

// light first: the default, the OS setting is ignored
const THEME_MODES = ["light", "dark"] as const;
const THEME_MODE_KEY = "im-theme-mode";

export const loadThemeMode = (): ThemeMode =>
  loadBrowserSetting(THEME_MODE_KEY, THEME_MODES);

export const storeThemeMode = (mode: ThemeMode) =>
  storeBrowserSetting(THEME_MODE_KEY, mode);
