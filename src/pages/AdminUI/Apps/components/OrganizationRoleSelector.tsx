import { FormCrudMultiSelect } from "components-care/dist";
import React from "react";
import {
  MultiSelectorData,
  PageVisibility,
  useFormContextLite,
} from "components-care";
import useApp from "../../../../utils/useApp";
import { useTranslation } from "react-i18next";
import {
  RoleModel,
  RoleModelSelectorSort,
  useRoleModel,
} from "../../../../components-care/models/RoleModel";
import { useNavigate } from "react-router";

export interface OrganizationRoleSelectorProps {
  organizationId: string | null;
}

export interface OrganizationRoleData extends MultiSelectorData {
  /**
   * The ID of the functionality
   */
  role_id: string;
}

const OrganizationRoleSelector = (props: OrganizationRoleSelectorProps) => {
  const model = useRoleModel();
  const app = useApp();
  const { t } = useTranslation("ous");
  const { readOnly } = useFormContextLite();
  const navigate = useNavigate();

  return (
    <FormCrudMultiSelect<
      keyof ReturnType<typeof RoleModel>["fields"],
      PageVisibility,
      null,
      OrganizationRoleData
    >
      field={"functionalities"}
      getEndpoint={(id: string) =>
        `v1/apps/${app}/organizations/${id}/actor_roles`
      }
      model={model}
      initialId={props.organizationId}
      label={t("relationships.roles.label")}
      enableIcons
      placeholder={t("relationships.roles.placeholder")}
      serialize={(record: OrganizationRoleData) => ({
        id: record.value,
        role_id: record.role_id,
        label: record.label,
        icon: record.icon,
      })}
      deserialize={(data: Record<string, unknown>): OrganizationRoleData => ({
        value: data.id as string,
        role_id: data.id as string,
        label: (data.label as string) ?? (data.title as string),
        onClick: () => navigate(`/apps/${app}/roles/${data.id}`),
      })}
      deserializeModel={(
        data: Record<keyof ReturnType<typeof RoleModel>["fields"], unknown>
      ): Omit<OrganizationRoleData, "value"> => ({
        role_id: data.id as string,
        label: data.title as string,
        onClick: () => navigate(`/apps/${app}/roles/${data.id}`),
      })}
      getIdOfData={(data) => data.role_id}
      disabled={readOnly}
      sort={RoleModelSelectorSort}
    />
  );
};

export default React.memo(OrganizationRoleSelector);
