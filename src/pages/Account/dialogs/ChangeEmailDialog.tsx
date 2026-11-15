import React, { useState } from "react";
import { Send } from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  TextFieldWithHelp,
  useCloseThisDialog,
  useModelMutation,
  validateEmailRaw,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountDialog, {
  DialogButtons,
  DialogError,
  Full,
} from "../components/AccountDialog";
import { readOnly } from "../components/Section";

export interface ChangeEmailDialogProps {
  /** login: the sign-in address (email), recovery: the recovery address */
  kind: "login" | "recovery";
  /** the address in use now, if any */
  current: string | null;
}

/**
 * Sets a new sign-in or recovery address. The backend keeps it unconfirmed and
 * mails a confirmation link; the page shows it as pending until then.
 */
const ChangeEmailDialog = (props: ChangeEmailDialogProps) => {
  const { kind, current } = props;
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const model = useProfileModel();
  const { mutateAsync: updateProfile } = useModelMutation(model);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = kind === "login";
  const valid = validateEmailRaw(email.trim());
  const invalid = !!email && !valid;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile(
        login
          ? { id: "singleton", email: email.trim() }
          : { id: "singleton", recovery_email: email.trim() },
      );
      await model.invalidateCacheForId("singleton");
      close();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <AccountDialog
      title={t(
        login
          ? "dialogs.email.title-login"
          : current
            ? "dialogs.email.title-recovery"
            : "dialogs.email.title-recovery-new",
      )}
      onClose={close}
      onSubmit={submit}
    >
      {current && (
        <Full>
          <TextFieldWithHelp
            label={t("dialogs.email.current")}
            value={current}
            slotProps={readOnly}
            disableClearable
            fullWidth
          />
        </Full>
      )}
      <Full>
        <TextFieldWithHelp
          label={t("dialogs.email.new")}
          type={"email"}
          autoComplete={"email"}
          value={email}
          onChange={(evt) => setEmail(evt.target.value)}
          error={invalid}
          helperText={invalid ? t("dialogs.email.invalid") : " "}
          autoFocus
          fullWidth
        />
      </Full>
      <Full>
        <Typography>
          {t(
            login ? "dialogs.email.text-login" : "dialogs.email.text-recovery",
          )}
        </Typography>
      </Full>
      <DialogError error={error} />
      <DialogButtons
        label={t("dialogs.email.submit")}
        icon={<Send />}
        disabled={!valid}
        busy={busy}
        onCancel={close}
      />
    </AccountDialog>
  );
};

export default React.memo(ChangeEmailDialog);
