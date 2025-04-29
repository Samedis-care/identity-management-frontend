import React, { useCallback, useState } from "react";
import { Grid, TextField, Typography } from "@mui/material";
import {
  ActionButton,
  showInfoDialog,
  useDialogContext,
  useNavigate,
  useParams,
  useLocation,
} from "components-care";
import { KeyboardArrowRight } from "@mui/icons-material";
import { AuthPageProps } from "./components/AuthPageLayout";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import { useTranslation } from "react-i18next";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";

const ResetPassword = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const { app } = params;
  const { t } = useTranslation("auth");
  const [pushDialog] = useDialogContext();
  const navigate = useNavigate();

  const [state, setState] = useState({
    password: "",
    password_confirm: "",
  });
  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      setState((prev) => ({ ...prev, [evt.target.name]: evt.target.value })),
    [],
  );

  const resetPassword = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      try {
        const urlParams = Object.fromEntries(
          new URLSearchParams(location.search).entries(),
        );
        const resp = await BackendHttpClient.put<{
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
              ...urlParams,
              reset_password_token: urlParams.token,
              password: state.password,
              password_confirmation: state.password_confirm,
            },
          },
          AuthMode.Off,
        );
        await showInfoDialog(pushDialog, {
          title: t("auth.password.reset.success.title"),
          message: resp.meta.msg.message,
        });
        const { invite_token } = Object.fromEntries(
          new URLSearchParams(location.search).entries(),
        );
        navigate(
          `/login/${app}?invite_token=${encodeURIComponent(invite_token ?? "")}`,
        );
      } catch (e) {
        await showInfoDialog(pushDialog, {
          title: t("auth.password.reset.error.title"),
          message: (e as Error).message,
        });
      }
    },
    [navigate, app, location.search, pushDialog, state, t],
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant={"h1"}>
            {t("auth.password.reset.title")}
          </Typography>
        </Grid>
        <Grid size={12}>
          <TextField
            name={"password"}
            onChange={handleChange}
            value={state.password}
            type={"password"}
            label={t("auth.password.reset.password")}
            autoFocus={true}
            fullWidth
            variant={"standard"}
          />
          <TextField
            name={"password_confirm"}
            onChange={handleChange}
            value={state.password_confirm}
            type={"password"}
            label={t("auth.password.reset.password_confirm")}
            fullWidth
            variant={"standard"}
          />
        </Grid>
        <Grid size={12}>
          <ActionButton
            icon={<KeyboardArrowRight />}
            type={"submit"}
            onClick={resetPassword}
          >
            {t("auth.password.reset.reset")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(ResetPassword);
