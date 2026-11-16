import React from "react";
import { styled } from "@mui/material";

export interface SectionButtonsProps {
  children: React.ReactNode;
}

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  marginTop: "auto",
}));

/**
 * buttons in a row, left aligned (samedis.care form style); pushed to the
 * bottom of the box, so boxes side by side show their buttons on one line
 */
const SectionButtons = (props: SectionButtonsProps) => (
  <Root>{props.children}</Root>
);

export default React.memo(SectionButtons);
