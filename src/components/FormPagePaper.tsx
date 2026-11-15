import React from "react";
import { Box, styled } from "@mui/material";
import { ImCrudRootClassName } from "../components-care/ImCrud";
import { ImGridWrapperClassName } from "../components-care/GridWrapper";

export interface FormPagePaperProps {
  children: React.ReactNode;
}

const FlexGrowBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  // like the tab content in samedis.care: tabs flush at the top of the box,
  // the content below with 16px padding
  padding: theme.spacing(2),
  // grids in a tab of a form page: the page grows with its content, so the
  // grid gets a height of its own instead of filling the box
  [`& .${ImCrudRootClassName}`]: {
    height: "max(420px, calc(100vh - 380px))",
    flexGrow: 0,
  },
  // the tab content already has the padding
  [`& .${ImGridWrapperClassName}`]: {
    padding: 0,
  },
}));

/**
 * Content of an admin form page. The page frame (AdminFrame in the account
 * layout) already provides the one white box, so this adds no paper of its own,
 * only the content padding.
 */
const FormPagePaper = (props: FormPagePaperProps) => (
  <FlexGrowBox>{props.children}</FlexGrowBox>
);

export default React.memo(FormPagePaper);
