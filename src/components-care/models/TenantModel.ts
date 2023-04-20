import {
  Model,
  ModelDataTypeImageRenderer,
  ModelDataTypeStringArrayBackendRenderer,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEdit,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  ModelVisibilityGridViewHidden,
  ModelVisibilityHidden,
  MultiSelectorData,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useParams } from "react-router-dom";
import { DataGridSortSetting } from "components-care/dist/standalone/DataGrid/DataGrid";

export const TenantModel = (t: TFunction, app: string, user?: string | null) =>
  new Model(
    "tenants",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      short_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.short_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      full_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.full_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      image: {
        type: new ModelDataTypeImageRenderer(),
        getLabel: () => t("actors:fields.image"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
        filterable: true,
        sortable: true,
      },
      path: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.path"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      modules_available: {
        type: new ModelDataTypeStringArrayBackendRenderer(),
        getLabel: () => "",
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityDisabledReadOnly,
          edit: ModelVisibilityDisabledReadOnly,
        },
        getDefaultValue: () => [],
      },
      modules_selected: {
        type: new ModelDataTypeStringArrayBackendRenderer(),
        getLabel: () => "",
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityHidden,
          edit: ModelVisibilityHidden,
        },
        getDefaultValue: () => [],
      },
    },
    new BackendConnector(
      user ? `v1/apps/${app}/users/${user}/tenants` : `v1/apps/${app}/tenants`
    ),
    {
      app,
      user,
    }
  );

export const useTenantModel = (
  appOverride?: string | null,
  user?: string | null
) => {
  const { t } = useTranslation("actors");
  let { app } = useParams<{ app?: string }>();
  if (appOverride) app = appOverride;
  if (!app) throw new Error("No app specified");
  return TenantModel(t, app, user);
};

export const TenantModelToSelectorData = (
  data: Record<keyof ReturnType<typeof TenantModel>["fields"], unknown>
): MultiSelectorData => ({
  value: data.id as string,
  label: data.path as string,
});

export const TenantModelSelectorSort: DataGridSortSetting[] = [
  { field: "path", direction: 1 },
];
