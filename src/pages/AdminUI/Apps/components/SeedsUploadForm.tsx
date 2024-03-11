import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Box, Grid } from "@mui/material";
import { EditOnlyFormPage, FormField } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { AppAdminModel } from "../../../../components-care/models/AppAdminModel";

const SeedsUploadForm = (
  props: PageProps<
    keyof ReturnType<typeof AppAdminModel>["fields"],
    CrudFormProps
  >,
) => {
  return (
    <EditOnlyFormPage {...props} customProps={undefined}>
      <Box p={2}>
        <Grid container spacing={2}>
          {["import_roles", "import_candos"].map((field) => (
            <Grid item xs={12} key={field}>
              <FormField name={field} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </EditOnlyFormPage>
  );
};

export default React.memo(SeedsUploadForm);
