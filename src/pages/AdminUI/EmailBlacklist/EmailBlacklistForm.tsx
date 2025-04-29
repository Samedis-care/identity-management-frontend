import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Grid } from "@mui/material";
import { DefaultFormPage, FormField } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { EmailBlacklistModel } from "../../../components-care/models/EmailBlacklistModel";
import FormPagePaper from "../../../components/FormPagePaper";

const EmailBlacklistForm = (
  props: PageProps<
    keyof ReturnType<typeof EmailBlacklistModel>["fields"],
    CrudFormProps
  >,
) => {
  return (
    <DefaultFormPage {...props}>
      <FormPagePaper>
        <Grid container spacing={2}>
          <Grid size={2}>
            <FormField name={"active"} />
          </Grid>
          <Grid size={10}>
            <FormField name={"domain"} />
          </Grid>
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(EmailBlacklistForm);
