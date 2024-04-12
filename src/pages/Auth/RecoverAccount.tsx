import React, { useCallback, useState } from "react";
import { Grid, TextField, Typography } from "@mui/material";
import {
  ActionButton,
  showErrorDialog,
  showInfoDialog,
  useDialogContext,
  useParams,
  useLocation,
  useNavigate,
} from "components-care";
import { KeyboardArrowRight } from "@mui/icons-material";
import { AuthPageProps } from "./components/AuthPageLayout";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import { useTranslation } from "react-i18next";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { validateEmailRaw } from "components-care/dist/utils/validations/validateEmail";
import { getAuthEndpoint } from "../../utils/AuthUtils";
import { OauthTokenResponse } from "../../api/ident-services/Auth";
import * as Sentry from "@sentry/react";

interface RecoverAccountState {
  email: string;
  recovery_email: string;
}

const RecoverAccount = (_props: AuthPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { token } = Object.fromEntries(queryParams.entries());
  const { app } = params;
  const { t } = useTranslation("auth");
  const [state, setState] = useState<RecoverAccountState>({
    email: "",
    recovery_email: "",
  });
  const [pushDialog] = useDialogContext();

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, [evt.target.name]: evt.target.value }));
    },
    [],
  );

  const recoverAccount = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();

      if (!validateEmailRaw(state.email)) {
        return showErrorDialog(pushDialog, {
          email: t("auth.recover_account.email-invalid"),
        });
      }
      if (!validateEmailRaw(state.recovery_email)) {
        return showErrorDialog(pushDialog, {
          recovery_email: t("auth.recover_account.recovery-email-invalid"),
        });
      }

      try {
        const resp = await BackendHttpClient.post<OauthTokenResponse>(
          getAuthEndpoint(app!),
          null,
          {
            ...Object.fromEntries(
              new URLSearchParams(location.search).entries(),
            ),
            grant_type: "password",
            email: state.email,
            recovery_email: state.recovery_email,
            password: token,
          },
          AuthMode.Off,
        );
        if (!resp.meta.redirect_url)
          Sentry.captureException(
            new Error("Recover account returned no redirect URL"),
            { data: { user_id: resp.data.attributes.id } },
          );
        navigate(resp.meta.redirect_url!);
      } catch (e) {
        await showInfoDialog(pushDialog, {
          title: t("auth.recovery_email.error.title"),
          message: (e as Error).message,
        });
      }
    },
    [
      app,
      location.search,
      navigate,
      pushDialog,
      state.email,
      state.recovery_email,
      t,
      token,
    ],
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant={"h1"}>
            {t("auth.recover_account.title")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {t("auth.recover_account.info")}
        </Grid>
        <Grid item xs={12}>
          <TextField
            onChange={handleChange}
            value={state.email}
            label={t("auth.recover_account.email")}
            placeholder={t("auth.recover_account.email-placeholder")}
            name={"email"}
            autoComplete={"email"}
            error={!!state.email && !validateEmailRaw(state.email)}
            autoFocus
            fullWidth
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            onChange={handleChange}
            value={state.recovery_email}
            label={t("auth.recover_account.recovery_email")}
            placeholder={t("auth.recover_account.recovery_email-placeholder")}
            name={"recovery_email"}
            autoComplete={"email"}
            error={
              !!state.recovery_email && !validateEmailRaw(state.recovery_email)
            }
            fullWidth
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={12}>
          <ActionButton
            icon={<KeyboardArrowRight />}
            type={"submit"}
            onClick={recoverAccount}
          >
            {t("auth.recover_account.do")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(RecoverAccount);
