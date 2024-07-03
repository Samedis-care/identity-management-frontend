import React, { useCallback } from "react";
import { Grid, Typography } from "@mui/material";
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

const ConfirmAccount = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reason = queryParams.get("reason") ?? "default";
  const navigate = useNavigate();
  const { app } = params;
  const { t } = useTranslation("auth");
  const [pushDialog] = useDialogContext();

  const confirmAccount = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      try {
        const { token, invite_token } = Object.fromEntries(
          new URLSearchParams(location.search).entries(),
        );
        const resp = await BackendHttpClient.get<{
          data: {
            attributes: {
              email: string;
            };
          };
          meta: {
            msg: {
              message: string;
            };
          };
        }>(
          `/api/v1/${app}/users/confirmation/${token}`,
          {
            invite_token,
            reason,
          },
          AuthMode.Off,
        );
        await showInfoDialog(pushDialog, {
          title: t("auth.confirm." + reason + ".success.title"),
          message: resp.meta.msg.message,
        });
        navigate(
          `/login/${app}?invite_token=${encodeURIComponent(invite_token)}`,
        );
      } catch (e) {
        await showInfoDialog(pushDialog, {
          title: t("auth.confirm." + reason + ".error.title"),
          message: (e as Error).message,
        });
      }
    },
    [location.search, app, reason, pushDialog, t, navigate],
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant={"h2"}>
            {t("auth.confirm." + reason + ".title")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {t("auth.confirm." + reason + ".info")}
        </Grid>
        <Grid item xs={12}>
          <ActionButton
            icon={<KeyboardArrowRight />}
            type={"submit"}
            onClick={confirmAccount}
          >
            {t("auth.confirm." + reason + ".button")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(ConfirmAccount);
