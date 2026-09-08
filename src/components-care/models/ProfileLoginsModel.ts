import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeDateTimeNullableRendererCC,
  ModelDataTypeEnumSelectRendererMUI,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";

export const LOGIN_STATUS_ACTIVE = "active";
export const LOGIN_STATUS_LOGGED_OUT = "logged-out";

/**
 * Renders the backend's boolean `active` attribute as a legible status.
 *
 * A backend that predates IMB#291 does not send `active` at all, and its index
 * only ever listed live sessions - so a missing value has to read as active
 * here. Taking it as falsy would label every session of every user as logged
 * out until the backend catches up.
 */
class LoginStatusType extends ModelDataTypeEnumSelectRendererMUI {
  deserialize = (value: unknown) =>
    value === false ? LOGIN_STATUS_LOGGED_OUT : LOGIN_STATUS_ACTIVE;
}

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
      active: {
        type: new LoginStatusType([
          {
            value: LOGIN_STATUS_ACTIVE,
            getLabel: () => t("profile:tabs.logins.status.active"),
          },
          {
            value: LOGIN_STATUS_LOGGED_OUT,
            getLabel: () => t("profile:tabs.logins.status.logged-out"),
          },
        ]),
        getLabel: () => t("profile:tabs.logins.fields.active"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityDisabled,
          edit: ModelVisibilityDisabled,
        },
        filterable: false,
        sortable: false,
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
          overview: ModelVisibilityGridView,
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
    new BackendConnector("v1/user/account_logins"),
  );

export const useProfileLoginsModel = () => {
  const { t } = useTranslation("profile");
  return ProfileLoginsModel(t);
};
