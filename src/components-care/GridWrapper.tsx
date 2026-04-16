import React from "react";
import { Box, styled, useMediaQuery, useTheme } from "@mui/material";
import { GridWrapperProps } from "components-care/dist/backend-components/CRUD";

const Root = styled(Box)({
  height: "100%",
});

const GridWrapper = (props: GridWrapperProps) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  return <Root p={isXs ? 0 : 2}>{props.children}</Root>;
};

export default GridWrapper;
