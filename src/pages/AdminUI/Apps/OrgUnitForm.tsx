import React from "react";
import { DefaultFormPage, FormField, PageProps } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { Grid } from "@mui/material";
import OrganizationRoleSelector from "./components/OrganizationRoleSelector";
import FormPagePaper from "../../../components/FormPagePaper";
import type { OrganizationModelType } from "../../../components-care/models/OrganizationModel";

const OrgUnitForm = (
  props: PageProps<OrganizationModelType, CrudFormProps>,
) => {
  return (
    <DefaultFormPage {...props}>
      <FormPagePaper noOuterPadding>
        <Grid container spacing={2}>
          {["image", "active", "name", "title_translations", "actor_type"].map(
            (field) => (
              <Grid key={field} size={12}>
                <FormField name={field} />
              </Grid>
            ),
          )}
          {props.values!.actor_type === "group" && (
            <Grid size={12}>
              <OrganizationRoleSelector organizationId={props.id} />
            </Grid>
          )}
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(OrgUnitForm);
