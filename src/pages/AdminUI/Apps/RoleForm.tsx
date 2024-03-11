import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { AppBar, Grid, Tab } from "@mui/material";
import {
  DefaultFormPage,
  FormField,
  Model,
  ModelFieldName,
  PageVisibility,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { RoleModel } from "../../../components-care/models/RoleModel";
import { useTranslation } from "react-i18next";
import RoutedTabs from "../../../components/RoutedTabs/RoutedTabs";
import RoutedTabPanelWrapper from "../../../components/RoutedTabs/RoutedTabPanelWrapper";
import useRoutedTabPanel from "../../../components/RoutedTabs/useRoutedTabPanel";
import RoleFunctionalitySelector from "./components/RoleFunctionalitySelector";
import FormPagePaper from "../../../components/FormPagePaper";
import DataGridMassSelect from "../../../components/DataGridMassSelect";
import { useActorPickerModel } from "../../../components-care/models/ActorPickerModel";
import { useActorListModel } from "../../../components-care/models/ActorListModel";

const RoleForm = (
  props: PageProps<keyof ReturnType<typeof RoleModel>["fields"], CrudFormProps>,
) => {
  const { t } = useTranslation("roles");
  const tab = useRoutedTabPanel();

  const roleActorPicker = useActorPickerModel({ role: props.id ?? "new" });
  const roleActorList = useActorListModel({ role: props.id ?? "new" });

  return (
    <DefaultFormPage {...props}>
      <AppBar position={"static"}>
        <RoutedTabs>
          <Tab value={""} label={t("form.tabs.main")} />
          <Tab value={"permissions"} label={t("form.tabs.functions")} />
          <Tab value={"actors"} label={t("form.tabs.actors")} />
        </RoutedTabs>
      </AppBar>
      <FormPagePaper>
        <RoutedTabPanelWrapper>
          {tab("permissions", <RoleFunctionalitySelector roleId={props.id} />)}
          {tab(
            "actors",
            props.id ? (
              <DataGridMassSelect
                selectedModel={roleActorList}
                serializeCreate={(id: string) => ({ actor_id: id })}
                optionsModel={
                  roleActorPicker as unknown as Model<
                    ModelFieldName,
                    PageVisibility,
                    unknown
                  >
                }
                pickerProps={{
                  isSelected: (
                    selected: boolean,
                    record: Record<string, unknown>,
                  ) =>
                    !!(record.already_in_role_raw as boolean | undefined) ||
                    selected,
                  canSelectRow: (record: Record<string, unknown>) =>
                    !record.already_in_role_raw,
                }}
              />
            ) : (
              t("save-actors")
            ),
          )}
          {tab(
            "",
            <Grid container spacing={2}>
              {["title_translations", "description_translations"].map(
                (field) => (
                  <Grid item xs={12} key={field}>
                    <FormField name={field} />
                  </Grid>
                ),
              )}
            </Grid>,
          )}
        </RoutedTabPanelWrapper>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(RoleForm);
