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
import { makeStyles } from "tss-react/mui";
import {
  copyText,
  Loader,
  showInfoDialog,
  TextFieldWithHelp,
  useDialogContext,
  useFrontendDownload,
} from "components-care";
import { useTranslation } from "react-i18next";
import useAsyncMemo from "components-care/dist/utils/useAsyncMemo";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { DataResponse } from "../../../api/ident-services/Common";
import { isRegularTotp, stripInvalidTotpChars } from "../../../utils/totpUtils";
import { useProfileModel } from "../../../components-care/models/ProfileModel";

export interface EnrollTotpDialogState {
  otp: string;
}

const useStyles = makeStyles()({
  qrContainer: {
    "& > svg": {
      width: "100%",
      height: "auto",
      maxHeight: 256,
    },
  },
});

export type OtpResponse = DataResponse<{
  attributes: {
    otp_enabled: boolean;
    otp_provisioning_qr_code: string;
    otp_secret_key: string;
    otp_backup_codes: string[];
  };
}>;

const EnrollTotpDialog = () => {
  const model = useProfileModel();
  const [pushDialog, popDialog] = useDialogContext();
  const { classes } = useStyles();
  const otpEnrollment = useAsyncMemo(
    async () =>
      (
        await BackendHttpClient.put<OtpResponse>(
          "/api/v1/identity-management/user",
          null,
          {
            data: { otp_enable: "true" },
          },
        )
      ).data.attributes,
    [],
  );
  const downloadFile = useFrontendDownload();
  const { t } = useTranslation("profile");
  const [state, setState] = useState<EnrollTotpDialogState>({
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
      if (!otpEnrollment) throw new Error("othEnrollment is null");

      try {
        const result = await BackendHttpClient.put<OtpResponse>(
          "/api/v1/identity-management/user",
          null,
          {
            data: {
              otp_enable: state.otp,
            },
          },
        );
        if (!result.data.attributes.otp_enabled) {
          throw new Error("TOTP activation failed");
        }
        await model.invalidateCacheForId("singleton");
        popDialog();
        showInfoDialog(pushDialog, {
          title: t("tabs.account.dialogs.enroll-totp.result.success.title"),
          message: (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography>
                  {t("tabs.account.dialogs.enroll-totp.result.success.info")}
                </Typography>
              </Grid>
              {otpEnrollment.otp_backup_codes.map((entry) => (
                <Grid
                  key={entry}
                  size={{
                    xs: 6,
                    md: 3,
                    xl: 2,
                  }}
                >
                  <Typography>{entry}</Typography>
                </Grid>
              ))}
            </Grid>
          ),
          buttons: [
            {
              text: t(
                "tabs.account.dialogs.enroll-totp.result.success.download",
              ),
              onClick: () => {
                downloadFile(
                  new File(
                    [
                      t(
                        "tabs.account.dialogs.enroll-totp.result.success.download-content",
                        {
                          BACKUP_CODES: otpEnrollment.otp_backup_codes
                            .map((code) => "- " + code)
                            .join("\n"),
                          HOSTNAME: window.location.hostname,
                        },
                      ),
                    ],
                    t(
                      "tabs.account.dialogs.enroll-totp.result.success.download-filename",
                      { HOSTNAME: window.location.hostname },
                    ),
                  ),
                );
              },
              dontClose: true,
            },
            {
              text: t("tabs.account.dialogs.enroll-totp.result.success.copy"),
              onClick: () => {
                copyText(otpEnrollment.otp_backup_codes.join("\n"));
              },
              dontClose: true,
            },
            {
              text: t("tabs.account.dialogs.enroll-totp.result.success.close"),
            },
          ],
        });
      } catch (_e) {
        showInfoDialog(pushDialog, {
          title: t("tabs.account.dialogs.enroll-totp.result.failure.title"),
          message: t("tabs.account.dialogs.enroll-totp.result.failure.info"),
        });
      }
    },
    [model, otpEnrollment, state.otp, popDialog, pushDialog, t, downloadFile],
  );

  return (
    <Dialog open>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("tabs.account.dialogs.enroll-totp.title")}</DialogTitle>
        <DialogContent>
          {otpEnrollment ? (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography>
                  {t("tabs.account.dialogs.enroll-totp.explainer-top")}
                </Typography>
              </Grid>
              <Grid
                dangerouslySetInnerHTML={{
                  __html: otpEnrollment.otp_provisioning_qr_code,
                }}
                className={classes.qrContainer}
                size={12}
              />
              <Grid size={12}>
                <Typography>
                  {t("tabs.account.dialogs.enroll-totp.explainer-middle-top")}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography>
                  {t("tabs.account.dialogs.enroll-totp.secret-key")}:{" "}
                  {otpEnrollment.otp_secret_key}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography>
                  {t(
                    "tabs.account.dialogs.enroll-totp.explainer-middle-bottom",
                  )}
                </Typography>
              </Grid>
              <Grid size={12}>
                <TextFieldWithHelp
                  value={state.otp}
                  name={"otp"}
                  onChange={handleTotpChange}
                  type={"text"}
                  label={t("tabs.account.dialogs.enroll-totp.fields.otp")}
                  fullWidth
                  variant={"standard"}
                />
              </Grid>
              <Grid size={12}>
                <Typography>
                  {t("tabs.account.dialogs.enroll-totp.explainer-bottom")}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Loader />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color={"secondary"}
            onClick={handleSubmit}
            type={"submit"}
            disabled={!otpEnrollment || !isRegularTotp(state.otp)}
          >
            {t("tabs.account.dialogs.enroll-totp.actions.submit")}
          </Button>
          <Button onClick={popDialog}>
            {t("tabs.account.dialogs.enroll-totp.actions.cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default React.memo(EnrollTotpDialog);
