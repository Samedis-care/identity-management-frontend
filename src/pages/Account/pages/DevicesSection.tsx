import React, { useCallback, useMemo } from "react";
import { Grid, styled, Typography } from "@mui/material";
import { Logout } from "@mui/icons-material";
import {
  ActionButton,
  GroupBox,
  InfoBox,
  showConfirmDialog,
  useDialogContext,
} from "components-care";
import useCCTranslations from "components-care/dist/utils/useCCTranslations";
import { useTranslation } from "react-i18next";
import ImCrud from "../../../components-care/ImCrud";
import {
  ProfileActivityModelToRowLabel,
  useProfileActivityModel,
} from "../../../components-care/models/ProfileActivityModel";
import {
  ProfileLoginsModelToRowLabel,
  useProfileLoginsModel,
} from "../../../components-care/models/ProfileLoginsModel";
import AccountPage from "../components/AccountPage";
import GridBox from "../components/GridBox";
import SectionBody from "../components/SectionBody";
import SectionButtons from "../components/SectionButtons";
import SectionCell from "../components/SectionCell";
import SignOutOthersDialog from "../dialogs/SignOutOthersDialog";

const InfoList = styled("ul")(({ theme }) => ({
  margin: 0,
  paddingLeft: theme.spacing(2.5),
}));

const CurrentSessionWarning = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const DevicesSection = () => {
  const { t } = useTranslation("account");
  const { t: ccT } = useCCTranslations();
  const [pushDialog] = useDialogContext();
  const loginsModel = useProfileLoginsModel();
  const activityModel = useProfileActivityModel();

  // the grid has no per-row guard, so the user can select the session they are
  // sitting in; warn before that logs them out rather than blocking it
  const confirmDeleteSessions = useCallback(
    async (invert: boolean, ids: string[]) => {
      const [sessions] = await loginsModel.index({ page: 1, rows: 100 });
      const currentId = sessions.find((session) => session.current)?.id;
      const deletesCurrent = !!currentId && ids.includes(currentId) !== invert;
      const message = ccT(
        "backend-components.data-grid.delete.confirm-dialog." +
          (invert ? "messageInverted" : "message"),
        { NUM: ids.length },
      );
      await showConfirmDialog(pushDialog, {
        title: ccT("backend-components.data-grid.delete.confirm-dialog.title"),
        message: deletesCurrent ? (
          <>
            {message}
            <CurrentSessionWarning color={"error"}>
              {t("devices.sessions.delete-current")}
            </CurrentSessionWarning>
          </>
        ) : (
          message
        ),
        textButtonYes: ccT(
          "backend-components.data-grid.delete.confirm-dialog.buttons.yes",
        ),
        textButtonNo: ccT(
          "backend-components.data-grid.delete.confirm-dialog.buttons.no",
        ),
      });
    },
    [ccT, loginsModel, pushDialog, t],
  );
  const sessionsGridProps = useMemo(
    () => ({ customDeleteConfirm: confirmDeleteSessions }),
    [confirmDeleteSessions],
  );
  const signOutOthers = useCallback(() => {
    pushDialog(<SignOutOthersDialog />);
  }, [pushDialog]);

  return (
    <AccountPage title={t("devices.title")}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <InfoBox
            status={"info"}
            heading={t("devices.info-heading")}
            message={
              <InfoList>
                <li>{t("devices.sessions.text")}</li>
                <li>{t("devices.history.text")}</li>
              </InfoList>
            }
            expanded
          />
        </Grid>
        <SectionCell md={12}>
          <GroupBox label={t("devices.sessions.title")}>
            <SectionBody>
              <GridBox height={440}>
                <ImCrud
                  storageKey={"account-sessions"}
                  model={loginsModel}
                  getRowLabel={ProfileLoginsModelToRowLabel}
                  gridProps={sessionsGridProps}
                  disableGridWrapper
                  disableRouting
                  readPermission={null}
                  editPermission={false}
                  newPermission={false}
                  exportPermission={false}
                  deletePermission={null}
                >
                  {undefined}
                </ImCrud>
              </GridBox>
              <SectionButtons>
                <ActionButton
                  fullWidth={false}
                  color={"error"}
                  icon={<Logout />}
                  onClick={signOutOthers}
                >
                  {t("devices.sessions.sign-out-others")}
                </ActionButton>
              </SectionButtons>
            </SectionBody>
          </GroupBox>
        </SectionCell>
        <SectionCell md={12}>
          <GroupBox label={t("devices.history.title")}>
            <SectionBody>
              <GridBox height={400}>
                <ImCrud
                  storageKey={"account-activity"}
                  model={activityModel}
                  getRowLabel={ProfileActivityModelToRowLabel}
                  disableGridWrapper
                  disableRouting
                  readPermission={null}
                  editPermission={false}
                  newPermission={false}
                  exportPermission={false}
                  deletePermission={false}
                >
                  {undefined}
                </ImCrud>
              </GridBox>
            </SectionBody>
          </GroupBox>
        </SectionCell>
      </Grid>
    </AccountPage>
  );
};

export default React.memo(DevicesSection);
