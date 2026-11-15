/*
 * Dialog frame of the account pages, built like the samedis.care dialogs:
 * components-care DialogTitle with close button, standard fields, the buttons
 * bottom left in their own grid cells (ActionButton, then BackActionButton),
 * no DialogActions bar.
 */
import React from "react";
import { Dialog, DialogContent, Grid } from "@mui/material";
import { ActionButton, BackActionButton, DialogTitle } from "components-care";
import { useTranslation } from "react-i18next";
import { ErrorInfo } from "./Section";

export interface AccountDialogProps {
  title: string;
  onClose: () => void;
  /** submit handler, the Enter key in a field submits the form */
  onSubmit?: () => void;
  children: React.ReactNode;
}

const AccountDialog = (props: AccountDialogProps) => {
  const { title, onClose, onSubmit, children } = props;
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={"sm"}
      fullWidth
      aria-labelledby={"account-dialog-title"}
    >
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          onSubmit?.();
        }}
      >
        <DialogTitle id={"account-dialog-title"} onClose={onClose}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {children}
          </Grid>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default React.memo(AccountDialog);

/** full-width row of the dialog grid */
export const Full = (props: { children: React.ReactNode }) => (
  <Grid size={12}>{props.children}</Grid>
);

/** error of the last submit, shown above the buttons */
export const DialogError = (props: { error: string | null }) =>
  props.error ? (
    <Full>
      <ErrorInfo message={props.error} />
    </Full>
  ) : null;

export interface DialogButtonsProps {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  busy?: boolean;
  color?: "error";
  onCancel: () => void;
}

/** submit button + cancel, each in its own cell, bottom left */
export const DialogButtons = (props: DialogButtonsProps) => {
  const { t } = useTranslation("account");
  return (
    <>
      <Grid>
        <ActionButton
          type={"submit"}
          icon={props.icon}
          disabled={props.disabled || props.busy}
          color={props.color}
        >
          {props.label}
        </ActionButton>
      </Grid>
      <Grid>
        <BackActionButton onClick={props.onCancel} disabled={props.busy}>
          {t("common.cancel")}
        </BackActionButton>
      </Grid>
    </>
  );
};
