import React from "react";
import { styled, Typography } from "@mui/material";
import { CheckCircle, ErrorOutlined } from "@mui/icons-material";

export interface StatusLineProps {
  /** check icon if true, warning icon otherwise */
  ok: boolean;
  children: React.ReactNode;
}

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
}));

/** status line with a check (ok) or warning icon */
const StatusLine = (props: StatusLineProps) => (
  <Root>
    {props.ok ? (
      <CheckCircle fontSize={"small"} color={"success"} />
    ) : (
      <ErrorOutlined fontSize={"small"} color={"warning"} />
    )}
    <Typography>{props.children}</Typography>
  </Root>
);

export default React.memo(StatusLine);
