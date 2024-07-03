import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeImageRenderer,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityEdit,
  ModelVisibilityEditReadOnly,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  ModelVisibilityGridViewHidden,
  useLocation,
  validateEmail,
  validateOptional,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { useMemo } from "react";

export interface ProfileModelParams {
  t: TFunction;
  app: string;
}

export const ProfileModel = ({ t, app }: ProfileModelParams) =>
  new Model(
    "my-user",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      unconfirmed_email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.unconfirmed_email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditReadOnly,
          edit: ModelVisibilityEditReadOnly,
        },
        filterable: true,
        sortable: true,
      },
      recovery_email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.recovery_email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditReadOnly,
          edit: ModelVisibilityEdit,
        },
        filterable: true,
        sortable: true,
        validate: validateOptional(validateEmail),
      },
      unconfirmed_recovery_email: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.unconfirmed_recovery_email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridViewHidden,
          create: ModelVisibilityEditReadOnly,
          edit: ModelVisibilityEditReadOnly,
        },
        filterable: true,
        sortable: true,
      },
      mobile: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.mobile"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      first_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.first_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      last_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:fields.last_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      image: {
        type: new ModelDataTypeImageRenderer({ variant: "profile_picture" }),
        getLabel: () => t("profile:fields.image"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      current_password: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () =>
          t(
            "profile:tabs.account.dialogs.reset-password.fields.current-password",
          ),
        customData: null,
        visibility: BackendVisibility,
        filterable: true,
        sortable: true,
      },
      password: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () =>
          t("profile:tabs.account.dialogs.reset-password.fields.new-password"),
        customData: null,
        visibility: BackendVisibility,
        filterable: true,
        sortable: true,
      },
      password_confirmation: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () =>
          t(
            "profile:tabs.account.dialogs.reset-password.fields.new-password-repeat",
          ),
        customData: null,
        visibility: BackendVisibility,
        filterable: true,
        sortable: true,
      },
      otp_enabled: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
      /* fields not present at all times, so not handled via model
      otp_enable: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
      otp_secret_key: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
      otp_provisioning_qr_code: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => "",
        customData: null,
        visibility: BackendVisibility,
      },
       */
    },
    new BackendConnector(`v1/${app}/user`, undefined, undefined, undefined, {
      singleton: true,
    }),
  );

export const useProfileModel = () => {
  const { t } = useTranslation("profile");
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const app = query.get("app");
  return useMemo(
    () => ProfileModel({ app: app ?? "identity-management", t }),
    [app, t],
  );
};
