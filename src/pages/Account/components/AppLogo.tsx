import React from "react";
import { styled } from "@mui/material";
import type { MyApp } from "../useMyApps";

export interface AppLogoProps {
  app: MyApp;
}

const Root = styled("div")(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  backgroundColor: "transparent",
  color: theme.palette.secondary.contrastText,
  fontWeight: 700,
  fontSize: 22,
  "& img": { maxWidth: "100%", maxHeight: "100%" },
  // no logo: the initial on the secondary color
  "&.initial": { backgroundColor: theme.palette.secondary.main },
}));

/** logo of an app, or its initial if it has none */
const AppLogo = (props: AppLogoProps) => {
  const { app } = props;
  const src = app.image?.small;
  return (
    <Root className={src ? undefined : "initial"}>
      {src ? (
        <img src={src} alt={""} />
      ) : (
        (app.full_name || app.name).charAt(0).toUpperCase()
      )}
    </Root>
  );
};

export default React.memo(AppLogo);
