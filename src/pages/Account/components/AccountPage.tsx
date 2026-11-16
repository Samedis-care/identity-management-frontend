import React from "react";
import { Box, Paper, styled } from "@mui/material";

export interface AccountPageProps {
  title: string;
  children: React.ReactNode;
}

/*
 * Page frame like BasicPageLayout in samedis-care-frontend:
 * - desktop/tablet: title in white on the gradient, above the white content
 *   panel; h1 (2rem) from lg, 1.5rem between sm and lg
 * - mobile (xs): title centered in a white bar across the full width, content
 *   panel with small margins
 * Page spacing 8/16/32px (mobile/tablet/desktop) like usePageContainerSpacing.
 */

/** page heading on the gradient, also used by the admin pages */
export const PageTitle = styled("h1")(({ theme }) => ({
  ...theme.typography.h1,
  color: "#FFFFFF",
  // gap to the box = page spacing, like the grid spacing in samedis.care
  margin: theme.spacing(0, 0, 4),
  // never squeezed when the page is a flex column (admin frame)
  flexShrink: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  [theme.breakpoints.between("sm", "lg")]: {
    fontSize: "1.5rem",
    marginBottom: theme.spacing(2),
  },
  [theme.breakpoints.only("xs")]: {
    ...theme.typography.subtitle1,
    color: theme.palette.text.primary,
    textAlign: "center",
    margin: 0,
    padding: theme.spacing(1, 2),
    minHeight: 36,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const AccountPage = (props: AccountPageProps) => (
  <Box sx={{ width: "100%", maxWidth: 1264, mx: "auto", p: { sm: 2, lg: 4 } }}>
    <PageTitle>{props.title}</PageTitle>
    <Box sx={{ p: { xs: 1, sm: 0 } }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, width: "100%" }}
      >
        {props.children}
      </Paper>
    </Box>
  </Box>
);

export default React.memo(AccountPage);
