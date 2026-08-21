import React from "react";
import ProfilePage from "./ProfilePage";
import { styled } from "@mui/material";

const Root = styled("div")({
  height: "100%",
  width: "100%",
  overflow: "auto",
  // ImCrud's root grows via flexGrow, so this has to be a flex container,
  // otherwise the page sizes to content and the data grids collapse
  display: "flex",
  flexDirection: "column",
});

const ProfilePageStandalone = () => {
  return (
    <Root>
      <ProfilePage />
    </Root>
  );
};

export default React.memo(ProfilePageStandalone);
