import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeDateTimeNullableRendererCC,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";

export const ProfileLoginsModel = (t: TFunction) =>
  new Model(
    "my-user-logins",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.logins.fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      location: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.logins.fields.location"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: false,
        sortable: false,
      },
      current: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => t("profile:tabs.logins.fields.current"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabledReadOnly,
          create: ModelVisibilityDisabled,
          edit: ModelVisibilityDisabled,
        },
        filterable: false,
        sortable: false,
      },
      device: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.logins.fields.device"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: false,
        sortable: false,
      },
      app: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.logins.fields.app"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: false,
        sortable: false,
      },
      created_at: {
        type: new ModelDataTypeDateTimeNullableRendererCC(),
        getLabel: () => t("profile:tabs.logins.fields.created_at"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: false,
        sortable: false,
      },
    },
    new BackendConnector("v1/user/account_logins")
  );

export const useProfileLoginsModel = () => {
  const { t } = useTranslation("profile");
  return ProfileLoginsModel(t);
};
