import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeLocalizedStringRenderer,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  ModelVisibilityHidden,
  throwError,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useParams } from "react-router-dom";
import { DataGridSortSetting } from "components-care/dist/standalone/DataGrid/DataGrid";
import { SupportedLanguages } from "../../i18n";

export interface RoleModelParams {
  app: string;
  user?: string | null;
  tenant?: string | null;
  functionality?: string | null;
  picker?: boolean;
}

export const RoleModel = (
  t: TFunction,
  { app, user, tenant, functionality, picker }: RoleModelParams
) =>
  new Model(
    "role",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("roles:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      title: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("roles:fields.title"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityHidden,
          edit: ModelVisibilityHidden,
        },
        filterable: true,
        sortable: true,
      },
      title_translations: {
        type: new ModelDataTypeLocalizedStringRenderer({
          enabledLanguages: SupportedLanguages,
        }),
        getLabel: () => t("roles:fields.title"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      description: {
        type: new ModelDataTypeStringRendererMUI({
          multiline: true,
        }),
        getLabel: () => t("roles:fields.description"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityHidden,
          edit: ModelVisibilityHidden,
        },
        filterable: true,
        sortable: true,
      },
      description_translations: {
        type: new ModelDataTypeLocalizedStringRenderer({
          multiline: true,
          enabledLanguages: SupportedLanguages,
        }),
        getLabel: () => t("roles:fields.description"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      // if picker for functionality
      already_in_functionality: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
        filterable: false,
        sortable: false,
      },
      role_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
    },
    new BackendConnector(
      tenant
        ? user
          ? `v1/apps/${app}/tenants/${tenant}/users/${user}/roles`
          : throwError("invalid config")
        : functionality
        ? picker
          ? `v1/apps/${app}/picker/functionalities/${functionality}/roles`
          : `v1/apps/${app}/functionalities/${functionality}/roles`
        : user
        ? `v1/apps/${app}/users/${user}/roles`
        : `v1/apps/${app}/roles`
    ),
    {
      app,
      user,
      tenant,
    }
  );

export const useRoleModel = (
  params?: Omit<RoleModelParams, "app"> & { app?: string }
) => {
  const { t } = useTranslation(["roles", "functionality", "roles"]);
  let { app, tenant } = useParams<{ app?: string; tenant?: string }>();
  if (!app) throw new Error("No app specified");
  return RoleModel(t, { app, tenant, ...params });
};

export const RoleModelSelectorSort: DataGridSortSetting[] = [
  { field: "title", direction: 1 },
];
