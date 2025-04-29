import React, { useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import {
  showInfoDialog,
  TextFieldWithHelp,
  useDialogContext,
} from "components-care";
import { useTranslation } from "react-i18next";
import { isValidTotp, stripInvalidTotpChars } from "../../../utils/totpUtils";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import { OtpResponse } from "./EnrollTotpDialog";

export interface UnrollTotpDialogState {
  otp: string;
}

const UnrollTotpDialog = () => {
  const [pushDialog, popDialog] = useDialogContext();
  const model = useProfileModel();
  const { t } = useTranslation("profile");
  const [state, setState] = useState<UnrollTotpDialogState>({
    otp: "",
  });
  const handleTotpChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({
        ...prev,
        otp: stripInvalidTotpChars(evt.target.value),
      }));
    },
    [],
  );
  const handleSubmit = useCallback(
    async (evt: React.MouseEvent | React.FormEvent) => {
      evt.preventDefault();

      try {
        const result = await BackendHttpClient.put<OtpResponse>(
          "/api/v1/identity-management/user",
          null,
          {
            data: {
              otp_disable: state.otp,
            },
          },
        );
        if (result.data.attributes.otp_enabled) {
          throw new Error("TOTP deactivation failed");
        }
        popDialog();
        showInfoDialog(pushDialog, {
          title: t("tabs.account.dialogs.unroll-totp.result.success.title"),
          message: t("tabs.account.dialogs.unroll-totp.result.success.info"),
        });
        model.invalidateCacheForId("singleton");
      } catch (_e) {
        showInfoDialog(pushDialog, {
          title: t("tabs.account.dialogs.unroll-totp.result.failure.title"),
          message: t("tabs.account.dialogs.unroll-totp.result.failure.info"),
        });
      }
    },
    [popDialog, pushDialog, state.otp, t, model],
  );

  return (
    <Dialog open>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("tabs.account.dialogs.unroll-totp.title")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography>
                {t("tabs.account.dialogs.unroll-totp.explainer-top")}
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextFieldWithHelp
                value={state.otp}
                name={"otp"}
                onChange={handleTotpChange}
                type={"text"}
                label={t("tabs.account.dialogs.unroll-totp.fields.otp")}
                fullWidth
                variant={"standard"}
              />
            </Grid>
            <Grid size={12}>
              <Typography>
                {t("tabs.account.dialogs.unroll-totp.explainer-bottom")}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color={"secondary"}
            onClick={handleSubmit}
            type={"submit"}
            disabled={!isValidTotp(state.otp)}
          >
            {t("tabs.account.dialogs.unroll-totp.actions.submit")}
          </Button>
          <Button onClick={popDialog}>
            {t("tabs.account.dialogs.unroll-totp.actions.cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default React.memo(UnrollTotpDialog);
