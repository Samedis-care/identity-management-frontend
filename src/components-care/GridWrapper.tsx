import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { GridWrapperProps } from "components-care/dist/backend-components/CRUD";

const useStyles = makeStyles()({
  root: {
    height: "100%",
  },
});

const GridWrapper = (props: GridWrapperProps) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  return (
    <Box p={isXs ? 0 : 2} className={classes.root}>
      {props.children}
    </Box>
  );
};

export default GridWrapper;
