import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeEnumSelectRendererMUI,
  ModelDataTypeImageRenderer,
  ModelDataTypeLocalizedStringRenderer,
  ModelDataTypeStringArrayBackendRenderer,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEdit,
  ModelVisibilityEditReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  ModelVisibilityGridViewHidden,
  ModelVisibilityView,
  validatePresence,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useMemo } from "react";
import useApp from "../../utils/useApp";
import { ACTOR_TYPES } from "./ActorListModel";
import { SupportedLanguages } from "../../i18n";
import { useParams } from "react-router-dom";

export const OrganizationModel = (
  t: TFunction,
  app: string,
  parent?: string | undefined | null,
  treeView: boolean = false,
  possibleTypes?: string[] | undefined | null,
  tenant?: string | null
) =>
  new Model(
    "organization",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      parent_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.parent_id"),
        customData: null,
        visibility: BackendVisibility,
      },
      insertable_child_types: {
        type: new ModelDataTypeStringArrayBackendRenderer(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
      leaf: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
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
      },
      active: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => t("actors:fields.active"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
        getDefaultValue: () => true,
      },
      actor_type: {
        type: new ModelDataTypeEnumSelectRendererMUI(
          (possibleTypes ?? ACTOR_TYPES).map((type) => ({
            value: type,
            getLabel: () => t("actors:enums.actor_type." + type),
          }))
        ),
        getLabel: () => t("actors:fields.actor_type"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditReadOnly,
        },
        validate: validatePresence,
      },
      name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.name"),
        customData: null,
        visibility: {
          // only path is a bit too long in tenant overview, so we enable title by default
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
        filterable: true,
        sortable: true,
      },
      title: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.title"),
        customData: null,
        visibility: {
          // only path is a bit too long in tenant overview, so we enable title by default
          overview: ModelVisibilityGridView,
          create: ModelVisibilityDisabledReadOnly,
          edit: ModelVisibilityDisabledReadOnly,
        },
        filterable: true,
        sortable: true,
      },
      title_translations: {
        type: new ModelDataTypeLocalizedStringRenderer({
          enabledLanguages: SupportedLanguages,
        }),
        getLabel: () => t("actors:fields.title"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      path: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.path"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityView,
          edit: ModelVisibilityView,
        },
        filterable: true,
        sortable: true,
      },
    },
    new BackendConnector(
      tenant
        ? parent
          ? `v1/apps/${app}/tenants/${tenant}/organizations_tree/${parent}`
          : `v1/apps/${app}/tenants/${tenant}/organizations_tree`
        : parent
        ? `v1/apps/${app}/organizations_tree/${parent}`
        : `v1/apps/${app}/organizations_tree`,
      null,
      undefined,
      undefined,
      {
        overrideRecordBase: tenant
          ? `v1/apps/${app}/tenants/${tenant}/organizations`
          : `v1/apps/${app}/organizations`,
      }
    ),
    { app, parent, tenant }
  );

export const useOrganizationModel = (
  parent?: string | null | undefined,
  treeView: boolean = false,
  possibleTypes?: string[] | undefined | null
) => {
  const app = useApp();
  const { tenant } = useParams<{ tenant?: string }>();
  const { t } = useTranslation("actors");
  return useMemo(
    () => OrganizationModel(t, app, parent, treeView, possibleTypes, tenant),
    [t, parent, app, treeView, possibleTypes, tenant]
  );
};
