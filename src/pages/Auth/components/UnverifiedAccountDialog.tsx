import React, { useCallback } from "react";
import {
  ActionButton,
  showInfoDialog,
  useDialogContext,
} from "components-care";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";

export interface UnverifiedAccountDialogProps {
  email: string;
  app: string;
  extraParams?: Record<string, string>;
}

const UnverifiedAccountDialog = (props: UnverifiedAccountDialogProps) => {
  const { email, app, extraParams } = props;
  const { t } = useTranslation("auth");
  const [pushDialog, popDialog] = useDialogContext();

  const resendConfirm = useCallback(async () => {
    try {
      const resp = await BackendHttpClient.post<{
        meta: { msg: { message: string } };
      }>(
        `/api/v1/${app}/users/confirmation`,
        null,
        {
          user: { email },
          ...extraParams,
        },
        AuthMode.Off
      );
      await showInfoDialog(pushDialog, {
        title: t("auth.unverified-account-error-dialog.resend.success.title"),
        message: resp.meta.msg.message,
      });
    } catch (e) {
      await showInfoDialog(pushDialog, {
        title: t("auth.unverified-account-error-dialog.resend.error.title"),
        message: (e as Error).message,
      });
    } finally {
      popDialog();
    }
  }, [pushDialog, popDialog, t, email, app, extraParams]);

  return (
    <Dialog open={true} onClose={popDialog}>
      <DialogTitle>
        {t("auth.unverified-account-error-dialog.title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("auth.unverified-account-error-dialog.message", { EMAIL: email })}
        </DialogContentText>
        <ActionButton onClick={resendConfirm} icon={<KeyboardArrowRight />}>
          {t("auth.unverified-account-error-dialog.send-confirm-again", {
            EMAIL: email,
          })}
        </ActionButton>
      </DialogContent>
      <DialogActions>
        <Button onClick={popDialog} color={"primary"} autoFocus={true}>
          {t("auth.unverified-account-error-dialog.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(UnverifiedAccountDialog);
