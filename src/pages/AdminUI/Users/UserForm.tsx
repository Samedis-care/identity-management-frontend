import React, { useCallback } from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Button, Grid, TextField } from "@mui/material";
import {
  DefaultFormPage,
  FormField,
  useDialogContext,
  useFormContext,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { useTranslation } from "react-i18next";
import ResetPasswordAdminDialog from "./ResetPasswordAdminDialog";
import ChangeEmailAdminDialog from "./ChangeEmailAdminDialog";
import FormPagePaper from "../../../components/FormPagePaper";
import type { UserModelType } from "../../../components-care/models/UserModel";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  helperText?: string;
}

/** an address shown, not edited, styled like the other fields of the form */
const ReadOnlyField = (props: ReadOnlyFieldProps) => (
  <TextField
    variant={"standard"}
    fullWidth
    label={props.label}
    value={props.value}
    helperText={props.helperText}
    slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
  />
);

/**
 * Account and recovery address of an existing user: both read-only, the
 * account address is changed through ChangeEmailAdminDialog
 */
const AddressFields = () => {
  const { t } = useTranslation("users");
  const { values } = useFormContext<UserModelType>();
  const email = (values.email as string | null) ?? "";
  const recovery = (values.recovery_email as string | null) ?? "";
  const unconfirmed =
    (values.unconfirmed_recovery_email as string | null) ?? "";
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ReadOnlyField label={t("fields.email")} value={email} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ReadOnlyField
          label={t("fields.recovery_email")}
          value={recovery}
          helperText={
            unconfirmed
              ? t("form.recovery_email.unconfirmed", { EMAIL: unconfirmed })
              : recovery
                ? undefined
                : t("form.recovery_email.empty")
          }
        />
      </Grid>
    </>
  );
};

const AccountButtons = (props: { userId: string }) => {
  const { userId } = props;
  const { t } = useTranslation("users");
  const [pushDialog] = useDialogContext();
  const { values, refetchForm } = useFormContext<UserModelType>();
  const openResetPasswordDialog = useCallback(() => {
    pushDialog(<ResetPasswordAdminDialog userId={userId} />);
  }, [pushDialog, userId]);
  const openChangeEmailDialog = useCallback(() => {
    pushDialog(
      <ChangeEmailAdminDialog
        userId={userId}
        currentEmail={(values.email as string | null) ?? ""}
        onChanged={() => void refetchForm()}
      />,
    );
  }, [pushDialog, userId, values.email, refetchForm]);
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Button
          onClick={openResetPasswordDialog}
          variant={"contained"}
          fullWidth
        >
          {t("form.dialogs.reset_pwd.open")}
        </Button>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Button onClick={openChangeEmailDialog} variant={"contained"} fullWidth>
          {t("form.dialogs.change_email.open")}
        </Button>
      </Grid>
    </>
  );
};

const UserForm = (props: PageProps<UserModelType, CrudFormProps>) => {
  return (
    <DefaultFormPage {...props}>
      <FormPagePaper>
        <Grid container spacing={2}>
          <Grid size={12}>
            <FormField name={"active"} />
          </Grid>
          {props.id ? (
            <AddressFields />
          ) : (
            <Grid size={12}>
              <FormField name={"email"} />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name={"first_name"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name={"last_name"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name={"gender"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name={"locale"} />
          </Grid>
          {props.id ? (
            <AccountButtons userId={props.id} />
          ) : (
            <Grid size={12}>
              <FormField name={"set_password"} />
            </Grid>
          )}
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(UserForm);
