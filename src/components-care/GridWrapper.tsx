import React from "react";
import { Box, styled, useMediaQuery, useTheme } from "@mui/material";
import { GridWrapperProps } from "components-care/dist/backend-components/CRUD";

const Root = styled(Box)({
  height: "100%",
});

/** class of the grid wrapper, lets form pages drop its padding */
export const ImGridWrapperClassName = "ImGridWrapper";

const GridWrapper = (props: GridWrapperProps) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  return (
    <Root className={ImGridWrapperClassName} sx={{ p: isXs ? 0 : 2 }}>
      {props.children}
    </Root>
  );
};

export default GridWrapper;
