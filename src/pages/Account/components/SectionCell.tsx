import React from "react";
import { Grid, styled } from "@mui/material";

export interface SectionCellProps {
  /** columns from md up, 12 = full width */
  md?: number;
  children: React.ReactNode;
}

const Root = styled(Grid)({
  display: "flex",
});

/** grid cell holding one GroupBox; boxes in one row get the same height */
const SectionCell = (props: SectionCellProps) => (
  <Root size={{ xs: 12, md: props.md ?? 6 }}>{props.children}</Root>
);

export default React.memo(SectionCell);
