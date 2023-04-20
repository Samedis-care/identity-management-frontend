import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityEdit,
  ModelVisibilityEditRequired,
  ModelVisibilityGridEdit,
  ModelVisibilityGridView,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";

export const EmailBlacklistModel = (t: TFunction) =>
  new Model(
    "email-blacklist",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("email-blacklist:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      domain: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("email-blacklist:fields.domain"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      active: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => t("email-blacklist:fields.active"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridEdit,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
        columnWidth: [0, 160],
        filterable: true,
        sortable: true,
      },
    },
    new BackendConnector("v1/email_blacklist")
  );

export const useEmailBlacklistModel = () => {
  const { t } = useTranslation("email-blacklist");
  return EmailBlacklistModel(t);
};
