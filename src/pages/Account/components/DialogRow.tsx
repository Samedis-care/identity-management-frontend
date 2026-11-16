import React from "react";
import { Grid } from "@mui/material";

export interface DialogRowProps {
  children: React.ReactNode;
}

/** full-width row of the AccountDialog grid */
const DialogRow = (props: DialogRowProps) => (
  <Grid size={12}>{props.children}</Grid>
);

export default React.memo(DialogRow);
