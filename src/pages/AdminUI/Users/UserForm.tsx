import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Grid } from "@mui/material";
import { DefaultFormPage, FormField } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import FormPagePaper from "../../../components/FormPagePaper";
import type { UserModelType } from "../../../components-care/models/UserModel";
import UserAccountButtons from "./UserAccountButtons";

/**
 * A user of IM. The account address of an existing user is read-only here and
 * changed through ChangeEmailAdminDialog; a new user gets an address and an
 * initial password.
 */
const UserForm = (props: PageProps<UserModelType, CrudFormProps>) => {
  const { id, values } = props;
  return (
    <DefaultFormPage {...props}>
      <FormPagePaper>
        <Grid container spacing={2}>
          <Grid size={12}>
            <FormField name={"active"} />
          </Grid>
          <Grid size={id ? { xs: 12, sm: 6 } : 12}>
            <FormField name={"email"} />
          </Grid>
          {id && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name={"recovery_email"} />
            </Grid>
          )}
          {id && values?.unconfirmed_recovery_email && (
            <Grid size={12}>
              <FormField name={"unconfirmed_recovery_email"} />
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
          {id ? (
            <UserAccountButtons userId={id} />
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
