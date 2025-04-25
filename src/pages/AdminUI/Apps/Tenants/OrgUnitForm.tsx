import React from "react";
import {
  DefaultFormPage,
  FormField,
  Model,
  ModelFieldName,
  PageProps,
  PageVisibility,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { Grid2 as Grid } from "@mui/material";
import OrganizationRoleSelector from "./components/OrganizationRoleSelector";
import { OrganizationModel } from "../../../../components-care/models/OrganizationModel";
import FormPagePaper from "../../../../components/FormPagePaper";
import { useActorPickerModel } from "../../../../components-care/models/ActorPickerModel";
import { useActorListModel } from "../../../../components-care/models/ActorListModel";
import DataGridMassSelect from "../../../../components/DataGridMassSelect";
import { useTranslation } from "react-i18next";

const OrgUnitForm = (
  props: PageProps<
    keyof ReturnType<typeof OrganizationModel>["fields"],
    CrudFormProps
  >,
) => {
  const { t } = useTranslation("ous");
  const orgActorPicker = useActorPickerModel({
    org: props.id ?? "new",
    pickerType: "mappable_users",
  });
  const orgActorList = useActorListModel({ org: props.id ?? "new" });

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
            <>
              <Grid size={12}>
                <OrganizationRoleSelector organizationId={props.id} />
              </Grid>
              <Grid style={{ minHeight: "100vh" }} size={12}>
                {props.id ? (
                  <DataGridMassSelect
                    selectedModel={orgActorList}
                    serializeCreate={(id: string) => ({ map_actor_id: id })}
                    optionsModel={
                      orgActorPicker as unknown as Model<
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
                        !!(record.already_in_orga_raw as boolean | undefined) ||
                        selected,
                      canSelectRow: (record: Record<string, unknown>) =>
                        !record.already_in_orga_raw,
                    }}
                  />
                ) : (
                  t("save-actors")
                )}
              </Grid>
            </>
          )}
        </Grid>
      </FormPagePaper>
    </DefaultFormPage>
  );
};

export default React.memo(OrgUnitForm);
