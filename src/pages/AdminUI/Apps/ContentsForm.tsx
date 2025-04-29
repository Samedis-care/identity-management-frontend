import React from "react";
import { DefaultFormPage, FormField, PageProps } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { Grid } from "@mui/material";
import { ContentModel } from "../../../components-care/models/ContentModel";
import FormPagePaper from "../../../components/FormPagePaper";

const ContentsForm = (
  props: PageProps<
    keyof ReturnType<typeof ContentModel>["fields"],
    CrudFormProps
  >,
) => {
  return (
    <DefaultFormPage {...props}>
      <FormPagePaper>
        <Grid container spacing={2}>
          {[
            "name",
            "version",
            "active",
            "acceptance_required",
            "content_translations",
          ].map((field) => (
            <Grid key={field} size={12}>
              <FormField name={field} />
            </Grid>
          ))}
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(ContentsForm);
