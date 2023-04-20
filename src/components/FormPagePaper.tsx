import React from "react";
import { Box, Paper } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

export interface FormPagePaperProps {
  noOuterPadding?: boolean;
  children: React.ReactNode;
}

const useStyles = makeStyles({
  flexGrowContainer: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
  },
});

const FormPagePaper = (props: FormPagePaperProps) => {
  const classes = useStyles();

  return (
    <Box p={props.noOuterPadding ? 0 : 2} className={classes.flexGrowContainer}>
      <Paper className={classes.flexGrowContainer}>
        <Box p={2} className={classes.flexGrowContainer}>
          {props.children}
        </Box>
      </Paper>
    </Box>
  );
};

export default React.memo(FormPagePaper);
