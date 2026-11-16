import React from "react";
import DialogRow from "./DialogRow";
import ErrorInfo from "./ErrorInfo";

export interface DialogErrorProps {
  /** why the last submit failed, nothing is shown without it */
  message: string | null | undefined;
}

/** error of the last submit in an AccountDialog, shown above the buttons */
const DialogError = (props: DialogErrorProps) =>
  props.message ? (
    <DialogRow>
      <ErrorInfo message={props.message} />
    </DialogRow>
  ) : null;

export default React.memo(DialogError);
