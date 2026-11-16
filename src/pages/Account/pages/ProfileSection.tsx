import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { DeleteOutlined, EditOutlined, Save } from "@mui/icons-material";
import {
  ActionButton,
  GroupBox,
  InfoBox,
  Loader,
  TextFieldWithHelp,
  useDialogContext,
  useModelDelete,
  useModelGet,
  useModelMutation,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountManager from "../../../utils/AccountManager";
import {
  destroySession,
  redirectToLogin,
  useAuthProviderContext,
} from "../../components/AuthProvider";
import ProfilePicture from "../components/ProfilePicture";
import AccountPage from "../components/AccountPage";
import {
  BoxBody,
  Buttons,
  Cell,
  readOnly,
  ErrorInfo,
} from "../components/Section";
import ChangeEmailDialog from "../dialogs/ChangeEmailDialog";
import ConfirmByEmailDialog from "../dialogs/ConfirmByEmailDialog";

interface PersonalValues {
  first_name: string;
  last_name: string;
  mobile: string;
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

const ProfileSection = () => {
  const { t } = useTranslation("account");
  const model = useProfileModel();
  const { data, isLoading, error } = useModelGet(model, "singleton");
  const { mutateAsync: updateProfile } = useModelMutation(model);
  const { mutateAsync: deleteProfile } = useModelDelete(model);
  const [pushDialog] = useDialogContext();
  const authCtx = useAuthProviderContext();
  const record = data?.[0];
  const [values, setValues] = useState<PersonalValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const stored: PersonalValues = {
    first_name: str(record?.first_name),
    last_name: str(record?.last_name),
    mobile: str(record?.mobile),
  };
  const current = values ?? stored;
  const dirty =
    !!values &&
    (values.first_name !== stored.first_name ||
      values.last_name !== stored.last_name ||
      values.mobile !== stored.mobile);
  const missing = (key: keyof PersonalValues) => !current[key].trim();
  // the mobile number is optional
  const valid = !missing("first_name") && !missing("last_name");

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 3000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  if (isLoading) return <Loader />;
  if (error || !record)
    return (
      <AccountPage title={t("profile.title")}>
        <ErrorInfo message={(error as Error)?.message ?? ""} />
      </AccountPage>
    );

  const email = str(record.email);
  const unconfirmedEmail = str(record.unconfirmed_email);
  const recoveryEmail = str(record.recovery_email);
  const unconfirmedRecovery = str(record.unconfirmed_recovery_email);

  const set =
    (key: keyof PersonalValues) => (evt: React.ChangeEvent<HTMLInputElement>) =>
      setValues({ ...current, [key]: evt.target.value });

  const save = async () => {
    if (!values || !valid) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        id: "singleton",
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        mobile: values.mobile.trim(),
      });
      setValues(null);
      setSaved(true);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = () =>
    pushDialog(
      <ConfirmByEmailDialog
        title={t("dialogs.delete.title")}
        heading={t("dialogs.delete.heading")}
        text={t("dialogs.delete.text")}
        confirmLabel={t("dialogs.delete.confirm")}
        invalidText={t("dialogs.delete.invalid")}
        submitLabel={t("dialogs.delete.submit")}
        submitIcon={<DeleteOutlined />}
        email={email}
        onConfirm={async () => {
          await deleteProfile("singleton");
          AccountManager.forgetAccount(authCtx.id);
          await destroySession();
          redirectToLogin(false);
        }}
      />,
    );

  const requiredHelp = (key: keyof PersonalValues, help = " ") =>
    missing(key) ? t("profile.personal.required") : help;

  return (
    <AccountPage title={t("profile.title")}>
      <Grid container spacing={2}>
        <Cell>
          <GroupBox label={t("profile.personal.title")}>
            <BoxBody>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <Box
                  sx={{
                    width: 140,
                    height: 140,
                    flexShrink: 0,
                    mx: { xs: "auto", sm: 0 },
                  }}
                >
                  <ProfilePicture />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    flexGrow: 1,
                    minWidth: 0,
                  }}
                >
                  <TextFieldWithHelp
                    label={t("profile.personal.first-name")}
                    value={current.first_name}
                    onChange={set("first_name")}
                    error={missing("first_name")}
                    helperText={requiredHelp("first_name")}
                    autoComplete={"given-name"}
                    fullWidth
                  />
                  <TextFieldWithHelp
                    label={t("profile.personal.last-name")}
                    value={current.last_name}
                    onChange={set("last_name")}
                    error={missing("last_name")}
                    helperText={requiredHelp("last_name")}
                    autoComplete={"family-name"}
                    fullWidth
                  />
                  <TextFieldWithHelp
                    label={t("profile.personal.mobile")}
                    value={current.mobile}
                    onChange={set("mobile")}
                    helperText={t("profile.personal.mobile-help")}
                    type={"tel"}
                    autoComplete={"tel"}
                    fullWidth
                  />
                </Box>
              </Box>
              {saveError && <ErrorInfo message={saveError} />}
              <Buttons>
                <ActionButton
                  fullWidth={false}
                  icon={<Save />}
                  disabled={!dirty || !valid || saving}
                  onClick={save}
                >
                  {t("common.save")}
                </ActionButton>
                {saved && (
                  <Typography
                    color={"success.main"}
                    sx={{ alignSelf: "center" }}
                    role={"status"}
                  >
                    {t("profile.personal.saved")}
                  </Typography>
                )}
              </Buttons>
            </BoxBody>
          </GroupBox>
        </Cell>
        <Cell>
          <GroupBox label={t("profile.email.title")}>
            <BoxBody>
              <TextFieldWithHelp
                label={t("profile.email.login")}
                value={email}
                helperText={t("profile.email.login-help")}
                slotProps={readOnly}
                disableClearable
                fullWidth
              />
              {unconfirmedEmail && (
                <InfoBox
                  status={"warning"}
                  heading={t("profile.email.login-pending", {
                    EMAIL: unconfirmedEmail,
                  })}
                  message={t("profile.email.login-pending-text")}
                  expanded
                />
              )}
              {recoveryEmail ? (
                <TextFieldWithHelp
                  label={t("profile.email.recovery")}
                  value={recoveryEmail}
                  helperText={t("profile.email.recovery-help")}
                  slotProps={readOnly}
                  disableClearable
                  fullWidth
                />
              ) : (
                !unconfirmedRecovery && (
                  <Typography color={"text.secondary"}>
                    {t("profile.email.recovery-none")}
                  </Typography>
                )
              )}
              {unconfirmedRecovery && (
                <InfoBox
                  status={"warning"}
                  heading={t("profile.email.recovery-pending", {
                    EMAIL: unconfirmedRecovery,
                  })}
                  message={t("profile.email.recovery-pending-text")}
                  expanded
                />
              )}
              <Buttons>
                <ActionButton
                  fullWidth={false}
                  icon={<EditOutlined />}
                  onClick={() =>
                    pushDialog(
                      <ChangeEmailDialog kind={"login"} current={email} />,
                    )
                  }
                >
                  {t("profile.email.change-login")}
                </ActionButton>
                <ActionButton
                  fullWidth={false}
                  icon={<EditOutlined />}
                  onClick={() =>
                    pushDialog(
                      <ChangeEmailDialog
                        kind={"recovery"}
                        current={recoveryEmail || null}
                      />,
                    )
                  }
                >
                  {t(
                    recoveryEmail || unconfirmedRecovery
                      ? "profile.email.change-recovery"
                      : "profile.email.setup-recovery",
                  )}
                </ActionButton>
              </Buttons>
            </BoxBody>
          </GroupBox>
        </Cell>
        <Cell md={12}>
          <GroupBox label={t("profile.delete.title")}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ flex: "1 1 360px" }}>
                {t("profile.delete.text")}
              </Typography>
              <ActionButton
                fullWidth={false}
                color={"error"}
                icon={<DeleteOutlined />}
                onClick={deleteAccount}
              >
                {t("profile.delete.button")}
              </ActionButton>
            </Box>
          </GroupBox>
        </Cell>
      </Grid>
    </AccountPage>
  );
};

export default React.memo(ProfileSection);
