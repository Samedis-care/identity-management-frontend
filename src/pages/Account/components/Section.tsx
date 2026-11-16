/* Building blocks of the account pages: grid cells with GroupBoxes, button rows, status lines */
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { CheckCircle, ErrorOutlined } from "@mui/icons-material";
import { InfoBox } from "components-care";
import { useTranslation } from "react-i18next";

/** grid cell holding one GroupBox; boxes in one row get the same height */
export const Cell = (props: { md?: number; children: React.ReactNode }) => (
  <Grid size={{ xs: 12, md: props.md ?? 6 }} sx={{ display: "flex" }}>
    {props.children}
  </Grid>
);

/** content of a GroupBox: column with consistent spacing */
export const BoxBody = (props: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      p: 1,
      width: "100%",
      height: "100%",
      minWidth: 0,
    }}
  >
    {props.children}
  </Box>
);

/**
 * buttons in a row, left aligned (samedis.care form style); pushed to the
 * bottom of the box, so boxes side by side show their buttons on one line
 */
export const Buttons = (props: { children: React.ReactNode }) => (
  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: "auto" }}>
    {props.children}
  </Box>
);

/** status line with a check (ok) or warning icon */
export const Status = (props: { ok: boolean; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
    {props.ok ? (
      <CheckCircle fontSize={"small"} color={"success"} />
    ) : (
      <ErrorOutlined fontSize={"small"} color={"warning"} />
    )}
    <Typography>{props.children}</Typography>
  </Box>
);

/** a box with a fixed height for a data grid, which needs one to scroll */
export const GridBox = (props: {
  height: number;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      height: props.height,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    }}
  >
    {props.children}
  </Box>
);

/** read-only text field props */
export const readOnly = { input: { readOnly: true } };

/** error message in an expanded red InfoBox */
export const ErrorInfo = (props: { message: string }) => {
  const { t } = useTranslation("account");
  return (
    <InfoBox
      status={"error"}
      heading={t("common.error")}
      message={props.message}
      expanded
    />
  );
};
