import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeDateTimeNullableRendererCC,
  ModelDataTypeEnumRadioRendererMUI,
  ModelDataTypeEnumSelectRendererMUI,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityEdit,
  ModelVisibilityEditReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  ModelVisibilityGridViewHidden,
  useParams,
  validateOptional,
  validateEmail,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";

export const UserModel = (
  t: TFunction,
  app?: string,
  tenant?: string,
  resetPwd = false,
) =>
  new Model(
    "user",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      actor_id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.actor_id"),
        customData: null,
        visibility: BackendVisibility,
      },
      email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: app
            ? ModelVisibilityEditReadOnly
            : ModelVisibilityEditRequired,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      recovery_email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.recovery_email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditReadOnly,
          edit: ModelVisibilityEditReadOnly,
        },
        filterable: true,
        sortable: true,
        validate: validateOptional(validateEmail),
      },
      unconfirmed_recovery_email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.unconfirmed_recovery_email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditReadOnly,
          edit: ModelVisibilityEditReadOnly,
        },
        filterable: true,
        sortable: true,
      },
      username: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.username"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: app
            ? ModelVisibilityEditReadOnly
            : ModelVisibilityEditRequired,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      set_password: {
        type: new ModelDataTypeStringRendererMUI({ type: "password" }),
        getLabel: () => t("users:fields.set_password"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: !app
            ? ModelVisibilityEditRequired
            : resetPwd
              ? ModelVisibilityEditReadOnly
              : ModelVisibilityDisabled,
          edit: resetPwd
            ? ModelVisibilityEditReadOnly
            : ModelVisibilityDisabled,
        },
      },
      first_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.first_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: app
            ? ModelVisibilityEditReadOnly
            : ModelVisibilityEditRequired,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      last_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("users:fields.last_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: app
            ? ModelVisibilityEditReadOnly
            : ModelVisibilityEditRequired,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      gender: {
        type: new ModelDataTypeEnumRadioRendererMUI(
          [0, 1, 2].map((e) => ({
            value: e.toString(),
            getLabel: () => t("users:enums.gender." + e),
          })),
          true,
          (e) => e,
          true,
        ),
        getLabel: () => t("users:fields.gender"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: app ? ModelVisibilityEditReadOnly : ModelVisibilityEdit,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEdit,
        },
      },
      locale: {
        type: new ModelDataTypeEnumSelectRendererMUI(
          ["", "en-US", "de-DE"].map((locale) => ({
            value: locale,
            getLabel: () =>
              t("users:enums.locales." + (locale || "unspecified")),
          })),
        ),
        getLabel: () => t("users:fields.locale"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: app ? ModelVisibilityEditReadOnly : ModelVisibilityEdit,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEdit,
        },
      },
      active: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => t("users:fields.active"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: app ? ModelVisibilityEditReadOnly : ModelVisibilityEdit,
          edit: app ? ModelVisibilityEditReadOnly : ModelVisibilityEdit,
        },
      },
      invalid_at: {
        type: new ModelDataTypeDateTimeNullableRendererCC(),
        getLabel: () => t("users:fields.invalid_at"),
        customData: null,
        visibility: BackendVisibility,
      },
      updated_at: {
        type: new ModelDataTypeDateTimeNullableRendererCC(),
        getLabel: () => t("users:fields.updated_at"),
        customData: null,
        visibility: BackendVisibility,
      },
    },
    new BackendConnector(
      tenant
        ? `v1/apps/${app}/tenants/${tenant}/users`
        : app
          ? `v1/apps/${app}/users`
          : "v1/users",
      undefined,
      undefined,
      undefined,
      {
        overrideRecordBaseDelete: tenant
          ? `v1/access_control/apps/${app}/tenant/${tenant}/users`
          : undefined,
      },
    ),
    { app, tenant },
  );

export const useUserModel = (
  appOverride?: string,
  tenantOverride?: string,
  resetPwd = false,
) => {
  const { t } = useTranslation("users");
  let { app, tenant } = useParams<"app" | "tenant">();
  if (appOverride) app = appOverride;
  if (tenantOverride) tenant = tenantOverride;
  return UserModel(t, app, tenant, resetPwd);
};
