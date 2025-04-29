import React, { useCallback } from "react";
import { Grid, Typography } from "@mui/material";
import {
  ActionButton,
  showInfoDialog,
  useDialogContext,
  useParams,
  useLocation,
} from "components-care";
import { KeyboardArrowRight } from "@mui/icons-material";
import { AuthPageProps } from "./components/AuthPageLayout";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import { useTranslation } from "react-i18next";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";

const ConfirmRecoveryEmail = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const { app } = params;
  const { t } = useTranslation("auth");
  const [pushDialog] = useDialogContext();

  const confirmRecoveryEmail = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      try {
        const { token } = Object.fromEntries(
          new URLSearchParams(location.search).entries(),
        );
        const resp = await BackendHttpClient.get<{
          meta: {
            msg: {
              message: string;
            };
            redirect_url: string;
          };
        }>(
          `/api/v1/${app}/users/recovery_confirmation/${token}`,
          null,
          AuthMode.Off,
        );
        await showInfoDialog(pushDialog, {
          title: t("auth.confirm-recovery-email.success.title"),
          message: resp.meta.msg.message,
        });
        window.location.href = resp.meta.redirect_url;
      } catch (e) {
        await showInfoDialog(pushDialog, {
          title: t("auth.confirm-recovery-email.error.title"),
          message: (e as Error).message,
        });
      }
    },
    [app, location.search, pushDialog, t],
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant={"h2"}>
            {t("auth.confirm-recovery-email.title")}
          </Typography>
        </Grid>
        <Grid size={12}>{t("auth.confirm-recovery-email.info")}</Grid>
        <Grid size={12}>
          <ActionButton
            icon={<KeyboardArrowRight />}
            type={"submit"}
            onClick={confirmRecoveryEmail}
          >
            {t("auth.confirm-recovery-email.button")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(ConfirmRecoveryEmail);
