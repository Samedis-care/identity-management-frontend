import React, { useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import {
  showInfoDialog,
  TextFieldWithHelp,
  useDialogContext,
  useModelMutation,
} from "components-care";
import { useUserModel } from "../../../components-care/models/UserModel";
import { useTranslation } from "react-i18next";

export interface ResetPasswordAdminDialogProps {
  userId: string;
}

export interface ResetPasswordAdminDialogState {
  password: string;
  password_confirm: string;
}

const ResetPasswordAdminDialog = (props: ResetPasswordAdminDialogProps) => {
  const { userId } = props;
  const [pushDialog, popDialog] = useDialogContext();
  const model = useUserModel(undefined, undefined, true);
  const { mutateAsync: updateUser } = useModelMutation(model);
  const { t } = useTranslation("users");
  const [state, setState] = useState<ResetPasswordAdminDialogState>({
    password: "",
    password_confirm: "",
  });
  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({
        ...prev,
        [evt.target.name]: evt.target.value,
      }));
    },
    [],
  );
  const handleSubmit = useCallback(
    async (evt: React.MouseEvent | React.FormEvent) => {
      evt.preventDefault();

      if (state.password !== state.password_confirm) {
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.reset_pwd.errors.password_mismatch.title"),
          message: t("form.dialogs.reset_pwd.errors.password_mismatch.message"),
        });
        return;
      }
      try {
        await updateUser({
          id: userId,
          set_password: state.password,
        });
        popDialog();
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.reset_pwd.errors.none.title"),
          message: t("form.dialogs.reset_pwd.errors.none.message"),
        });
      } catch (e) {
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.reset_pwd.errors.backend.title"),
          message: (e as Error).message,
        });
      }
    },
    [popDialog, pushDialog, state, t, updateUser, userId],
  );

  return (
    <Dialog open>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("form.dialogs.reset_pwd.title")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextFieldWithHelp
                value={state.password}
                name={"password"}
                onChange={handleChange}
                type={"password"}
                label={t("form.dialogs.reset_pwd.password")}
                autoFocus
                fullWidth
                variant={"standard"}
              />
            </Grid>
            <Grid size={12}>
              <TextFieldWithHelp
                value={state.password_confirm}
                name={"password_confirm"}
                onChange={handleChange}
                type={"password"}
                label={t("form.dialogs.reset_pwd.password_confirm")}
                fullWidth
                variant={"standard"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color={"secondary"} onClick={handleSubmit} type={"submit"}>
            {t("form.dialogs.reset_pwd.reset")}
          </Button>
          <Button onClick={popDialog}>
            {t("form.dialogs.reset_pwd.cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default React.memo(ResetPasswordAdminDialog);
