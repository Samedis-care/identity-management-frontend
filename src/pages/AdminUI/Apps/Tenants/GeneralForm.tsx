import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Grid2 as Grid } from "@mui/material";
import { EditOnlyFormPage, FormField } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { TenantModel } from "../../../../components-care/models/TenantModel";
import FormPagePaper from "../../../../components/FormPagePaper";
import ModuleSelector from "./components/ModuleSelector";

const GeneralForm = (
  props: PageProps<
    keyof ReturnType<typeof TenantModel>["fields"],
    CrudFormProps
  >,
) => {
  return (
    <EditOnlyFormPage {...props} customProps={undefined}>
      <FormPagePaper>
        <Grid container spacing={2}>
          {["short_name", "full_name", "image"].map((field) => (
            <Grid key={field} size={12}>
              <FormField name={field} />
            </Grid>
          ))}
          <Grid size={12}>
            <ModuleSelector />
          </Grid>
        </Grid>
      </FormPagePaper>
    </EditOnlyFormPage>
  );
};

export default React.memo(GeneralForm);
