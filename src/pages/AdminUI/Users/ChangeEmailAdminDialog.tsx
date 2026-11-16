import React, { useCallback, useState } from "react";
import { Send } from "@mui/icons-material";
import {
  InfoBox,
  showInfoDialog,
  TextFieldWithHelp,
  useCloseThisDialog,
  useDialogContext,
  useModelMutation,
  validateEmailRaw,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useUserModel } from "../../../components-care/models/UserModel";
import AccountDialog from "../../Account/components/AccountDialog";
import DialogButtons from "../../Account/components/DialogButtons";
import DialogError from "../../Account/components/DialogError";
import DialogRow from "../../Account/components/DialogRow";

export interface ChangeEmailAdminDialogProps {
  userId: string;
  /** current account address, shown in the info text */
  currentEmail: string;
  /** called after the address was changed, e.g. to reload the form */
  onChanged?: () => void;
}

interface EmailFields {
  email: string;
  email_confirm: string;
}

const EMPTY_FIELDS: EmailFields = { email: "", email_confirm: "" };

/**
 * Support case: a global admin changes the account (sign-in) address of a
 * user, e.g. when the user lost access to the old mailbox. The backend takes
 * the new address at once, without a confirmation mail, so it has its own
 * dialog with the address entered twice instead of an editable form field.
 */
const ChangeEmailAdminDialog = (props: ChangeEmailAdminDialogProps) => {
  const { userId, currentEmail, onChanged } = props;
  const { t } = useTranslation("users");
  const [pushDialog] = useDialogContext();
  const close = useCloseThisDialog();
  const model = useUserModel();
  const { mutateAsync, isPending, error } = useModelMutation(model);
  const [fields, setFields] = useState<EmailFields>(EMPTY_FIELDS);
  const email = fields.email.trim();
  const confirm = fields.email_confirm.trim();
  const invalid = !!email && !validateEmailRaw(email);
  const mismatch = !!confirm && email !== confirm;
  const valid = !!email && !invalid && email === confirm;

  // the inputs are named after the fields
  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = evt.target;
      setFields((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );
  const submit = useCallback(async () => {
    if (!valid) return;
    try {
      await mutateAsync({ id: userId, email });
    } catch {
      // shown through the mutation's error
      return;
    }
    close();
    onChanged?.();
    void showInfoDialog(pushDialog, {
      title: t("form.dialogs.change_email.errors.none.title"),
      message: t("form.dialogs.change_email.errors.none.message", {
        EMAIL: email,
      }),
    });
  }, [close, email, mutateAsync, onChanged, pushDialog, t, userId, valid]);

  return (
    <AccountDialog
      title={t("form.dialogs.change_email.title")}
      onSubmit={submit}
    >
      <DialogRow>
        <InfoBox
          status={"warning"}
          heading={t("form.dialogs.change_email.info-heading")}
          message={t("form.dialogs.change_email.info", { EMAIL: currentEmail })}
          expanded
        />
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          name={"email"}
          value={fields.email}
          onChange={handleChange}
          type={"email"}
          label={t("form.dialogs.change_email.email")}
          error={invalid}
          helperText={
            invalid
              ? t("form.dialogs.change_email.errors.invalid.message")
              : " "
          }
          autoComplete={"off"}
          autoFocus
          fullWidth
        />
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          name={"email_confirm"}
          value={fields.email_confirm}
          onChange={handleChange}
          type={"email"}
          label={t("form.dialogs.change_email.email_confirm")}
          error={mismatch}
          helperText={
            mismatch
              ? t("form.dialogs.change_email.errors.mismatch.message")
              : " "
          }
          autoComplete={"off"}
          fullWidth
        />
      </DialogRow>
      <DialogError message={error?.message} />
      <DialogButtons
        label={t("form.dialogs.change_email.change")}
        icon={<Send />}
        disabled={!valid}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(ChangeEmailAdminDialog);
