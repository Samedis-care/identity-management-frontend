/*
 * Settings kept per browser in localStorage, for preferences IM has no user
 * field for. Storage can be blocked (private mode, policies): reading then
 * gives the default and a change lasts until reload.
 */

/** the stored value if it is one of `values`, else the first of them */
export const loadBrowserSetting = <T extends string>(
  key: string,
  values: readonly [T, ...T[]],
): T => {
  try {
    const stored = localStorage.getItem(key);
    return values.find((value) => value === stored) ?? values[0];
  } catch {
    return values[0];
  }
};

export const storeBrowserSetting = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked: the setting lasts until reload
  }
};
