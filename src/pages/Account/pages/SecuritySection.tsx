import React, { useCallback } from "react";
import { Grid, styled, Typography } from "@mui/material";
import { KeyOutlined, PhonelinkLockOutlined } from "@mui/icons-material";
import {
  ActionButton,
  GroupBox,
  InfoBox,
  Loader,
  showErrorDialog,
  useDialogContext,
  useModelGet,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useOtpMutation } from "../../../api/ident-services/Otp";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountPage from "../components/AccountPage";
import ErrorInfo from "../components/ErrorInfo";
import SectionBody from "../components/SectionBody";
import SectionButtons from "../components/SectionButtons";
import SectionCell from "../components/SectionCell";
import StatusLine from "../components/StatusLine";
import ChangePasswordDialog from "../dialogs/ChangePasswordDialog";
import EnrollTotpDialog from "../dialogs/EnrollTotpDialog";
import UnrollTotpDialog from "../dialogs/UnrollTotpDialog";

// password, authenticator app, recovery email
const SAFEGUARDS = 3;

const StatusBox = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StatusList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const SecuritySection = () => {
  const { t } = useTranslation("account");
  const model = useProfileModel();
  const { data, isLoading, error } = useModelGet(model, "singleton");
  const [pushDialog] = useDialogContext();
  const { mutateAsync: startEnrollment, isPending: enrolling } =
    useOtpMutation();
  const totp = !!data?.[0].otp_enabled;

  const changePassword = useCallback(() => {
    pushDialog(<ChangePasswordDialog />);
  }, [pushDialog]);
  // the enrollment starts here (new secret and QR code), the dialog finishes it
  const changeTotp = useCallback(async () => {
    if (totp) {
      pushDialog(<UnrollTotpDialog />);
      return;
    }
    try {
      const enrollment = await startEnrollment({ otp_enable: "true" });
      pushDialog(<EnrollTotpDialog enrollment={enrollment} />);
    } catch (e) {
      await showErrorDialog(pushDialog, e);
    }
  }, [pushDialog, startEnrollment, totp]);

  if (isLoading) return <Loader />;
  if (error || !data)
    return (
      <AccountPage title={t("security.title")}>
        <ErrorInfo message={error?.message ?? ""} />
      </AccountPage>
    );

  const record = data[0];
  const recovery = !!record.recovery_email;
  const recoveryPending = !recovery && !!record.unconfirmed_recovery_email;
  // the password counts as set: IM has no account without one
  const active = 1 + (totp ? 1 : 0) + (recovery ? 1 : 0);

  return (
    <AccountPage title={t("security.title")}>
      <StatusBox>
        <InfoBox
          status={active === SAFEGUARDS ? "success" : "warning"}
          heading={t("security.status.heading", { COUNT: active })}
          expanded
          message={
            <StatusList>
              <StatusLine ok>{t("security.status.password")}</StatusLine>
              <StatusLine ok={totp}>
                {t(
                  totp ? "security.status.totp-on" : "security.status.totp-off",
                )}
              </StatusLine>
              <StatusLine ok={recovery}>
                {t(
                  recovery
                    ? "security.status.recovery-on"
                    : recoveryPending
                      ? "security.status.recovery-pending"
                      : "security.status.recovery-off",
                )}
              </StatusLine>
            </StatusList>
          }
        />
      </StatusBox>
      <Grid container spacing={2}>
        <SectionCell>
          <GroupBox label={t("security.password.title")}>
            <SectionBody>
              <Typography>{t("security.password.text")}</Typography>
              <SectionButtons>
                <ActionButton
                  fullWidth={false}
                  icon={<KeyOutlined />}
                  onClick={changePassword}
                >
                  {t("security.password.button")}
                </ActionButton>
              </SectionButtons>
            </SectionBody>
          </GroupBox>
        </SectionCell>
        <SectionCell>
          <GroupBox label={t("security.totp.title")}>
            <SectionBody>
              <StatusLine ok={totp}>
                {t(totp ? "security.totp.on" : "security.totp.off")}
              </StatusLine>
              <Typography>
                {t(totp ? "security.totp.text-on" : "security.totp.text-off")}
              </Typography>
              <SectionButtons>
                <ActionButton
                  fullWidth={false}
                  icon={<PhonelinkLockOutlined />}
                  onClick={changeTotp}
                  disabled={enrolling}
                >
                  {t(totp ? "security.totp.unroll" : "security.totp.enroll")}
                </ActionButton>
              </SectionButtons>
            </SectionBody>
          </GroupBox>
        </SectionCell>
      </Grid>
    </AccountPage>
  );
};

export default React.memo(SecuritySection);
