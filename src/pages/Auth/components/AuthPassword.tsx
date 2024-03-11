import React, { useCallback, useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, KeyboardArrowRight } from "@mui/icons-material";
import { preserveUrlParams } from "../../../utils/preserveUrlParams";
import { useTranslation } from "react-i18next";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { OauthTokenResponse } from "../../../api/ident-services/Auth";
import { getAuthEndpoint } from "../../../utils/AuthUtils";
import downloadProfileImage from "../../../utils/downloadProfileImage";
import AccountManager from "../../../utils/AccountManager";
import * as Sentry from "@sentry/react";
import { AuthPageProps, useAuthPageState } from "./AuthPageLayout";
import {
  ActionButton,
  BackendError,
  FrameworkHistory,
  showInfoDialog,
  useDialogContext,
  Link,
  useParams,
  useLocation,
} from "components-care";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import UnverifiedAccountDialog from "./UnverifiedAccountDialog";

const AuthPassword = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const { app } = params;
  const [pushDialog] = useDialogContext();
  const [state, setState] = useAuthPageState();
  const { t } = useTranslation("auth");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const handlePasswordChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(evt.target.value);
    },
    [],
  );
  const changeStaySignedIn = useCallback(
    (_evt: React.ChangeEvent<Record<string, never>>, checked: boolean) => {
      setStaySignedIn(checked);
    },
    [],
  );
  const handleBack = useCallback(() => FrameworkHistory.back(), []);

  const handleNext = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      try {
        setBusy(true);
        const resp = await BackendHttpClient.post<OauthTokenResponse>(
          getAuthEndpoint(app!),
          null,
          {
            ...Object.fromEntries(
              new URLSearchParams(location.search).entries(),
            ),
            grant_type: "password",
            email: state.activeAccount!.email,
            password,
          },
          AuthMode.Off,
        );
        const image =
          resp.data.attributes.image.small &&
          (await downloadProfileImage(resp.data.attributes.image.small));
        if (!resp.meta.redirect_url) {
          Sentry.captureException(
            new Error("redirect_url not present in backend response"),
          );
        }
        const expires = new Date(Date.now() + resp.meta.expires_in * 1000);
        sessionStorage.setItem("token", resp.meta.token); // set session here to allow 2FA
        sessionStorage.setItem("token_expire", expires.toISOString());
        setState((prev) => ({
          ...prev,
          redirectURL: resp.meta.redirect_url!,
          currentFactor: undefined,
          remainingFactors: AccountManager.getAuthFactors(resp),
          activeAccount: AccountManager.updateAccount({
            id: resp.data.attributes.id,
            email: resp.data.attributes.email,
            name: [
              resp.data.attributes.first_name,
              resp.data.attributes.last_name,
            ]
              .filter((x) => x)
              .join(" "),
            avatar: image,
            session: staySignedIn
              ? {
                  token: resp.meta.token,
                  refresh: resp.meta.refresh_token,
                  until: expires,
                }
              : null,
          }),
        }));
      } catch (e) {
        console.error(e);
        const err = e as Error;
        if (
          err.name === "BackendError" &&
          (err as BackendError).code === "user_unverified"
        ) {
          pushDialog(
            <UnverifiedAccountDialog
              email={state.activeAccount!.email}
              app={app!}
              extraParams={Object.fromEntries(
                new URLSearchParams(location.search).entries(),
              )}
            />,
          );
        } else {
          await showInfoDialog(pushDialog, {
            title: t("auth.error"),
            message: err.message,
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [
      app,
      location.search,
      state.activeAccount,
      password,
      setState,
      staySignedIn,
      pushDialog,
      t,
    ],
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant={"h1"}>
          <IconButton onClick={handleBack} size="large">
            <ArrowBack />
          </IconButton>
          {t("auth.password.enter.title")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t("add.email")}
          name={"email"}
          type={"text"}
          fullWidth
          autoFocus
          value={state.activeAccount?.email ?? ""}
          disabled
          autoComplete={"email"}
          variant={"standard"}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t("auth.password.enter.password")}
          name={"password"}
          type={"password"}
          fullWidth
          autoFocus
          value={password}
          onChange={handlePasswordChange}
          autoComplete={"password"}
          variant={"standard"}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant={"caption"}>
          <MuiLink
            component={Link}
            to={preserveUrlParams(`/login/${app}/forgot-password`, location)}
          >
            {t("auth.password.enter.forgot")}
          </MuiLink>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={<Checkbox checked={staySignedIn} />}
          label={t("auth.password.enter.keep-session")}
          onChange={changeStaySignedIn}
        />
      </Grid>
      <Grid item xs={12}>
        <ActionButton
          icon={<KeyboardArrowRight />}
          type={"submit"}
          onClick={handleNext}
          disabled={busy}
        >
          {t("auth.password.enter.next")}
        </ActionButton>
      </Grid>
    </Grid>
  );
};

export default React.memo(AuthPassword);
