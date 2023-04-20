import History from "history";

export const preserveUrlParams = (
  newPathname: string,
  currentLocation: History.Location,
  addParams?: Record<string, string>
): History.Location => {
  const params = new URLSearchParams(currentLocation.search);
  if (addParams)
    Object.entries(addParams).forEach(([k, v]) => params.set(k, v));
  return {
    pathname: newPathname,
    state: null,
    search: params.toString(),
    hash: currentLocation.hash,
    key: Math.random().toString(),
  };
};
