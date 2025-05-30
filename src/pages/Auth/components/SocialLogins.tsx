import React, { useCallback } from "react";
import { Grid, IconButton, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { Apple, Facebook, Google, Microsoft, Twitter } from "mdi-material-ui";
import { useTranslation } from "react-i18next";
import { useLocation } from "components-care";
import i18n from "../../../i18n";
import {
  OauthApple,
  OauthFacebook,
  OauthGoogle,
  OauthMicrosoft,
  OauthTwitter,
} from "../../../constants";

export interface SocialLoginsProps {
  app: string;
}

export const enableSocialLogins = (): boolean =>
  OauthFacebook || OauthTwitter || OauthGoogle || OauthMicrosoft || OauthApple;

const useStyles = makeStyles()((theme) => ({
  socialLogin: {
    border: "solid 1px #3f51b5",
    padding: 4,
    color: theme.palette.primary.main,
    width: 40,
    height: 40,
  },
}));

export const doOauthSignIn = (
  type: string,
  app: string,
  location: ReturnType<typeof useLocation>,
  emailHint: string | null,
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

  const { classes } = useStyles();
  const { t } = useTranslation("auth");
  const location = useLocation();

  const doThirdPartySignIn = useCallback(
    (
      type:
        | "facebook"
        | "twitter"
        | "google_oauth2"
        | "microsoft_graph"
        | "apple",
    ) => {
      doOauthSignIn(type, app, location, null);
    },
    [app, location],
  );
  const userFacebookSignIn = useCallback(
    () => doThirdPartySignIn("facebook"),
    [doThirdPartySignIn],
  );
  const userGoogleSignIn = useCallback(
    () => doThirdPartySignIn("google_oauth2"),
    [doThirdPartySignIn],
  );
  const userMicrosoftSignIn = useCallback(
    () => doThirdPartySignIn("microsoft_graph"),
    [doThirdPartySignIn],
  );
  const userTwitterSignIn = useCallback(
    () => doThirdPartySignIn("twitter"),
    [doThirdPartySignIn],
  );
  const userAppleSignIn = useCallback(
    () => doThirdPartySignIn("apple"),
    [doThirdPartySignIn],
  );

  return (
    <>
      {enableSocialLogins() && (
        <Grid
          container
          alignItems={"center"}
          justifyContent={"flex-start"}
          spacing={2}
          size={12}
        >
          <Grid size={12}>
            <Typography variant={"h1"} component={"h2"}>
              {t("add.connect")}
            </Typography>
          </Grid>
          {OauthFacebook && (
            <Grid>
              <IconButton
                className={classes.socialLogin}
                onClick={userFacebookSignIn}
                size="large"
              >
                <Facebook />
              </IconButton>
            </Grid>
          )}
          {OauthGoogle && (
            <Grid>
              <IconButton
                className={classes.socialLogin}
                onClick={userGoogleSignIn}
                size="large"
              >
                <Google />
              </IconButton>
            </Grid>
          )}
          {OauthMicrosoft && (
            <Grid>
              <IconButton
                className={classes.socialLogin}
                onClick={userMicrosoftSignIn}
                size="large"
              >
                <Microsoft />
              </IconButton>
            </Grid>
          )}
          {OauthTwitter && (
            <Grid>
              <IconButton
                className={classes.socialLogin}
                onClick={userTwitterSignIn}
                size="large"
              >
                <Twitter />
              </IconButton>
            </Grid>
          )}
          {OauthApple && (
            <Grid>
              <IconButton
                className={classes.socialLogin}
                onClick={userAppleSignIn}
                size="large"
              >
                <Apple />
              </IconButton>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
};

export default React.memo(SocialLogins);
