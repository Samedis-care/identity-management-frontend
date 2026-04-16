import React from "react";
import ProfilePage from "./ProfilePage";
import { styled } from "@mui/material";

const Root = styled("div")({
  height: "100%",
  width: "100%",
  overflow: "auto",
});

const ProfilePageStandalone = () => {
  return (
    <Root>
      <ProfilePage />
    </Root>
  );
};

export default React.memo(ProfilePageStandalone);
