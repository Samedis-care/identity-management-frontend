import React, { useRef, useState } from "react";
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
  /** shown below the field while the typed address doesn't match */
  invalidText: string;
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
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const valid = value.trim().toLowerCase() === props.email.toLowerCase();
  const showInvalid = touched && value.trim() !== "" && !valid;

  const submit = async () => {
    if (!valid) {
      setTouched(true);
      inputRef.current?.focus();
      return;
    }
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
          onBlur={() => setTouched(true)}
          inputRef={inputRef}
          error={showInvalid}
          helperText={showInvalid ? props.invalidText : undefined}
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
