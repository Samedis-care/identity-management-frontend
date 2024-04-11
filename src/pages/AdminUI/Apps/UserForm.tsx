import React, { useCallback } from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { AppBar, Grid, Tab, Tooltip } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  DefaultFormPage,
  FormField,
  useFormContextLite,
  useNavigate,
  useParams,
  RoutedTabs,
  RoutedTabPanelWrapper,
  useRoutedTabPanel,
} from "components-care";
import { UserModel } from "../../../components-care/models/UserModel";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { useTranslation } from "react-i18next";
import ImCrud from "../../../components-care/ImCrud";
import { useFunctionalityModel } from "../../../components-care/models/FunctionalityModel";
import { useRoleModel } from "../../../components-care/models/RoleModel";
import { IDataGridContentSelectRowViewProps } from "components-care/dist/standalone/DataGrid/Content/SelectRowView";
import { KeyboardArrowRight as OpenIcon } from "@mui/icons-material";
import UserOrganizationSelector from "./components/UserOrganizationSelector";
import { useTenantModel } from "../../../components-care/models/TenantModel";
import FormPagePaper from "../../../components/FormPagePaper";

const useOpenStyles = makeStyles()((theme) => ({
  root: {
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

export const OpenRole = (props: IDataGridContentSelectRowViewProps) => {
  const { id } = props;
  const { t } = useTranslation("common");
  const { classes } = useOpenStyles();
  const { app } = useParams();
  const navigate = useNavigate();

  const handleOpen = useCallback(() => {
    navigate(`/apps/${app}/roles/${id}`);
  }, [navigate, app, id]);

  return (
    <Tooltip title={t("data-grid.open") ?? ""}>
      <OpenIcon classes={classes} onClick={handleOpen} />
    </Tooltip>
  );
};

export const OpenTenant = (props: IDataGridContentSelectRowViewProps) => {
  const { id } = props;
  const { t } = useTranslation("common");
  const { classes } = useOpenStyles();
  const { app } = useParams();
  const navigate = useNavigate();
  const { id: userId } = useFormContextLite();

  const handleOpen = useCallback(() => {
    navigate(`/apps/${app}/tenants/${id}/users/${userId}`);
  }, [navigate, app, id, userId]);

  return (
    <Tooltip title={t("data-grid.open") ?? ""}>
      <OpenIcon classes={classes} onClick={handleOpen} />
    </Tooltip>
  );
};

export const OpenFunctionality = (
  props: IDataGridContentSelectRowViewProps,
) => {
  const { id } = props;
  const { t } = useTranslation("common");
  const { classes } = useOpenStyles();
  const { app } = useParams();
  const navigate = useNavigate();

  const handleOpen = useCallback(() => {
    navigate(`/apps/${app}/functions/${id}`);
  }, [navigate, app, id]);

  return (
    <Tooltip title={t("data-grid.open") ?? ""}>
      <OpenIcon classes={classes} onClick={handleOpen} />
    </Tooltip>
  );
};

const UserForm = (
  props: PageProps<keyof ReturnType<typeof UserModel>["fields"], CrudFormProps>,
) => {
  const { t } = useTranslation("users");
  const tab = useRoutedTabPanel();

  const rolesModel = useRoleModel({ user: props.id });
  const functionalityModel = useFunctionalityModel({ user: props.id });
  const tenantModel = useTenantModel(undefined, props.id);

  return (
    <DefaultFormPage {...props}>
      <AppBar position={"static"}>
        <RoutedTabs>
          <Tab value={""} label={t("form.tabs.main")} />
          <Tab value={"tenants"} label={t("form.tabs.tenants")} />
          <Tab value={"actors"} label={t("form.tabs.actors")} />
          <Tab value={"roles"} label={t("form.tabs.roles")} />
          <Tab value={"permissions"} label={t("form.tabs.permissions")} />
        </RoutedTabs>
      </AppBar>
      <FormPagePaper>
        <RoutedTabPanelWrapper>
          {tab("actors", <UserOrganizationSelector userId={props.id} />)}
          {tab(
            "tenants",
            <ImCrud
              model={tenantModel}
              key={"tenant"}
              readPermission={false}
              editPermission={false}
              newPermission={false}
              exportPermission={false}
              deletePermission={false}
              disableRouting
              disableGridWrapper
              gridProps={{
                prohibitMultiSelect: true,
                customSelectionControl: OpenTenant,
              }}
            >
              {undefined}
            </ImCrud>,
          )}
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
