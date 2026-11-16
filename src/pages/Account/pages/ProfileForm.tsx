import React, { useCallback, useMemo } from "react";
import { Grid, styled, Typography } from "@mui/material";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import {
  ActionButton,
  EditOnlyFormPage,
  FormField,
  GroupBox,
  InfoBox,
  PageProps,
  TextFieldWithHelp,
  useDialogContext,
  useModelDelete,
} from "components-care";
import { useTranslation } from "react-i18next";
import {
  ProfileModelType,
  useProfileModel,
} from "../../../components-care/models/ProfileModel";
import AccountManager from "../../../utils/AccountManager";
import {
  destroySession,
  redirectToLogin,
  useAuthProviderContext,
} from "../../components/AuthProvider";
import ProfilePicture from "../components/ProfilePicture";
import SectionBody from "../components/SectionBody";
import SectionButtons from "../components/SectionButtons";
import SectionCell from "../components/SectionCell";
import { READ_ONLY_SLOT_PROPS } from "../constants";
import ChangeEmailDialog from "../dialogs/ChangeEmailDialog";
import ConfirmByEmailDialog from "../dialogs/ConfirmByEmailDialog";

const PersonalRow = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  flexWrap: "nowrap",
  [theme.breakpoints.only("xs")]: { flexWrap: "wrap" },
}));

const PictureBox = styled("div")(({ theme }) => ({
  width: 140,
  height: 140,
  flexShrink: 0,
  [theme.breakpoints.only("xs")]: { margin: "0 auto" },
}));

const PersonalFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  flexGrow: 1,
  minWidth: 0,
}));

const DeleteRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  flexWrap: "wrap",
}));

const DeleteText = styled(Typography)({
  flex: "1 1 360px",
});

/**
 * The profile: name and mobile number are form fields (saved with the form's
 * button bar), the picture saves itself, the addresses are changed through
 * their own dialogs.
 */
const ProfileForm = (props: PageProps<ProfileModelType, undefined>) => {
  const { t } = useTranslation("account");
  const [pushDialog] = useDialogContext();
  const authCtx = useAuthProviderContext();
  const model = useProfileModel();
  const { mutateAsync: deleteProfile } = useModelDelete(model);
  const { values } = props;
  const email = values?.email ?? "";
  const unconfirmedEmail = values?.unconfirmed_email ?? "";
  const recoveryEmail = values?.recovery_email ?? "";
  const unconfirmedRecovery = values?.unconfirmed_recovery_email ?? "";

  const changeLoginEmail = useCallback(() => {
    pushDialog(<ChangeEmailDialog kind={"login"} current={email} />);
  }, [email, pushDialog]);
  const changeRecoveryEmail = useCallback(() => {
    pushDialog(
      <ChangeEmailDialog kind={"recovery"} current={recoveryEmail || null} />,
    );
  }, [recoveryEmail, pushDialog]);
  const confirmDelete = useCallback(async () => {
    await deleteProfile("singleton");
    AccountManager.forgetAccount(authCtx.id);
    await destroySession();
    redirectToLogin(false);
  }, [authCtx.id, deleteProfile]);
  const deleteAccount = useCallback(() => {
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
        onConfirm={confirmDelete}
      />,
    );
  }, [confirmDelete, email, pushDialog, t]);

  // the form page re-renders on every value change; the boxes only change
  // with the addresses
  const content = useMemo(
    () => (
      <Grid container spacing={2}>
        <SectionCell>
          <GroupBox label={t("profile.personal.title")}>
            <SectionBody>
              <PersonalRow>
                <PictureBox>
                  <ProfilePicture />
                </PictureBox>
                <PersonalFields>
                  <FormField name={"first_name"} />
                  <FormField name={"last_name"} />
                  <FormField name={"mobile"} />
                </PersonalFields>
              </PersonalRow>
            </SectionBody>
          </GroupBox>
        </SectionCell>
        <SectionCell>
          <GroupBox label={t("profile.email.title")}>
            <SectionBody>
              <TextFieldWithHelp
                label={t("profile.email.login")}
                value={email}
                helperText={t("profile.email.login-help")}
                slotProps={READ_ONLY_SLOT_PROPS}
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
                  slotProps={READ_ONLY_SLOT_PROPS}
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
              <SectionButtons>
                <ActionButton
                  fullWidth={false}
                  icon={<EditOutlined />}
                  onClick={changeLoginEmail}
                >
                  {t("profile.email.change-login")}
                </ActionButton>
                <ActionButton
                  fullWidth={false}
                  icon={<EditOutlined />}
                  onClick={changeRecoveryEmail}
                >
                  {t(
                    recoveryEmail || unconfirmedRecovery
                      ? "profile.email.change-recovery"
                      : "profile.email.setup-recovery",
                  )}
                </ActionButton>
              </SectionButtons>
            </SectionBody>
          </GroupBox>
        </SectionCell>
        <SectionCell md={12}>
          <GroupBox label={t("profile.delete.title")}>
            <DeleteRow>
              <DeleteText>{t("profile.delete.text")}</DeleteText>
              <ActionButton
                fullWidth={false}
                color={"error"}
                icon={<DeleteOutlined />}
                onClick={deleteAccount}
              >
                {t("profile.delete.button")}
              </ActionButton>
            </DeleteRow>
          </GroupBox>
        </SectionCell>
      </Grid>
    ),
    [
      changeLoginEmail,
      changeRecoveryEmail,
      deleteAccount,
      email,
      recoveryEmail,
      t,
      unconfirmedEmail,
      unconfirmedRecovery,
    ],
  );

  return <EditOnlyFormPage {...props}>{content}</EditOnlyFormPage>;
};

export default React.memo(ProfileForm);
