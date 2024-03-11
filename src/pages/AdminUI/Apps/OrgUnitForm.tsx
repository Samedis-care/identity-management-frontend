import React from "react";
import { DefaultFormPage, FormField, PageProps } from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { Grid } from "@mui/material";
import OrganizationRoleSelector from "./components/OrganizationRoleSelector";
import { OrganizationModel } from "../../../components-care/models/OrganizationModel";
import FormPagePaper from "../../../components/FormPagePaper";

const OrgUnitForm = (
  props: PageProps<
    keyof ReturnType<typeof OrganizationModel>["fields"],
    CrudFormProps
  >,
) => {
  return (
    <DefaultFormPage {...props}>
      <FormPagePaper noOuterPadding>
        <Grid container spacing={2}>
          {["image", "active", "name", "title_translations", "actor_type"].map(
            (field) => (
              <Grid item xs={12} key={field}>
                <FormField name={field} />
              </Grid>
            ),
          )}
          {props.values!.actor_type === "group" && (
            <Grid item xs={12}>
              <OrganizationRoleSelector organizationId={props.id} />
            </Grid>
          )}
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(OrgUnitForm);
