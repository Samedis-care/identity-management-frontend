import React, { useCallback, useState } from "react";
import { KeyOutlined } from "@mui/icons-material";
import {
  InfoBox,
  showInfoDialog,
  TextFieldWithHelp,
  useCloseThisDialog,
  useDialogContext,
  useModelMutation,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountDialog from "../components/AccountDialog";
import DialogButtons from "../components/DialogButtons";
import DialogError from "../components/DialogError";
import DialogRow from "../components/DialogRow";

// IMB config.password_length = 8..128
const MIN_LENGTH = 8;

interface PasswordFields {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const EMPTY_FIELDS: PasswordFields = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

/** changes the password; the backend signs out every other session */
const ChangePasswordDialog = () => {
  const { t } = useTranslation("account");
  const [pushDialog] = useDialogContext();
  const close = useCloseThisDialog();
  const model = useProfileModel();
  const { mutateAsync, isPending, error } = useModelMutation(model);
  const [fields, setFields] = useState<PasswordFields>(EMPTY_FIELDS);
  const { current_password, password, password_confirmation } = fields;
  const mismatch =
    !!password_confirmation && password !== password_confirmation;
  const valid =
    !!current_password &&
    password.length >= MIN_LENGTH &&
    password === password_confirmation;

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
      await mutateAsync({ id: "singleton", ...fields });
    } catch {
      // shown through the mutation's error
      return;
    }
    close();
    void showInfoDialog(pushDialog, {
      title: t("dialogs.password.success-title"),
      message: t("dialogs.password.success"),
    });
  }, [close, fields, mutateAsync, pushDialog, t, valid]);

  return (
    <AccountDialog title={t("dialogs.password.title")} onSubmit={submit}>
      <DialogRow>
        <TextFieldWithHelp
          name={"current_password"}
          label={t("dialogs.password.current")}
          type={"password"}
          autoComplete={"current-password"}
          value={current_password}
          onChange={handleChange}
          autoFocus
          fullWidth
        />
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          name={"password"}
          label={t("dialogs.password.new")}
          type={"password"}
          autoComplete={"new-password"}
          value={password}
          onChange={handleChange}
          helperText={t("dialogs.password.new-help")}
          fullWidth
        />
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          name={"password_confirmation"}
          label={t("dialogs.password.repeat")}
          type={"password"}
          autoComplete={"new-password"}
          value={password_confirmation}
          onChange={handleChange}
          error={mismatch}
          helperText={mismatch ? t("dialogs.password.mismatch") : " "}
          fullWidth
        />
      </DialogRow>
      <DialogRow>
        <InfoBox
          status={"info"}
          heading={t("dialogs.password.info-heading")}
          message={t("dialogs.password.info")}
          expanded
        />
      </DialogRow>
      <DialogError message={error?.message} />
      <DialogButtons
        label={t("dialogs.password.submit")}
        icon={<KeyOutlined />}
        disabled={!valid}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(ChangePasswordDialog);
