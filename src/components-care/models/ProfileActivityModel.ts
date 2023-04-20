import {
  Model,
  ModelDataTypeDateTimeNullableRendererCC,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";

export const ProfileActivityModel = (t: TFunction) =>
  new Model(
    "my-user-activity",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.activity.fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      location: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.activity.fields.location"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      device: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.activity.fields.device"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      app: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("profile:tabs.activity.fields.app"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      created_at: {
        type: new ModelDataTypeDateTimeNullableRendererCC(),
        getLabel: () => t("profile:tabs.activity.fields.created_at"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
    },
    new BackendConnector("v1/user/account_activity")
  );

export const useProfileActivityModel = () => {
  const { t } = useTranslation("profile");
  return ProfileActivityModel(t);
};
