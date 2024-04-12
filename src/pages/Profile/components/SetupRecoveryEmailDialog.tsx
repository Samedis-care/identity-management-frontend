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
  validateEmailRaw,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";

export interface SetupRecoveryEmailDialogState {
  recovery_email: string;
}

const SetupRecoveryEmailDialog = () => {
  const [pushDialog, popDialog] = useDialogContext();
  const model = useProfileModel();
  const { mutateAsync: updateProfile } = useModelMutation(model);
  const { t } = useTranslation("profile");
  const [state, setState] = useState<SetupRecoveryEmailDialogState>({
    recovery_email: "",
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

      if (!validateEmailRaw(state.recovery_email)) {
        showInfoDialog(pushDialog, {
          title: t(
            "tabs.account.dialogs.setup-recovery-email.result.invalid-email.title",
          ),
          message: t(
            "tabs.account.dialogs.setup-recovery-email.result.invalid-email.message",
          ),
        });
        return;
      }
      try {
        await updateProfile({
          id: "singleton",
          recovery_email: state.recovery_email,
        });
        popDialog();
        showInfoDialog(pushDialog, {
          title: t(
            "tabs.account.dialogs.setup-recovery-email.result.success.title",
          ),
          message: t(
            "tabs.account.dialogs.setup-recovery-email.result.success.message",
          ),
        });
      } catch (e) {
        showInfoDialog(pushDialog, {
          title: t(
            "tabs.account.dialogs.setup-recovery-email.result.error-backend.title",
          ),
          message: (e as Error).message,
        });
      }
    },
    [popDialog, pushDialog, state, t, updateProfile],
  );

  return (
    <Dialog open>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {t("tabs.account.dialogs.setup-recovery-email.title")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextFieldWithHelp
                value={state.recovery_email}
                name={"recovery_email"}
                onChange={handleChange}
                type={"email"}
                label={t(
                  "tabs.account.dialogs.setup-recovery-email.fields.recovery_email",
                )}
                autoFocus
                fullWidth
                variant={"standard"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color={"secondary"} onClick={handleSubmit} type={"submit"}>
            {t("tabs.account.dialogs.setup-recovery-email.actions.save")}
          </Button>
          <Button onClick={popDialog}>
            {t("tabs.account.dialogs.setup-recovery-email.actions.cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default React.memo(SetupRecoveryEmailDialog);
