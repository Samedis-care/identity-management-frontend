import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeEnumSelectRendererMUI,
  ModelDataTypeImageRenderer,
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
  throwError,
  useParams,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useMemo } from "react";

export const ACTOR_MAPPABLE_TYPES = [
  "user",
  "group",
  "ou",
  "position",
  "tenant",
];
export const ACTOR_TYPES = [
  "mapping",
  "container",
  "apps",
  "app",
  "tenants",
  "tenant",
  "group",
  "ou",
  "position",
  "user",
  "containertenants",
  "organization",
];

export interface ActorListModelParams {
  app: string;
  tenant?: string | null;
  user?: string | null;
  role?: string | null;
  org?: string | null;
}

export const ActorListModel = (
  t: TFunction,
  { app, tenant, user, role, org }: ActorListModelParams,
) =>
  new Model(
    "actor-list",
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
          ACTOR_TYPES.map((type) => ({
            value: type,
            getLabel: () => t("actors:enums.actor_type." + type),
          })),
        ),
        getLabel: () => t("actors:fields.actor_type"),
        customData: null,
        visibility: {
          overview: role
            ? ModelVisibilityGridView
            : ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditReadOnly,
        },
      },
      short_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.short_name"),
        customData: null,
        visibility: {
          overview: org
            ? ModelVisibilityGridView
            : ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityView,
          edit: ModelVisibilityView,
        },
        filterable: true,
        sortable: true,
      },
      name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("actors:fields.name"),
        customData: null,
        visibility: {
          overview: org
            ? ModelVisibilityGridView
            : ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityView,
          edit: ModelVisibilityView,
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
      // POST fields
      role_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
      actor_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
      map_actor_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
    },
    new BackendConnector(
      tenant
        ? org
          ? `v1/apps/${app}/tenants/${tenant}/organizations/${org}/mappings`
          : user
            ? `v1/apps/${app}/tenants/${tenant}/users/${user}/actors`
            : throwError("Unknown endpoint")
        : role
          ? `v1/apps/${app}/roles/${role}/actors`
          : user
            ? `v1/apps/${app}/users/${user}/actors`
            : throwError("No tenant ID supplied or unknown endpoint"),
      null,
      undefined,
      undefined,
      {
        overrideRecordBase:
          role && !tenant
            ? `v1/apps/${app}/roles/${role}/actor_roles`
            : undefined,
      },
    ),
    { app, role, user, tenant, org },
  );

export const useActorListModel = (
  params: Omit<ActorListModelParams, "app"> & { app?: string | null },
) => {
  const { t } = useTranslation("actors");
  const { app, tenant } = useParams();
  if (!params.app) params = { ...params, app };
  if (!params.tenant && tenant) params = { ...params, tenant };
  return useMemo(
    () => ActorListModel(t, params as ActorListModelParams),
    [t, params],
  );
};
