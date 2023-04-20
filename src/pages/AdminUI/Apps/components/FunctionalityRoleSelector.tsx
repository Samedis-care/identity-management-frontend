import React from "react";
import { Model, ModelFieldName, PageVisibility } from "components-care";
import { useTranslation } from "react-i18next";
import DataGridMassSelect from "../../../../components/DataGridMassSelect";
import { useRoleModel } from "../../../../components-care/models/RoleModel";

export interface FunctionalityRoleSelectorProps {
  functionalityId: string | null;
}

const pickerProps = {
  isSelected: (selected: boolean, record: Record<string, unknown>) =>
    !!(record.already_in_functionality_raw as boolean | undefined) || selected,
  canSelectRow: (record: Record<string, unknown>) =>
    !record.already_in_functionality_raw,
};
const serializeCreate = (id: string) => ({ role_id: id });

const FunctionalityRoleSelector = (props: FunctionalityRoleSelectorProps) => {
  const { t } = useTranslation("functionality");
  const pickerModel = useRoleModel({
    functionality: props.functionalityId,
    picker: true,
  });
  const listModel = useRoleModel({ functionality: props.functionalityId });

  return props.functionalityId ? (
    <DataGridMassSelect
      selectedModel={listModel}
      serializeCreate={serializeCreate}
      optionsModel={
        pickerModel as unknown as Model<ModelFieldName, PageVisibility, unknown>
      }
      pickerProps={pickerProps}
    />
  ) : (
    <>{t("save-roles")}</>
  );
};

export default React.memo(FunctionalityRoleSelector);
