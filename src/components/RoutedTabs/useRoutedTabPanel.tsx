import { Route } from "components-care";
import React from "react";

const useRoutedTabPanel = (): ((
  name: string,
  children: React.ReactElement,
) => React.ReactElement) => {
  return (name: string, children: React.ReactElement) => (
    <Route key={name} path={`${name}/*`} element={children} />
  );
};

export default useRoutedTabPanel;
