import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { KeyOutlined, PhonelinkLockOutlined } from "@mui/icons-material";
import {
  ActionButton,
  GroupBox,
  InfoBox,
  Loader,
  useDialogContext,
  useModelGet,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountPage from "../components/AccountPage";
import {
  BoxBody,
  Buttons,
  Cell,
  Status,
  ErrorInfo,
} from "../components/Section";
import ChangePasswordDialog from "../dialogs/ChangePasswordDialog";
import EnrollTotpDialog from "../dialogs/EnrollTotpDialog";
import UnrollTotpDialog from "../dialogs/UnrollTotpDialog";

const SecuritySection = () => {
  const { t } = useTranslation("account");
  const model = useProfileModel();
  const { data, isLoading, error } = useModelGet(model, "singleton");
  const [pushDialog] = useDialogContext();
  const record = data?.[0];

  if (isLoading) return <Loader />;
  if (error || !record)
    return (
      <AccountPage title={t("security.title")}>
        <ErrorInfo message={(error as Error)?.message ?? ""} />
      </AccountPage>
    );

  const totp = !!record.otp_enabled;
  const recovery = !!record.recovery_email;
  const recoveryPending = !recovery && !!record.unconfirmed_recovery_email;
  // the password counts as set: IM has no account without one
  const active = 1 + (totp ? 1 : 0) + (recovery ? 1 : 0);

  return (
    <AccountPage title={t("security.title")}>
      <Box sx={{ mb: 2 }}>
        <InfoBox
          status={active === 3 ? "success" : "warning"}
          heading={t("security.status.heading", { COUNT: active })}
          expanded
          message={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Status ok>{t("security.status.password")}</Status>
              <Status ok={totp}>
                {t(
                  totp ? "security.status.totp-on" : "security.status.totp-off",
                )}
              </Status>
              <Status ok={recovery}>
                {t(
                  recovery
                    ? "security.status.recovery-on"
                    : recoveryPending
                      ? "security.status.recovery-pending"
                      : "security.status.recovery-off",
                )}
              </Status>
            </Box>
          }
        />
      </Box>
      <Grid container spacing={2}>
        <Cell>
          <GroupBox label={t("security.password.title")}>
            <BoxBody>
              <Typography>{t("security.password.text")}</Typography>
              <Buttons>
                <ActionButton
                  fullWidth={false}
                  icon={<KeyOutlined />}
                  onClick={() => pushDialog(<ChangePasswordDialog />)}
                >
                  {t("security.password.button")}
                </ActionButton>
              </Buttons>
            </BoxBody>
          </GroupBox>
        </Cell>
        <Cell>
          <GroupBox label={t("security.totp.title")}>
            <BoxBody>
              <Status ok={totp}>
                {t(totp ? "security.totp.on" : "security.totp.off")}
              </Status>
              <Typography>
                {t(totp ? "security.totp.text-on" : "security.totp.text-off")}
              </Typography>
              <Buttons>
                <ActionButton
                  fullWidth={false}
                  icon={<PhonelinkLockOutlined />}
                  onClick={() =>
                    pushDialog(
                      totp ? <UnrollTotpDialog /> : <EnrollTotpDialog />,
                    )
                  }
                >
                  {t(totp ? "security.totp.unroll" : "security.totp.enroll")}
                </ActionButton>
              </Buttons>
            </BoxBody>
          </GroupBox>
        </Cell>
      </Grid>
    </AccountPage>
  );
};

export default React.memo(SecuritySection);
