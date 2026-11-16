/*
 * Dialog frame of the account pages (also used by the admin user form), built
 * like the samedis.care dialogs: components-care FullFormDialog with title and
 * close button, standard fields, the buttons bottom left in their own grid
 * cells (ActionButton, then BackActionButton). Open it with pushDialog.
 */
import React, { useCallback } from "react";
import { Grid } from "@mui/material";
import { FullFormDialog } from "components-care";

export interface AccountDialogProps {
  title: string;
  /** submit handler, the Enter key in a field submits the form */
  onSubmit?: () => void;
  /** the cells of the dialog grid: DialogRow, DialogError, DialogButtons */
  children: React.ReactNode;
}

const AccountDialog = (props: AccountDialogProps) => {
  const { title, onSubmit, children } = props;
  const handleSubmit = useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();
      onSubmit?.();
    },
    [onSubmit],
  );
  return (
    <FullFormDialog dialogTitle={title} maxWidth={"sm"}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </form>
    </FullFormDialog>
  );
};

export default React.memo(AccountDialog);
