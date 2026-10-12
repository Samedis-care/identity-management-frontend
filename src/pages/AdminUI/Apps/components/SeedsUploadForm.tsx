import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Box, Grid } from "@mui/material";
import { EditOnlyFormPage, FormField } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import type { AppAdminModelType } from "../../../../components-care/models/AppAdminModel";

const SeedsUploadForm = (
  props: PageProps<AppAdminModelType, CrudFormProps>,
) => {
  return (
    <EditOnlyFormPage {...props} customProps={undefined}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {["import_roles", "import_candos"].map((field) => (
            <Grid key={field} size={12}>
              <FormField name={field} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </EditOnlyFormPage>
  );
};

export default React.memo(SeedsUploadForm);
