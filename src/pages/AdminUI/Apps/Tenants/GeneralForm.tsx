import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Grid } from "@mui/material";
import { EditOnlyFormPage } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import FormPagePaper from "../../../../components/FormPagePaper";
import FieldsWithImage from "../../../../components/FieldsWithImage";
import ModuleSelector from "./components/ModuleSelector";
import type { TenantModelType } from "../../../../components-care/models/TenantModel";

const GeneralForm = (props: PageProps<TenantModelType, CrudFormProps>) => {
  return (
    <EditOnlyFormPage {...props} customProps={undefined}>
      <FormPagePaper>
        <Grid container spacing={2}>
          <FieldsWithImage
            fields={["short_name", "full_name"]}
            imageField={"image"}
          />
          <Grid size={12}>
            <ModuleSelector />
          </Grid>
        </Grid>
      </FormPagePaper>
    </EditOnlyFormPage>
  );
};

export default React.memo(GeneralForm);
