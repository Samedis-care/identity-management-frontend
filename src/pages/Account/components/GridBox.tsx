import React from "react";
import { styled } from "@mui/material";

export interface GridBoxProps {
  /** height in px; a data grid needs a fixed height to scroll */
  height: number;
  children: React.ReactNode;
}

const Root = styled("div")({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

/** a box with a fixed height for a data grid */
const GridBox = (props: GridBoxProps) => (
  <Root style={{ height: props.height }}>{props.children}</Root>
);

export default React.memo(GridBox);
