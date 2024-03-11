import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  MultiSelectorData,
  throwError,
  useParams,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { DataGridSortSetting } from "components-care/dist/standalone/DataGrid/DataGrid";

export interface ActorPickerModelParams {
  app: string;
  tenant?: string | null;
  user?: string | null;
  role?: string | null;
  org?: string | null;
  pickerType?: "user_organization" | "mappable_users" | null;
}

export const ActorPickerModel = (
  t: TFunction,
  { app, tenant, user, role, org, pickerType }: ActorPickerModelParams,
) =>
  new Model(
    "actors-picker",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      path: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.path"),
        customData: null,
        visibility: {
          overview: org
            ? ModelVisibilityDisabledReadOnly
            : ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      // if role
      already_in_role: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
        filterable: false,
        sortable: false,
      },
      // if orga
      already_in_orga: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
        filterable: false,
        sortable: false,
      },
      // if user
      already_assigned_to_user: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
        filterable: false,
        sortable: false,
      },
      full_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.full_name"),
        customData: null,
        visibility: {
          overview: org
            ? ModelVisibilityGridView
            : ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityDisabledReadOnly,
          edit: ModelVisibilityDisabledReadOnly,
        },
        filterable: true,
        sortable: true,
      },
      email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.email"),
        customData: null,
        visibility: {
          overview: org
            ? ModelVisibilityGridView
            : ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityDisabledReadOnly,
          edit: ModelVisibilityDisabledReadOnly,
        },
        filterable: true,
        sortable: true,
      },
    },
    new BackendConnector(
      tenant
        ? user
          ? pickerType === "user_organization"
            ? `v1/apps/${app}/tenants/${tenant}/picker/users/${user}/groups`
            : `v1/apps/${app}/tenants/${tenant}/users/${user}/actors`
          : org
            ? `v1/apps/${app}/tenants/${tenant}/organizations/${org}/picker/mappable_users`
            : pickerType === "mappable_users"
              ? `v1/apps/${app}/tenants/${tenant}/picker/mappable_users`
              : pickerType === "user_organization"
                ? `v1/apps/${app}/tenants/${tenant}/picker/user_organization`
                : throwError("Unknown endpoint, or pickerType not set")
        : role
          ? `v1/apps/${app}/picker/roles/${role}/user_organization`
          : user
            ? pickerType === "user_organization"
              ? `v1/apps/${app}/picker/users/${user}/groups`
              : `v1/apps/${app}/users/${user}/actors`
            : pickerType === "user_organization"
              ? `v1/apps/${app}/picker/user_organization`
              : throwError(
                  "Unknown endpoint, tenant id not set, or pickerType not set",
                ),
      null,
      undefined,
      undefined,
      {
        overrideRecordBase: user ? undefined : "v1/actors",
      },
    ),
    {
      app,
      user,
      tenant,
      role,
      org,
      pickerType,
    },
  );

export const useActorPickerModel = (
  params: Omit<ActorPickerModelParams, "app"> & { app?: string | null },
) => {
  const { t } = useTranslation("actors");
  const { app, tenant } = useParams();
  if (!params.app) params = { ...params, app };
  if (!params.tenant && tenant) params = { ...params, tenant };
  if (!params.app) throw new Error("No app specified");
  return ActorPickerModel(t, params as ActorPickerModelParams);
};

export const ActorPickerModelToSelectorData = (
  data: Record<keyof ReturnType<typeof ActorPickerModel>["fields"], unknown>,
): MultiSelectorData => ({
  value: data.id as string,
  label: data.path as string,
});

export const ActorPickerModelSelectorSort: DataGridSortSetting[] = [
  { field: "path", direction: 1 },
];
