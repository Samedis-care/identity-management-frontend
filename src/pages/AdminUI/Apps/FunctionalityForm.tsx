import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { AppBar, Grid, Tab } from "@mui/material";
import {
  DefaultFormPage,
  FormField,
  FormTab,
  ModelFieldNames,
  RoutedTabs,
  RoutedTabPanelWrapper,
  useRoutedTabPanel,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { useTranslation } from "react-i18next";
import FunctionalityRoleSelector from "./components/FunctionalityRoleSelector";
import FormPagePaper from "../../../components/FormPagePaper";
import type { FunctionalityModelType } from "../../../components-care/models/FunctionalityModel";

/** The model fields of the main tab, rendered there and marked on its tab */
const MAIN_FIELDS: readonly ModelFieldNames<FunctionalityModelType>[] = [
  "title_translations",
  "description_translations",
  "module",
  "ident",
];

const FunctionalityForm = (
  props: PageProps<FunctionalityModelType, CrudFormProps>,
) => {
  const { t } = useTranslation("functionality");
  const tab = useRoutedTabPanel();

  return (
    <DefaultFormPage {...props}>
      <AppBar position={"static"}>
        <RoutedTabs>
          <FormTab
            value={""}
            label={t("form.tabs.main")}
            fields={MAIN_FIELDS}
          />
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
              {MAIN_FIELDS.map((field) => (
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
