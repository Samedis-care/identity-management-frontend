import SentryRoute from "components-care/dist/standalone/SentryRoute";
import React from "react";

const useRoutedTabPanel = (): ((
  name: string,
  children: React.ReactNode
) => React.ReactElement) => {
  return (name: string, children: React.ReactNode) => (
    <SentryRoute key={name} path={`${name}/*`} element={children} />
  );
};

export default useRoutedTabPanel;
