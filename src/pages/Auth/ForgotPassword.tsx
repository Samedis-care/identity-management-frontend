import React, { useCallback, useState } from "react";
import {
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import {
  ActionButton,
  FrameworkHistory,
  showErrorDialog,
  showInfoDialog,
  useDialogContext,
  useParams,
  useLocation,
} from "components-care";
import { ArrowBack, KeyboardArrowRight } from "@mui/icons-material";
import AccountManager from "../../utils/AccountManager";
import { AuthPageProps, useAuthPageState } from "./components/AuthPageLayout";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import { useTranslation } from "react-i18next";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { validateEmailRaw } from "components-care/dist/utils/validations/validateEmail";

const ForgotPassword = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { app } = params;
  const { t } = useTranslation("auth");
  const [state] = useAuthPageState();
  const [email, setEmail] = useState(queryParams.get("emailHint") ?? "");
  const handleBack = useCallback(() => FrameworkHistory.back(), []);
  const [pushDialog] = useDialogContext();

  const handleEmailChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(evt.target.value);
    },
    [],
  );

  const resetPassword = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();

      if (!state.activeAccount) {
        if (!validateEmailRaw(email)) {
          return showErrorDialog(pushDialog, {
            email: t("auth.password.forgot.email-invalid"),
          });
        }
      }

      try {
        const resp = await BackendHttpClient.post<{
          meta: {
            msg: {
              message: string;
            };
          };
        }>(
          `/api/v1/${app}/users/password`,
          null,
          {
            user: {
              ...Object.fromEntries(
                new URLSearchParams(location.search).entries(),
              ),
              email: state.activeAccount?.email ?? email,
            },
          },
          AuthMode.Off,
        );
        await showInfoDialog(pushDialog, {
          title: t("auth.password.forgot.success.title"),
          message: resp.meta.msg.message,
        });
      } catch (e) {
        await showInfoDialog(pushDialog, {
          title: t("auth.password.forgot.error.title"),
          message: (e as Error).message,
        });
      }
    },
    [app, email, location.search, pushDialog, state.activeAccount, t],
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant={"h1"}>
            {!AccountManager.isEmpty() && (
              <IconButton onClick={handleBack} size="large">
                <ArrowBack />
              </IconButton>
            )}
            {t("auth.password.forgot.title")}
          </Typography>
        </Grid>
        {state.activeAccount ? (
          <Grid size={12}>
            <Typography>
              {t("auth.password.forgot.info", {
                EMAIL: state.activeAccount.email,
              })}
            </Typography>
          </Grid>
        ) : (
          <>
            <Grid size={12}>{t("auth.password.forgot.info-no-mail")}</Grid>
            <Grid size={12}>
              <TextField
                onChange={handleEmailChange}
                value={email}
                label={t("auth.password.forgot.email")}
                placeholder={t("auth.password.forgot.email-placeholder")}
                name={"email"}
                autoComplete={"email"}
                error={!!email && !validateEmailRaw(email)}
                autoFocus
                fullWidth
                variant={"standard"}
              />
            </Grid>
          </>
        )}
        <Grid size={12}>
          <ActionButton
            icon={<KeyboardArrowRight />}
            type={"submit"}
            autoFocus={!!state.activeAccount}
            onClick={resetPassword}
          >
            {t("auth.password.forgot.send")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(ForgotPassword);
