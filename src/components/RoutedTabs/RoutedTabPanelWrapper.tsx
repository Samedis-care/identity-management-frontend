import React from "react";
import { Routes } from "components-care";
import { RoutesProps } from "components-care/dist/standalone/Routes/Routes";

export interface RoutedTabPanelWrapperProps {
  children: RoutesProps["children"];
}

const RoutedTabPanelWrapper = (props: RoutedTabPanelWrapperProps) => {
  return <Routes>{props.children}</Routes>;
};

export default React.memo(RoutedTabPanelWrapper);
