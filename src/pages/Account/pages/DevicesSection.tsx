import React, { useCallback } from "react";
import { Alert, Box, Grid, Typography } from "@mui/material";
import { Logout } from "@mui/icons-material";
import {
  ActionButton,
  GroupBox,
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
import { BoxBody, Buttons, Cell, GridBox } from "../components/Section";
import SignOutOthersDialog from "../dialogs/SignOutOthersDialog";

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
            <Typography color={"error"} sx={{ mt: 1 }}>
              {t("devices.sessions.delete-current")}
            </Typography>
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

  return (
    <AccountPage title={t("devices.title")}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Alert severity={"info"}>
            <Box component={"ul"} sx={{ m: 0, pl: 2.5 }}>
              <li>{t("devices.sessions.text")}</li>
              <li>{t("devices.history.text")}</li>
            </Box>
          </Alert>
        </Grid>
        <Cell md={12}>
          <GroupBox label={t("devices.sessions.title")}>
            <BoxBody>
              <GridBox height={440}>
                <ImCrud
                  storageKey={"account-sessions"}
                  model={loginsModel}
                  getRowLabel={ProfileLoginsModelToRowLabel}
                  gridProps={{ customDeleteConfirm: confirmDeleteSessions }}
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
              <Buttons>
                <ActionButton
                  fullWidth={false}
                  color={"error"}
                  icon={<Logout />}
                  onClick={() => pushDialog(<SignOutOthersDialog />)}
                >
                  {t("devices.sessions.sign-out-others")}
                </ActionButton>
              </Buttons>
            </BoxBody>
          </GroupBox>
        </Cell>
        <Cell md={12}>
          <GroupBox label={t("devices.history.title")}>
            <BoxBody>
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
            </BoxBody>
          </GroupBox>
        </Cell>
      </Grid>
    </AccountPage>
  );
};

export default React.memo(DevicesSection);
