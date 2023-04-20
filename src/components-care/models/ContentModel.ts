import {
  Model,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeEnumSelectRenderer,
  ModelDataTypeIntegerRendererCC,
  ModelDataTypeLocalizedStringRenderer,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import { SupportedLanguages } from "../../i18n";
import useApp from "../../utils/useApp";

export const ContentModel = (t: TFunction, app: string) =>
  new Model(
    "content",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("content:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      name: {
        type: new ModelDataTypeEnumSelectRenderer(
          ["tos", "privacy", "tos-privacy", "app-info"].map((value) => ({
            value: value,
            getLabel: () => t("content:enums.name." + value),
          }))
        ),
        getLabel: () => t("content:fields.name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      version: {
        type: new ModelDataTypeIntegerRendererCC(),
        getLabel: () => t("content:fields.version"),
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
        getLabel: () => t("content:fields.active"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      acceptance_required: {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => t("content:fields.acceptance_required"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
      content_translations: {
        type: new ModelDataTypeLocalizedStringRenderer({
          enabledLanguages: SupportedLanguages,
          multiline: true,
          maxRows: 20,
          minRows: 5,
        }),
        getLabel: () => t("content:fields.content"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        filterable: true,
        sortable: true,
      },
    },
    new BackendConnector(`v1/apps/${app}/contents`),
    { app }
  );

export const useContentModel = (appOverride?: string) => {
  const { t } = useTranslation("content");
  let app = useApp();
  if (appOverride) app = appOverride;
  return ContentModel(t, app);
};
