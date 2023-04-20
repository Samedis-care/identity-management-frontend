import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeLocalizedStringRenderer,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  ModelVisibilityGridViewHidden,
  ModelVisibilityHidden,
  MultiSelectorData,
  throwError,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useParams } from "react-router-dom";
import { DataGridSortSetting } from "components-care/dist/standalone/DataGrid/DataGrid";
import { SupportedLanguages } from "../../i18n";

export interface FunctionalityModelParams {
  app: string;
  user?: string | null;
  tenant?: string | null;
  role?: string | null;
  picker?: boolean;
}

export const FunctionalityModel = (
  t: TFunction,
  { app, user, tenant, role, picker }: FunctionalityModelParams
) =>
  new Model(
    "functionality",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("functionality:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      title: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("functionality:fields.title"),
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
        getLabel: () => t("functionality:fields.title"),
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
        type: new ModelDataTypeStringRendererMUI({ multiline: true }),
        getLabel: () => t("functionality:fields.description"),
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
        getLabel: () => t("functionality:fields.description"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      app: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("functionality:fields.app"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityDisabledReadOnly,
          edit: ModelVisibilityDisabledReadOnly,
        },
        filterable: true,
        sortable: true,
      },
      module: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("functionality:fields.module"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      ident: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("functionality:fields.ident"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      // if picker for role
      already_in_role: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
        filterable: false,
        sortable: false,
      },
      functionality_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
    },
    new BackendConnector(
      tenant
        ? user
          ? `v1/apps/${app}/tenants/${tenant}/users/${user}/functionalities`
          : throwError("invalid config")
        : role
        ? picker
          ? `v1/apps/${app}/picker/roles/${role}/functionalities`
          : `v1/apps/${app}/roles/${role}/functionalities`
        : user
        ? `v1/apps/${app}/users/${user}/functionalities`
        : `v1/apps/${app}/functionalities`
    ),
    {
      app,
      user,
      tenant,
      role,
      picker,
    }
  );

export const useFunctionalityModel = (
  params?: Omit<FunctionalityModelParams, "app"> & { app?: string }
) => {
  const { t } = useTranslation("functionality");
  let { app, tenant } = useParams<{ app?: string; tenant?: string }>();
  if (!app) throw new Error("No app specified");
  return FunctionalityModel(t, {
    app,
    tenant,
    ...params,
  });
};

export const FunctionalityModelToSelectorData = (
  data: Record<keyof ReturnType<typeof FunctionalityModel>["fields"], unknown>
): MultiSelectorData => ({
  value: data.id as string,
  label: `${data.app}/${data.module}.${data.ident}`,
});

export const FunctionalityModelSelectorSort: DataGridSortSetting[] = [
  { field: "app", direction: 1 },
  { field: "module", direction: 1 },
  { field: "ident", direction: 1 },
];
