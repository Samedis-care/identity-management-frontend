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
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";

export interface ResetPasswordDialogState {
  current_password: string;
  password: string;
  password_confirm: string;
}

const ResetPasswordDialog = () => {
  const [pushDialog, popDialog] = useDialogContext();
  const model = useProfileModel();
  const { mutateAsync: updateProfile } = useModelMutation(model);
  const { t } = useTranslation("profile");
  const [state, setState] = useState<ResetPasswordDialogState>({
    current_password: "",
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
    []
  );
  const handleSubmit = useCallback(
    async (evt: React.MouseEvent | React.FormEvent) => {
      evt.preventDefault();

      if (!state.password) {
        showInfoDialog(pushDialog, {
          title: t(
            "tabs.account.dialogs.reset-password.result.error-password-empty.title"
          ),
          message: t(
            "tabs.account.dialogs.reset-password.result.error-password-empty.message"
          ),
        });
        return;
      }
      if (state.password !== state.password_confirm) {
        showInfoDialog(pushDialog, {
          title: t(
            "tabs.account.dialogs.reset-password.result.error-mismatch.title"
          ),
          message: t(
            "tabs.account.dialogs.reset-password.result.error-mismatch.message"
          ),
        });
        return;
      }
      try {
        await updateProfile({
          id: "singleton",
          current_password: state.current_password,
          password: state.password,
          password_confirmation: state.password_confirm,
        });
        popDialog();
        showInfoDialog(pushDialog, {
          title: t("tabs.account.dialogs.reset-password.result.success.title"),
          message: t(
            "tabs.account.dialogs.reset-password.result.success.message"
          ),
        });
      } catch (e) {
        showInfoDialog(pushDialog, {
          title: t(
            "tabs.account.dialogs.reset-password.result.error-backend.title"
          ),
          message: (e as Error).message,
        });
      }
    },
    [popDialog, pushDialog, state, t, updateProfile]
  );

  return (
    <Dialog open>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {t("tabs.account.dialogs.reset-password.title")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextFieldWithHelp
                value={state.current_password}
                name={"current_password"}
                onChange={handleChange}
                type={"password"}
                label={t(
                  "tabs.account.dialogs.reset-password.fields.current-password"
                )}
                autoFocus
                fullWidth
                variant={"standard"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextFieldWithHelp
                value={state.password}
                name={"password"}
                onChange={handleChange}
                type={"password"}
                label={t(
                  "tabs.account.dialogs.reset-password.fields.new-password"
                )}
                fullWidth
                variant={"standard"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextFieldWithHelp
                value={state.password_confirm}
                name={"password_confirm"}
                onChange={handleChange}
                type={"password"}
                label={t(
                  "tabs.account.dialogs.reset-password.fields.new-password-repeat"
                )}
                fullWidth
                variant={"standard"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color={"secondary"} onClick={handleSubmit} type={"submit"}>
            {t("tabs.account.dialogs.reset-password.actions.reset")}
          </Button>
          <Button onClick={popDialog}>
            {t("tabs.account.dialogs.reset-password.actions.cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default React.memo(ResetPasswordDialog);
