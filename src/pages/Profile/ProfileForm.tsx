import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, Paper, Tab, Typography, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  ActionButton,
  EditOnlyFormPage,
  FormField,
  PageProps,
  showErrorDialog,
  showInputDialog,
  useDialogContext,
  useModelDelete,
  useModelDeleteMultiple,
  RoutedTabs,
  RoutedTabPanelWrapper,
  useRoutedTabPanel,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import {
  ProfileModel,
  useProfileModel,
} from "../../components-care/models/ProfileModel";
import { KeyboardArrowRight } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import ImCrud from "../../components-care/ImCrud";
import { useProfileLoginsModel } from "../../components-care/models/ProfileLoginsModel";
import { useProfileActivityModel } from "../../components-care/models/ProfileActivityModel";
import ResetPasswordDialog from "./components/ResetPasswordDialog";
import AppsList from "./components/AppsList";
import ProfilePicture from "./components/ProfilePicture";
import {
  destroySession,
  redirectToLogin,
  useAuthProviderContext,
} from "../components/AuthProvider";
import EnrollTotpDialog from "./components/EnrollTotpDialog";
import UnrollTotpDialog from "./components/UnrollTotpDialog";
import AccountManager from "../../utils/AccountManager";

const useStyles = makeStyles({
  root: {
    height: "100%",
    flexGrow: 1,
  },
  paper: {
    borderRadius: 0,
  },
  profile_picture: {
    height: 128,
    width: 128,
  },
  content: {
    height: "100%",
  },
  flexGrowContainer: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
  },
});

