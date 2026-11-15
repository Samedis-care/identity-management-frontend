import React, { useState } from "react";
import {
  InfoBox,
  TextFieldWithHelp,
  useCloseThisDialog,
} from "components-care";
import AccountDialog, {
  DialogButtons,
  DialogError,
  Full,
} from "../components/AccountDialog";

export interface ConfirmByEmailDialogProps {
  title: string;
  heading: string;
  text: string;
  confirmLabel: string;
  submitLabel: string;
  submitIcon: React.ReactNode;
  /** the user's sign-in address, which has to be typed to confirm */
  email: string;
  /** runs the destructive action; a thrown error is shown in the dialog */
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation for destructive actions (delete account, remove an app): the
 * user types their sign-in address before the red button unlocks.
 */
const ConfirmByEmailDialog = (props: ConfirmByEmailDialogProps) => {
  const close = useCloseThisDialog();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = value.trim().toLowerCase() === props.email.toLowerCase();

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await props.onConfirm();
      close();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <AccountDialog title={props.title} onClose={close} onSubmit={submit}>
      <Full>
        <InfoBox
          status={"error"}
          heading={props.heading}
          message={props.text}
          expanded
        />
      </Full>
      <Full>
        <TextFieldWithHelp
          label={props.confirmLabel}
          placeholder={props.email}
          value={value}
          onChange={(evt) => setValue(evt.target.value)}
          autoComplete={"off"}
          autoFocus
          fullWidth
        />
      </Full>
      <DialogError error={error} />
      <DialogButtons
        label={props.submitLabel}
        icon={props.submitIcon}
        color={"error"}
        disabled={!valid}
        busy={busy}
        onCancel={close}
      />
    </AccountDialog>
  );
};

export default React.memo(ConfirmByEmailDialog);
