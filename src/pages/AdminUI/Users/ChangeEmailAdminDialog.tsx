import React, { useCallback, useState } from "react";
import {
  Alert,
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
  useCloseThisDialog,
  validateEmail,
} from "components-care";
import { useUserModel } from "../../../components-care/models/UserModel";
import { useTranslation } from "react-i18next";

export interface ChangeEmailAdminDialogProps {
  userId: string;
  /** current account address, shown in the info text */
  currentEmail: string;
  /** called after the address was changed, e.g. to reload the form */
  onChanged?: () => void;
}

/**
 * Support case: a global admin changes the account (sign-in) address of a
 * user, e.g. when the user lost access to the old mailbox. The backend takes
 * the new address at once, without a confirmation mail, so it has its own
 * dialog with the address entered twice instead of an editable form field.
 */
const ChangeEmailAdminDialog = (props: ChangeEmailAdminDialogProps) => {
  const { userId, currentEmail, onChanged } = props;
  const [pushDialog] = useDialogContext();
  const closeThisDialog = useCloseThisDialog();
  const model = useUserModel();
  const { mutateAsync: updateUser } = useModelMutation(model);
  const { t } = useTranslation("users");
  const [state, setState] = useState({ email: "", email_confirm: "" });
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
      const email = state.email.trim();
      const invalid = validateEmail(
        email,
        {},
        { getLabel: () => t("form.dialogs.change_email.email") },
      );
      if (!email || invalid) {
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.change_email.errors.validation.title"),
          message: t("form.dialogs.change_email.errors.invalid.message"),
        });
        return;
      }
      if (email !== state.email_confirm.trim()) {
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.change_email.errors.validation.title"),
          message: t("form.dialogs.change_email.errors.mismatch.message"),
        });
        return;
      }
      try {
        await updateUser({ id: userId, email });
        closeThisDialog();
        onChanged?.();
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.change_email.errors.none.title"),
          message: t("form.dialogs.change_email.errors.none.message", {
            EMAIL: email,
          }),
        });
      } catch (e) {
        showInfoDialog(pushDialog, {
          title: t("form.dialogs.change_email.errors.backend.title"),
          message: (e as Error).message,
        });
      }
    },
    [closeThisDialog, onChanged, pushDialog, state, t, updateUser, userId],
  );

  return (
    <Dialog open maxWidth={"sm"} fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("form.dialogs.change_email.title")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Alert severity={"warning"}>
                {t("form.dialogs.change_email.info", { EMAIL: currentEmail })}
              </Alert>
            </Grid>
            <Grid size={12}>
              <TextFieldWithHelp
                value={state.email}
                name={"email"}
                onChange={handleChange}
                type={"email"}
                label={t("form.dialogs.change_email.email")}
                autoFocus
                fullWidth
                variant={"standard"}
              />
            </Grid>
            <Grid size={12}>
              <TextFieldWithHelp
                value={state.email_confirm}
                name={"email_confirm"}
                onChange={handleChange}
                type={"email"}
                label={t("form.dialogs.change_email.email_confirm")}
                fullWidth
                variant={"standard"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color={"secondary"} onClick={handleSubmit} type={"submit"}>
            {t("form.dialogs.change_email.change")}
          </Button>
          <Button onClick={closeThisDialog}>
            {t("form.dialogs.change_email.cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default React.memo(ChangeEmailAdminDialog);
