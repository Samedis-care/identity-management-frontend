import React, { useCallback } from "react";
import { Grid, IconButton, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Apple, Facebook, Google, Microsoft, Twitter } from "mdi-material-ui";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import i18n from "../../../i18n";

export interface SocialLoginsProps {
  app: string;
}

const {
  REACT_APP_OAUTH_FACEBOOK,
  REACT_APP_OAUTH_TWITTER,
  REACT_APP_OAUTH_GOOGLE,
  REACT_APP_OAUTH_MICROSOFT,
  REACT_APP_OAUTH_APPLE,
} = process.env;

export const enableSocialLogins = (): boolean =>
  REACT_APP_OAUTH_FACEBOOK === "y" ||
  REACT_APP_OAUTH_TWITTER === "y" ||
  REACT_APP_OAUTH_GOOGLE === "y" ||
  REACT_APP_OAUTH_MICROSOFT === "y" ||
  REACT_APP_OAUTH_APPLE === "y";

const useStyles = makeStyles((theme) => ({
  socialLogin: {
    border: "solid 1px #3f51b5",
    padding: 4,
    margin: 8,
    color: theme.palette.primary.main,
    width: 40,
    height: 40,
  },
}));

export const doOauthSignIn = (
  type: string,
  app: string,
  location: ReturnType<typeof useLocation>,
  emailHint: string | null
) => {
  const payload: Record<string, string> = {
    app,
    locale: i18n.language,
    state: JSON.stringify({
      ...Object.fromEntries(new URLSearchParams(location.search).entries()),
      app,
    }),
  };
  if (emailHint) payload.login_hint = emailHint;

  const form = document.createElement("form");
  form.style.visibility = "hidden";
  form.method = "POST";
  form.action = `/api/v1/users/auth/${encodeURI(type)}`;
  Object.entries(payload).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

const SocialLogins = (props: SocialLoginsProps) => {
  const { app } = props;

  const classes = useStyles();
  const { t } = useTranslation("auth");
  const location = useLocation();

  const doThirdPartySignIn = useCallback(
    (
      type:
        | "facebook"
        | "twitter"
        | "google_oauth2"
        | "microsoft_graph"
        | "apple"
    ) => {
      doOauthSignIn(type, app, location, null);
    },
    [app, location]
  );
  const userFacebookSignIn = useCallback(
    () => doThirdPartySignIn("facebook"),
    [doThirdPartySignIn]
  );
  const userGoogleSignIn = useCallback(
    () => doThirdPartySignIn("google_oauth2"),
    [doThirdPartySignIn]
  );
  const userMicrosoftSignIn = useCallback(
    () => doThirdPartySignIn("microsoft_graph"),
    [doThirdPartySignIn]
  );
  const userTwitterSignIn = useCallback(
    () => doThirdPartySignIn("twitter"),
    [doThirdPartySignIn]
  );
  const userAppleSignIn = useCallback(
    () => doThirdPartySignIn("apple"),
    [doThirdPartySignIn]
  );

  return (
    <>
      {enableSocialLogins() && (
        <Grid
          item
          xs={12}
          container
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Grid item xs={12}>
            <Typography variant={"h1"} component={"h2"}>
              {t("add.connect")}
            </Typography>
          </Grid>
          <Grid item>
            {REACT_APP_OAUTH_FACEBOOK === "y" && (
              <IconButton
                className={classes.socialLogin}
                onClick={userFacebookSignIn}
                size="large"
              >
                <Facebook />
              </IconButton>
            )}
            {REACT_APP_OAUTH_GOOGLE === "y" && (
              <IconButton
                className={classes.socialLogin}
                onClick={userGoogleSignIn}
                size="large"
              >
                <Google />
              </IconButton>
            )}
            {REACT_APP_OAUTH_MICROSOFT === "y" && (
              <IconButton
                className={classes.socialLogin}
                onClick={userMicrosoftSignIn}
                size="large"
              >
                <Microsoft />
              </IconButton>
            )}
            {REACT_APP_OAUTH_TWITTER === "y" && (
              <IconButton
                className={classes.socialLogin}
                onClick={userTwitterSignIn}
                size="large"
              >
                <Twitter />
              </IconButton>
            )}
            {REACT_APP_OAUTH_APPLE === "y" && (
              <IconButton
                className={classes.socialLogin}
                onClick={userAppleSignIn}
                size="large"
              >
                <Apple />
              </IconButton>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default React.memo(SocialLogins);
