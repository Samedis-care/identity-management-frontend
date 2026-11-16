import React, { useCallback, useState } from "react";
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
import AccountDialog from "../components/AccountDialog";
import DialogButtons from "../components/DialogButtons";
import DialogError from "../components/DialogError";
import DialogRow from "../components/DialogRow";
import { READ_ONLY_SLOT_PROPS } from "../constants";

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
  const { mutateAsync, isPending, error } = useModelMutation(model);
  const [email, setEmail] = useState("");
  const login = kind === "login";
  const valid = validateEmailRaw(email.trim());
  const invalid = !!email && !valid;

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setEmail(evt.target.value),
    [],
  );
  const submit = useCallback(async () => {
    if (!valid) return;
    const address = email.trim();
    try {
      await mutateAsync(
        login
          ? { id: "singleton", email: address }
          : { id: "singleton", recovery_email: address },
      );
    } catch {
      // shown through the mutation's error
      return;
    }
    await model.invalidateCacheForId("singleton");
    close();
  }, [close, email, login, model, mutateAsync, valid]);

  return (
    <AccountDialog
      title={t(
        login
          ? "dialogs.email.title-login"
          : current
            ? "dialogs.email.title-recovery"
            : "dialogs.email.title-recovery-new",
      )}
      onSubmit={submit}
    >
      {current && (
        <DialogRow>
          <TextFieldWithHelp
            label={t("dialogs.email.current")}
            value={current}
            slotProps={READ_ONLY_SLOT_PROPS}
            disableClearable
            fullWidth
          />
        </DialogRow>
      )}
      <DialogRow>
        <TextFieldWithHelp
          label={t("dialogs.email.new")}
          type={"email"}
          autoComplete={"email"}
          value={email}
          onChange={handleChange}
          error={invalid}
          helperText={invalid ? t("dialogs.email.invalid") : " "}
          autoFocus
          fullWidth
        />
      </DialogRow>
      <DialogRow>
        <Typography>
          {t(
            login ? "dialogs.email.text-login" : "dialogs.email.text-recovery",
          )}
        </Typography>
      </DialogRow>
      <DialogError message={error?.message} />
      <DialogButtons
        label={t("dialogs.email.submit")}
        icon={<Send />}
        disabled={!valid}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(ChangeEmailDialog);
