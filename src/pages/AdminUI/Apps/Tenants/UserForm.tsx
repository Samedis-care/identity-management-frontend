import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { AppBar, Grid, Tab } from "@mui/material";
import {
  DefaultFormPage,
  FormField,
  RoutedTabs,
  RoutedTabPanelWrapper,
  useRoutedTabPanel,
} from "components-care";
import { UserModel } from "../../../../components-care/models/UserModel";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { useTranslation } from "react-i18next";
import ImCrud from "../../../../components-care/ImCrud";
import { useFunctionalityModel } from "../../../../components-care/models/FunctionalityModel";
import { useRoleModel } from "../../../../components-care/models/RoleModel";
import UserOrganizationSelector from "./components/UserOrganizationSelector";
import { OpenFunctionality, OpenRole } from "../UserForm";
import FormPagePaper from "../../../../components/FormPagePaper";

const UserForm = (
  props: PageProps<keyof ReturnType<typeof UserModel>["fields"], CrudFormProps>,
) => {
  const { t } = useTranslation("users");
  const tab = useRoutedTabPanel();

  const rolesModel = useRoleModel({ user: props.id });
  const functionalityModel = useFunctionalityModel({ user: props.id });

  return (
    <DefaultFormPage {...props}>
      <AppBar position={"static"}>
        <RoutedTabs>
          <Tab value={""} label={t("form.tabs.main")} />
          <Tab value={"actors"} label={t("form.tabs.actors")} />
          <Tab value={"roles"} label={t("form.tabs.roles")} />
          <Tab value={"permissions"} label={t("form.tabs.permissions")} />
        </RoutedTabs>
      </AppBar>
      <FormPagePaper>
        <RoutedTabPanelWrapper>
          {tab("actors", <UserOrganizationSelector userId={props.id} />)}
          {tab(
            "roles",
            <ImCrud
              model={rolesModel}
              key={"role"}
              readPermission={false}
              editPermission={false}
              newPermission={false}
              exportPermission={false}
              deletePermission={false}
              disableRouting
              disableGridWrapper
              gridProps={{
                prohibitMultiSelect: true,
                customSelectionControl: OpenRole,
              }}
            >
              {undefined}
            </ImCrud>,
          )}
          {tab(
            "permissions",
            <ImCrud
              model={functionalityModel}
              key={"func"}
              readPermission={false}
              editPermission={false}
              newPermission={false}
              exportPermission={false}
              deletePermission={false}
              disableRouting
              disableGridWrapper
              gridProps={{
                prohibitMultiSelect: true,
                customSelectionControl: OpenFunctionality,
              }}
            >
              {undefined}
            </ImCrud>,
          )}
          {tab(
            "",
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
            </Grid>,
          )}
        </RoutedTabPanelWrapper>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(UserForm);
