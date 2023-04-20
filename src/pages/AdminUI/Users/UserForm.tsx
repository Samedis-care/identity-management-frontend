import React, { useCallback } from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Button, Grid } from "@mui/material";
import { DefaultFormPage, FormField, useDialogContext } from "components-care";
import { UserModel } from "../../../components-care/models/UserModel";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { useTranslation } from "react-i18next";
import ResetPasswordAdminDialog from "./ResetPasswordAdminDialog";
import FormPagePaper from "../../../components/FormPagePaper";

const UserForm = (
  props: PageProps<keyof ReturnType<typeof UserModel>["fields"], CrudFormProps>
) => {
  const { t } = useTranslation("users");
  const [pushDialog] = useDialogContext();

  const openResetPasswordDialog = useCallback(() => {
    if (!props.id) return;
    pushDialog(<ResetPasswordAdminDialog userId={props.id} />);
  }, [pushDialog, props.id]);

  return (
    <DefaultFormPage {...props}>
      <FormPagePaper>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <FormField name={"active"} />
          </Grid>
          <Grid item xs={10}>
            <FormField name={"email"} />
          </Grid>
          <Grid item xs={6}>
            <FormField name={"first_name"} />
          </Grid>
          <Grid item xs={6}>
            <FormField name={"last_name"} />
          </Grid>
          <Grid item xs={6}>
            <FormField name={"gender"} />
          </Grid>
          <Grid item xs={6}>
            <FormField name={"locale"} />
          </Grid>
          {props.id && (
            <Grid item xs={12}>
              <Button
                onClick={openResetPasswordDialog}
                variant={"contained"}
                fullWidth
              >
                {t("form.dialogs.reset_pwd.open")}
              </Button>
            </Grid>
          )}
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(UserForm);
