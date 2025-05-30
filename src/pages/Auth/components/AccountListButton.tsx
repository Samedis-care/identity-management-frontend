import React from "react";
import { Typography, Grid } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import AccountAvatar from "./AccountAvatar";

export interface AddNewAccountProps {
  icon: React.ReactNode;
  text: React.ReactNode;
  onClick: React.MouseEventHandler;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(1),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  label: {
    lineHeight: "36px",
  },
}));

const AccountListButton = (props: AddNewAccountProps) => {
  const { icon, text, onClick } = props;
  const { classes } = useStyles();
  return (
    <Grid
      size={12}
      className={classes.root}
      onClick={onClick}
      container
      spacing={2}
    >
      <Grid>
        <AccountAvatar>{icon}</AccountAvatar>
      </Grid>
      <Grid size={"grow"}>
        <Typography className={classes.label}>{text}</Typography>
      </Grid>
    </Grid>
  );
};

export default React.memo(AccountListButton);
