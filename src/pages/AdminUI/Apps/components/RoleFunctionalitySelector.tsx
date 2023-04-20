import React from "react";
import { Model, ModelFieldName, PageVisibility } from "components-care";
import { useFunctionalityModel } from "../../../../components-care/models/FunctionalityModel";
import DataGridMassSelect from "../../../../components/DataGridMassSelect";
import { useTranslation } from "react-i18next";

export interface RoleFunctionalitySelectorProps {
  roleId: string | null;
}

const pickerProps = {
  isSelected: (selected: boolean, record: Record<string, unknown>) =>
    !!(record.already_in_role_raw as boolean | undefined) || selected,
  canSelectRow: (record: Record<string, unknown>) =>
    !record.already_in_role_raw,
};

const serializeCreate = (id: string) => ({ functionality_id: id });

const RoleFunctionalitySelector = (props: RoleFunctionalitySelectorProps) => {
  const { t } = useTranslation("roles");
  const pickerModel = useFunctionalityModel({
    role: props.roleId,
    picker: true,
  });
  const listModel = useFunctionalityModel({ role: props.roleId });

  return props.roleId ? (
    <DataGridMassSelect
      selectedModel={listModel}
      serializeCreate={serializeCreate}
      optionsModel={
        pickerModel as unknown as Model<ModelFieldName, PageVisibility, unknown>
      }
      pickerProps={pickerProps}
    />
  ) : (
    <>{t("save-functionalities")}</>
  );
};

export default React.memo(RoleFunctionalitySelector);
