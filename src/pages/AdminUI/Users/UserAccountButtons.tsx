import React, { useCallback } from "react";
import { Grid } from "@mui/material";
import { EditOutlined, KeyOutlined } from "@mui/icons-material";
import {
  ActionButton,
  useDialogContext,
  useFormContextLite,
} from "components-care";
import { useTranslation } from "react-i18next";
import type { UserModelType } from "../../../components-care/models/UserModel";
import ChangeEmailAdminDialog from "./ChangeEmailAdminDialog";
import ResetPasswordAdminDialog from "./ResetPasswordAdminDialog";

export interface UserAccountButtonsProps {
  userId: string;
}

/** password and account address of an existing user, each through its own dialog */
const UserAccountButtons = (props: UserAccountButtonsProps) => {
  const { userId } = props;
  const { t } = useTranslation("users");
  const [pushDialog] = useDialogContext();
  const { getFieldValue, refetchForm } = useFormContextLite<UserModelType>();

  const openResetPasswordDialog = useCallback(() => {
    pushDialog(<ResetPasswordAdminDialog userId={userId} />);
  }, [pushDialog, userId]);
  const reloadForm = useCallback(() => void refetchForm(), [refetchForm]);
  const openChangeEmailDialog = useCallback(() => {
    pushDialog(
      <ChangeEmailAdminDialog
        userId={userId}
        currentEmail={getFieldValue("email")}
        onChanged={reloadForm}
      />,
    );
  }, [getFieldValue, pushDialog, reloadForm, userId]);

  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ActionButton icon={<KeyOutlined />} onClick={openResetPasswordDialog}>
          {t("form.dialogs.reset_pwd.open")}
        </ActionButton>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ActionButton icon={<EditOutlined />} onClick={openChangeEmailDialog}>
          {t("form.dialogs.change_email.open")}
        </ActionButton>
      </Grid>
    </>
  );
};

export default React.memo(UserAccountButtons);
