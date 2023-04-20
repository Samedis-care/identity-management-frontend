import React from "react";
import { Model, ModelFieldName, PageVisibility } from "components-care";
import { useActorPickerModel } from "../../../../components-care/models/ActorPickerModel";
import DataGridMassSelect from "../../../../components/DataGridMassSelect";
import { useActorListModel } from "../../../../components-care/models/ActorListModel";
import { useTranslation } from "react-i18next";

export interface UserOrganizationSelectorProps {
  userId: string | null;
}

const pickerProps = {
  isSelected: (selected: boolean, record: Record<string, unknown>) =>
    !!(record.already_assigned_to_user_raw as boolean | undefined) || selected,
  canSelectRow: (record: Record<string, unknown>) =>
    !record.already_assigned_to_user_raw,
};

const serializeCreate = (id: string) => ({ actor_id: id });

const UserOrganizationSelector = (props: UserOrganizationSelectorProps) => {
  const { t } = useTranslation("users");
  const actorPicker = useActorPickerModel({
    user: props.userId ?? "new",
    pickerType: "user_organization",
  });
  const actorList = useActorListModel({ user: props.userId ?? "new" });

  return props.userId ? (
    <DataGridMassSelect
      selectedModel={actorList}
      serializeCreate={serializeCreate}
      optionsModel={
        actorPicker as unknown as Model<ModelFieldName, PageVisibility, unknown>
      }
      pickerProps={pickerProps}
    />
  ) : (
    <>{t("save-actors")}</>
  );
};

export default React.memo(UserOrganizationSelector);
