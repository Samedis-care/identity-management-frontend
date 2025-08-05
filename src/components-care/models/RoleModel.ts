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
  useParams,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { DataGridSortSetting } from "components-care/dist/standalone/DataGrid/DataGrid";
import { MultiLanguageInputSupportedLanguages } from "components-care/dist/standalone/UIKit/InputControls/MultiLanguageInput";
import useApp from "../../utils/useApp";
import useAppLanguages from "../../utils/useAppLanguages";
import { useMemo } from "react";

export interface RoleModelParams {
  app: string;
  supportedLanguages: MultiLanguageInputSupportedLanguages[];
  user?: string | null;
  tenant?: string | null;
  functionality?: string | null;
  picker?: boolean;
}

export const RoleModel = (
  t: TFunction,
  {
    app,
    supportedLanguages,
    user,
    tenant,
    functionality,
    picker,
  }: RoleModelParams,
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
          enabledLanguages: supportedLanguages,
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
          enabledLanguages: supportedLanguages,
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
            : `v1/apps/${app}/roles`,
    ),
    {
      app,
      user,
      tenant,
    },
  );

export const useRoleModel = (params?: Partial<RoleModelParams>) => {
  const { t } = useTranslation(["roles", "functionality", "roles"]);
  const app = useApp();
  const { tenant } = useParams();
  const supportedLanguages = useAppLanguages(params?.app ?? app);
  return useMemo(
    () => RoleModel(t, { app, tenant, supportedLanguages, ...params }),
    [app, params, supportedLanguages, t, tenant],
  );
};

export const RoleModelSelectorSort: DataGridSortSetting[] = [
  { field: "title", direction: 1 },
];
