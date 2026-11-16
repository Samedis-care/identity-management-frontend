import React, { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  InfoBox,
  TextFieldWithHelp,
  useCloseThisDialog,
} from "components-care";
import AccountDialog from "../components/AccountDialog";
import DialogButtons from "../components/DialogButtons";
import DialogError from "../components/DialogError";
import DialogRow from "../components/DialogRow";

export interface ConfirmByEmailDialogProps {
  title: string;
  heading: string;
  text: string;
  confirmLabel: string;
  /** shown below the field while the typed address doesn't match */
  invalidText: string;
  submitLabel: string;
  submitIcon: React.ReactNode;
  /** the user's sign-in address, which has to be typed to confirm; empty never matches */
  email: string;
  /** runs the destructive action; a thrown error is shown in the dialog */
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation for destructive actions (delete account, remove an app): the
 * user types their sign-in address before the red button unlocks.
 */
const ConfirmByEmailDialog = (props: ConfirmByEmailDialogProps) => {
  const { email, onConfirm } = props;
  const close = useCloseThisDialog();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: onConfirm,
  });
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // an address that isn't known yet must not let an empty field through
  const valid = !!email && value.trim().toLowerCase() === email.toLowerCase();
  const showInvalid = touched && value.trim() !== "" && !valid;

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setValue(evt.target.value),
    [],
  );
  const handleBlur = useCallback(() => setTouched(true), []);
  const submit = useCallback(async () => {
    if (!valid) {
      setTouched(true);
      inputRef.current?.focus();
      return;
    }
    try {
      await mutateAsync();
    } catch {
      // shown through the mutation's error
      return;
    }
    close();
  }, [close, mutateAsync, valid]);

  return (
    <AccountDialog title={props.title} onSubmit={submit}>
      <DialogRow>
        <InfoBox
          status={"error"}
          heading={props.heading}
          message={props.text}
          expanded
        />
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          label={props.confirmLabel}
          placeholder={email}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={inputRef}
          error={showInvalid}
          helperText={showInvalid ? props.invalidText : undefined}
          autoComplete={"off"}
          autoFocus
          fullWidth
        />
      </DialogRow>
      <DialogError message={error?.message} />
      <DialogButtons
        label={props.submitLabel}
        icon={props.submitIcon}
        color={"error"}
        disabled={!valid}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(ConfirmByEmailDialog);
