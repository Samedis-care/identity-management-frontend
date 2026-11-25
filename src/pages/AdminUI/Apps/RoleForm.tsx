import React from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { AppBar, Grid, Tab } from "@mui/material";
import {
  DefaultFormPage,
  FormField,
  FormTab,
  ModelFieldNames,
  RoutedTabPanelWrapper,
  RoutedTabs,
  useRoutedTabPanel,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { useTranslation } from "react-i18next";
import RoleFunctionalitySelector from "./components/RoleFunctionalitySelector";
import FormPagePaper from "../../../components/FormPagePaper";
import DataGridMassSelect from "../../../components/DataGridMassSelect";
import { useActorPickerModel } from "../../../components-care/models/ActorPickerModel";
import { useActorListModel } from "../../../components-care/models/ActorListModel";
import type { RoleModelType } from "../../../components-care/models/RoleModel";

/** The model fields of the main tab, rendered there and marked on its tab */
const MAIN_FIELDS: readonly ModelFieldNames<RoleModelType>[] = [
  "title_translations",
  "description_translations",
];

const RoleForm = (props: PageProps<RoleModelType, CrudFormProps>) => {
  const { t } = useTranslation("roles");
  const tab = useRoutedTabPanel();

  const roleActorPicker = useActorPickerModel({ role: props.id ?? "new" });
  const roleActorList = useActorListModel({ role: props.id ?? "new" });

  return (
    <DefaultFormPage {...props}>
      <AppBar position={"static"}>
        <RoutedTabs>
          <FormTab
            value={""}
            label={t("form.tabs.main")}
            fields={MAIN_FIELDS}
          />
          <Tab value={"permissions"} label={t("form.tabs.functions")} />
          <Tab value={"actors"} label={t("form.tabs.actors")} />
        </RoutedTabs>
      </AppBar>
      <FormPagePaper>
        <RoutedTabPanelWrapper>
          {tab("permissions", <RoleFunctionalitySelector roleId={props.id} />)}
          {tab(
            "actors",
            <>
              {props.id ? (
                <DataGridMassSelect
                  pickerLabel={t("picker.actors")}
                  selectedModel={roleActorList}
                  serializeCreate={(id: string) => ({ actor_id: id })}
                  optionsModel={roleActorPicker}
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
              )}
            </>,
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

export default React.memo(RoleForm);