const ProfileForm = (
  props: PageProps<
    keyof ReturnType<typeof ProfileModel>["fields"],
    CrudFormProps
  >,
) => {
  const { t } = useTranslation("profile");
  const classes = useStyles();
  const tab = useRoutedTabPanel();
  const theme = useTheme();
  const model = useProfileModel();
  const loginsModel = useProfileLoginsModel();
  const { mutateAsync: deleteSessions } = useModelDeleteMultiple(loginsModel);
  const activityModel = useProfileActivityModel();
  const [pushDialog] = useDialogContext();
  const { mutateAsync: deleteProfile } = useModelDelete(model);
  const email = (props.values!.email as string) ?? "";
  const [deleteRequested, setDeleteRequested] = useState(false);
  const authCtx = useAuthProviderContext();

  const openResetPasswordDialog = useCallback(
    () => pushDialog(<ResetPasswordDialog />),
    [pushDialog],
  );

  const enrollMFA = useCallback(
    () => pushDialog(<EnrollTotpDialog />),
    [pushDialog],
  );

  const unrollMFA = useCallback(
    () => pushDialog(<UnrollTotpDialog />),
    [pushDialog],
  );

  const deleteUserAccount = useCallback(async () => {
    try {
      await showInputDialog(pushDialog, {
        title: t("tabs.account.dialogs.close-confirm.title"),
        message: (
          <Typography color={"error"}>
            {t("tabs.account.dialogs.close-confirm.message")}
          </Typography>
        ),
        textButtonYes: t("tabs.account.dialogs.close-confirm.yes"),
        textButtonNo: t("tabs.account.dialogs.close-confirm.no"),
        textFieldLabel: t(
          "tabs.account.dialogs.close-confirm.text-field-label",
        ),
        textFieldPlaceholder: t(
          "tabs.account.dialogs.close-confirm.text-field-placeholder",
        ),
        textFieldValidator: (value) => value === email,
      });
    } catch (_e) {
      // cancelled
      return;
    }
    setDeleteRequested(true);
  }, [email, pushDialog, t]);

  const deleteAllSessions = useCallback(async () => {
    // technically while(true), but don't want this to run forever
    for (let i = 0; i < 10; ++i) {
      const [sessions] = await loginsModel.index({
        page: 1,
        rows: 100,
      });
      const sessionsToDelete = sessions
        .filter((session) => !(session.current as boolean))
        .map((session) => session.id as string);
      if (sessionsToDelete.length === 0) return;
      await deleteSessions(sessionsToDelete);
    }
    throw new Error("Delete all sessions failed (too many iterations)");
  }, [deleteSessions, loginsModel]);

  useEffect(() => {
    const profileId = props.id; // should be "singleton" always
    if (!deleteRequested || props.dirty || !profileId) return;
    setDeleteRequested(false);
    (async () => {
      try {
        await deleteProfile(profileId);
      } catch (err) {
        console.error("Fail deleting user", err);
        return showErrorDialog(pushDialog, {
          title: t("tabs.account.dialogs.close-error.title"),
          message: (err as Error).message,
        });
      }
      AccountManager.forgetAccount(authCtx.id);
      await destroySession();
      redirectToLogin(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteRequested, props.dirty]);

  return (
    <Grid
      container
      direction={"column"}
      className={classes.root}
      wrap={"nowrap"}
    >
      <Grid item>
        <Paper className={classes.paper}>
          <Box pt={2}>
            <Grid container>
              <Grid
                item
                xs={12}
                container
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Grid item>
                  <div className={classes.profile_picture}>
                    <ProfilePicture />
                  </div>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant={"h1"} align={"center"}>
                  {props.values!.first_name} {props.values!.last_name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <RoutedTabs centered>
                  <Tab value={""} label={t("tabs.account.title")} />
                  <Tab value={"apps"} label={t("tabs.apps.title")} />
                  <Tab value={"logins"} label={t("tabs.logins.title")} />
                  <Tab value={"activity"} label={t("tabs.activity.title")} />
                </RoutedTabs>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs container direction={"column"}>
        <Box p={2} className={classes.flexGrowContainer}>
          <Paper className={classes.flexGrowContainer}>
            <RoutedTabPanelWrapper>
              {tab(
                "apps",
                <Box p={2} className={classes.content}>
                  <AppsList confirmEmail={email} />
                </Box>,
              )}
              {tab(
                "logins",
                <ImCrud
                  model={loginsModel}
                  key={"logins"}
                  gridProps={{
                    additionalNewButtons: [
                      {
                        icon: <KeyboardArrowRight />,
                        label: t("tabs.logins.buttons.delete-all") ?? "",
                        onClick: deleteAllSessions,
                      },
                    ],
                  }}
                  disableGridWrapper
                  disableRouting
                  readPermission={null}
                  editPermission={false}
                  newPermission={false}
                  exportPermission={false}
                  deletePermission={null}
                >
                  {undefined}
                </ImCrud>,
              )}
              {tab(
                "activity",
                <ImCrud
                  model={activityModel}
                  key={"activity"}
                  disableGridWrapper
                  disableRouting
                  readPermission={null}
                  editPermission={false}
                  newPermission={false}
                  exportPermission={false}
                  deletePermission={false}
                >
                  {undefined}
                </ImCrud>,
              )}
              {tab(
                "",

                <Box p={2} className={classes.content}>
                  <EditOnlyFormPage {...props} customProps={undefined}>
                    <Grid
                      container
                      spacing={2}
                      justifyContent={"space-between"}
                    >
                      <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <FormField name={"last_name"} />
                          </Grid>
                          <Grid item xs={12}>
                            <FormField name={"first_name"} />
                          </Grid>
                          <Grid item xs={12}>
                            <FormField name={"email"} />
                          </Grid>
                          <Grid item xs={12}>
                            <FormField name={"mobile"} />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <ActionButton
                              icon={<KeyboardArrowRight />}
                              backgroundColor={theme.palette.action.disabled}
                              onClick={openResetPasswordDialog}
                            >
                              {t("tabs.account.buttons.reset-password")}
                            </ActionButton>
                          </Grid>
                          <Grid item xs={12}>
                            <ActionButton
                              icon={<KeyboardArrowRight />}
                              backgroundColor={theme.palette.action.disabled}
                              onClick={
                                props.values!.otp_enabled
                                  ? unrollMFA
                                  : enrollMFA
                              }
                            >
                              {props.values!.otp_enabled
                                ? t("tabs.account.buttons.disable-mfa")
                                : t("tabs.account.buttons.enable-mfa")}
                            </ActionButton>
                          </Grid>
                          <Grid item xs={12} />
                          <Grid item xs={12} />
                          <Grid item xs={12}>
                            <ActionButton
                              icon={<KeyboardArrowRight />}
                              backgroundColor={theme.palette.error.main}
                              onClick={deleteUserAccount}
                            >
                              {t("tabs.account.buttons.delete-account")}
                            </ActionButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </EditOnlyFormPage>
                </Box>,
              )}
            </RoutedTabPanelWrapper>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
};

export default React.memo(ProfileForm);
