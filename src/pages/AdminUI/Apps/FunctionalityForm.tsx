import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { AppBar, Grid2 as Grid, Tab } from "@mui/material";
import {
  DefaultFormPage,
  FormField,
  RoutedTabs,
  RoutedTabPanelWrapper,
  useRoutedTabPanel,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { FunctionalityModel } from "../../../components-care/models/FunctionalityModel";
import { useTranslation } from "react-i18next";
import FunctionalityRoleSelector from "./components/FunctionalityRoleSelector";
import FormPagePaper from "../../../components/FormPagePaper";

const FunctionalityForm = (
  props: PageProps<
    keyof ReturnType<typeof FunctionalityModel>["fields"],
    CrudFormProps
  >,
) => {
  const { t } = useTranslation("functionality");
  const tab = useRoutedTabPanel();

  return (
    <DefaultFormPage {...props}>
      <AppBar position={"static"}>
        <RoutedTabs>
          <Tab value={""} label={t("form.tabs.main")} />
          <Tab value={"roles"} label={t("form.tabs.roles")} />
        </RoutedTabs>
      </AppBar>
      <FormPagePaper>
        <RoutedTabPanelWrapper>
          {tab(
            "roles",
            <FunctionalityRoleSelector functionalityId={props.id} />,
          )}
          {tab(
            "",
            <Grid container spacing={2}>
              {[
                "title_translations",
                "description_translations",
                "module",
                "ident",
              ].map((field) => (
                <Grid key={field} size={12}>
                  <FormField name={field} />
                </Grid>
              ))}
            </Grid>,
          )}
        </RoutedTabPanelWrapper>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(FunctionalityForm);
