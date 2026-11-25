import React from "react";
import { Paper, styled } from "@mui/material";
import { PageTitle as CcPageTitle } from "components-care";

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

/**
 * page heading on the gradient, also used by the admin pages. components-care's
 * PageTitle: it names the document, and a navigation moves the focus to it and
 * announces the page.
 */
export const PageTitle = styled(CcPageTitle)(({ theme }) => ({
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

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: 1264,
  margin: "0 auto",
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(2) },
  [theme.breakpoints.up("lg")]: { padding: theme.spacing(4) },
}));

const Body = styled("div")(({ theme }) => ({
  [theme.breakpoints.only("xs")]: { padding: theme.spacing(1) },
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  [theme.breakpoints.up("md")]: { padding: theme.spacing(3) },
}));

const AccountPage = (props: AccountPageProps) => (
  <Root>
    <PageTitle>{props.title}</PageTitle>
    <Body>
      <ContentPaper elevation={0}>{props.children}</ContentPaper>
    </Body>
  </Root>
);

export default React.memo(AccountPage);
