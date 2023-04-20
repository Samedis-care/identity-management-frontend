import React from "react";
import ProfilePage from "./ProfilePage";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles({
  root: {
    height: "100%",
    width: "100%",
    overflow: "auto",
  },
});

const ProfilePageStandalone = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ProfilePage />
    </div>
  );
};

export default React.memo(ProfilePageStandalone);
