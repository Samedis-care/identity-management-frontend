import React from "react";
import { SentryRoutes } from "components-care";

export interface RoutedTabPanelWrapperProps {
  children: React.ReactNode;
}

const RoutedTabPanelWrapper = (props: RoutedTabPanelWrapperProps) => {
  return <SentryRoutes>{props.children}</SentryRoutes>;
};

export default React.memo(RoutedTabPanelWrapper);
