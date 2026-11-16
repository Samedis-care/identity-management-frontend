import React from "react";
import { Grid } from "@mui/material";
import {
  ActionButton,
  BackActionButton,
  useCloseThisDialog,
} from "components-care";
import { useTranslation } from "react-i18next";

export interface DialogButtonsProps {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** the submit is running: both buttons are disabled */
  busy?: boolean;
  color?: "error";
}

/** submit button + cancel of an AccountDialog, each in its own cell, bottom left */
const DialogButtons = (props: DialogButtonsProps) => {
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
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
        <BackActionButton onClick={close} disabled={props.busy}>
          {t("common.cancel")}
        </BackActionButton>
      </Grid>
    </>
  );
};

export default React.memo(DialogButtons);
