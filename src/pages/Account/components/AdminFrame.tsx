import React, { useState } from "react";
import { Paper, styled } from "@mui/material";
import { AdminTitleContext } from "../../AdminUI/AdminTitle";
import { ImFormPageLayoutClassName } from "../../../components-care/ImFormPageLayout";
import { ImCrudFormClassName } from "../../../components-care/ImCrud";
import { PageTitle } from "./AccountPage";

export interface AdminFrameProps {
  /** heading, the menu title of the page; the page may replace it (useAdminTitle) */
  title: string;
  children: React.ReactNode;
}

const FRAME_BODY = "AdminFrame-body";
const FRAME_PAPER = "AdminFrame-paper";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(2) },
  [theme.breakpoints.up("lg")]: { padding: theme.spacing(4) },
  [`&:has(.${ImFormPageLayoutClassName})`]: {
    height: "auto",
    minHeight: "100%",
    // the chain down to the form must not shrink to the viewport, else
    // the form overflows the box instead of growing it
    [`& .${FRAME_BODY}, & .${FRAME_PAPER} > *, & .${ImCrudFormClassName}`]: {
      flexShrink: 0,
    },
  },
}));

const Body = styled("div")(({ theme }) => ({
  flexGrow: 1,
  minHeight: 0,
  display: "flex",
  [theme.breakpoints.only("xs")]: { padding: theme.spacing(1) },
}));

const FramePaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  "& > *": { flexGrow: 1, minHeight: 0 },
  [`&:has(.${ImFormPageLayoutClassName})`]: {
    overflow: "visible",
  },
  // one white box only: the papers the admin pages bring along
  // (form pages, grids) lose their shadow inside it
  "& .MuiPaper-root:not(.MuiPopover-paper):not(.MuiMenu-paper)": {
    boxShadow: "none",
    backgroundImage: "none",
  },
}));

/**
 * Frame of the admin pages like BasicPageLayout in samedis-care-frontend:
 * heading on the gradient, everything else (tabs, grids, form fields) in one
 * white box, page spacing 8/16/32px.
 * - grid pages: the box fills the height, the CRUD grids size themselves to it
 * - form pages: the box grows with the form and the page scrolls; the form's
 *   button bar sits at the bottom of the content area (ImFormPageLayout)
 */
const AdminFrame = (props: AdminFrameProps) => {
  // a page may replace the menu title, e.g. by the name of its record
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  return (
    <AdminTitleContext.Provider value={setTitleOverride}>
      <Root>
        <PageTitle>{titleOverride ?? props.title}</PageTitle>
        <Body className={FRAME_BODY}>
          <FramePaper className={FRAME_PAPER} elevation={0}>
            {props.children}
          </FramePaper>
        </Body>
      </Root>
    </AdminTitleContext.Provider>
  );
};

export default React.memo(AdminFrame);
