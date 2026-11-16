import React from "react";
import { styled } from "@mui/material";

export interface SectionBodyProps {
  children: React.ReactNode;
}

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  width: "100%",
  height: "100%",
  minWidth: 0,
}));

/** content of a GroupBox: column with consistent spacing */
const SectionBody = (props: SectionBodyProps) => <Root>{props.children}</Root>;

export default React.memo(SectionBody);
