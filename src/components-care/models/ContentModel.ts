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
import useApp from "../../utils/useApp";
import { MultiLanguageInputSupportedLanguages } from "components-care/dist/standalone/UIKit/InputControls/MultiLanguageInput";
import useAppLanguages from "../../utils/useAppLanguages";
import { useMemo } from "react";

export interface ContentModelParams {
  t: TFunction;
  appId: string;
  supportedLanguages: MultiLanguageInputSupportedLanguages[];
}

export const ContentModel = (params: ContentModelParams) =>
  new Model(
    "content",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => params.t("content:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      name: {
        type: new ModelDataTypeEnumSelectRenderer(
          ["tos", "privacy", "tos-privacy", "app-info"].map((value) => ({
            value: value,
            getLabel: () => params.t("content:enums.name." + value),
          })),
        ),
        getLabel: () => params.t("content:fields.name"),
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
        getLabel: () => params.t("content:fields.version"),
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
        getLabel: () => params.t("content:fields.active"),
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
        getLabel: () => params.t("content:fields.acceptance_required"),
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
          enabledLanguages: params.supportedLanguages,
          multiline: true,
          maxRows: 20,
          minRows: 5,
        }),
        getLabel: () => params.t("content:fields.content"),
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
    new BackendConnector(`v1/apps/${params.appId}/contents`),
    { app: params.appId },
  );

export const useContentModel = (params?: ContentModelParams) => {
  const { t } = useTranslation("content");
  const appId = useApp();
  const supportedLanguages = useAppLanguages(params?.appId ?? appId);
  return useMemo(
    () => ContentModel({ t, appId, supportedLanguages, ...params }),
    [t, appId, supportedLanguages, params],
  );
};
