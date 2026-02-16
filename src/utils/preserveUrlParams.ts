import History from "history";

export const preserveUrlParams = (
  newPathname: string,
  currentLocation: History.Location,
  addParams?: Record<string, string>,
  removeParams?: string[],
): History.Location => {
  const params = new URLSearchParams(currentLocation.search);
  if (addParams)
    Object.entries(addParams).forEach(([k, v]) => params.set(k, v));
  if (removeParams) removeParams.forEach((key) => params.delete(key));
  return {
    pathname: newPathname,
    state: null,
    search: params.toString(),
    hash: currentLocation.hash,
    key: Math.random().toString(),
  };
};
