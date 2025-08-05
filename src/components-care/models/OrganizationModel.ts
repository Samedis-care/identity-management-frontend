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
  useParams,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useMemo } from "react";
import useApp from "../../utils/useApp";
import { ACTOR_TYPES } from "./ActorListModel";
import { MultiLanguageInputSupportedLanguages } from "components-care/dist/standalone/UIKit/InputControls/MultiLanguageInput";
import useAppLanguages from "../../utils/useAppLanguages";

export interface OrganizationModelParams {
  t: TFunction;
  appId: string;
  supportedLanguages: MultiLanguageInputSupportedLanguages[];
  parentId?: string | undefined | null;
  /**
   * @default false
   */
  treeView?: boolean;
  possibleTypes?: string[] | undefined | null;
  tenantId?: string | null;
}

export const OrganizationModel = (params: OrganizationModelParams) =>
  new Model(
    "organization",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => params.t("actors:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      parent_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => params.t("actors:fields.parent_id"),
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
        getLabel: () => params.t("actors:fields.image"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      active: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => params.t("actors:fields.active"),
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
          (params.possibleTypes ?? ACTOR_TYPES).map((type) => ({
            value: type,
            getLabel: () => params.t("actors:enums.actor_type." + type),
          })),
        ),
        getLabel: () => params.t("actors:fields.actor_type"),
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
        getLabel: () => params.t("actors:fields.name"),
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
        getLabel: () => params.t("actors:fields.title"),
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
          enabledLanguages: params.supportedLanguages,
        }),
        getLabel: () => params.t("actors:fields.title"),
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
        getLabel: () => params.t("actors:fields.path"),
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
      params.tenantId
        ? params.parentId
          ? `v1/apps/${params.appId}/tenants/${params.tenantId}/organizations_tree/${params.parentId}`
          : `v1/apps/${params.appId}/tenants/${params.tenantId}/organizations_tree`
        : params.parentId
          ? `v1/apps/${params.appId}/organizations_tree/${params.parentId}`
          : `v1/apps/${params.appId}/organizations_tree`,
      null,
      undefined,
      undefined,
      {
        overrideRecordBase: params.tenantId
          ? `v1/apps/${params.appId}/tenants/${params.tenantId}/organizations`
          : `v1/apps/${params.appId}/organizations`,
      },
    ),
    { app: params.appId, parent: params.parentId, tenant: params.tenantId },
  );

export const useOrganizationModel = (
  parent?: string | null | undefined,
  treeView: boolean = false,
  possibleTypes?: string[] | undefined | null,
) => {
  const app = useApp();
  const { tenant } = useParams();
  const { t } = useTranslation("actors");
  const supportedLanguages = useAppLanguages(app);
  return useMemo(
    () =>
      OrganizationModel({
        t,
        appId: app,
        supportedLanguages,
        parentId: parent,
        treeView,
        possibleTypes,
        tenantId: tenant,
      }),
    [t, app, supportedLanguages, parent, treeView, possibleTypes, tenant],
  );
};
