import React from "react";
import {
  Model,
  ModelDataTypeBooleanCheckboxRendererCC,
  ModelDataTypeBooleanCheckboxRendererMUI,
  ModelDataTypeColorRendererCC,
  ModelDataTypeEnumMultiSelectRenderer,
  ModelDataTypeEnumSelectRenderer,
  ModelDataTypeEnumSelectRendererMUI,
  ModelDataTypeImageRenderer,
  ModelDataTypeIntegerRendererCC,
  ModelDataTypeLocalizedStringRenderer,
  ModelDataTypeStringRendererCC,
  ModelDataTypeStringRendererMUI,
  ModelVisibilityDisabled,
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityEdit,
  ModelVisibilityEditRequired,
  ModelVisibilityGridView,
  validatePresence,
} from "components-care";
import BackendConnector from "../connectors/BackendConnector";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { BackendVisibility } from "./Visibilities";
import LOCALE_OPTIONS from "components-care/dist/assets/data/supported-locales.json";
import { SupportedLanguages } from "../../i18n";
import { InputAdornment } from "@mui/material";
import { useCCLocaleSwitcherTranslations } from "components-care/dist/utils/useCCTranslations";

const translateLocale = (t: TFunction, locale: string) =>
  `${t(`locale-switcher:${locale}.language`)} (${t(
    `locale-switcher:${locale}.country`,
  )})`;

export type AppAdminModelOptions = Partial<{
  enableSeeding: boolean;
  appLocales?: string[];
}>;

export const AppAdminModel = (
  t: TFunction,
  ccT: TFunction,
  options?: AppAdminModelOptions,
) =>
  new Model(
    "app-admin",
    {
      id: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.id"),
        customData: null,
        visibility: BackendVisibility,
      },
      name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      full_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.full_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      short_name: {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.short_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityGridView,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      import_roles: {
        type: new ModelDataTypeStringRendererMUI({
          multiline: true,
          maxRows: 5,
        }),
        getLabel: () => t("app-admin:fields.import_roles"),
        customData: null,
        visibility: options?.enableSeeding
          ? {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityEditRequired,
              edit: ModelVisibilityEditRequired,
            }
          : {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityDisabledReadOnly,
              edit: ModelVisibilityDisabledReadOnly,
            },
        validate: validatePresence,
      },
      locale_import_roles: {
        type: new ModelDataTypeLocalizedStringRenderer({
          enabledLanguages: SupportedLanguages,
          variant: "outlined",
          multiline: true,
          maxRows: 5,
        }),
        getLabel: () => t("app-admin:fields.locale_import_roles"),
        customData: null,
        visibility: options?.enableSeeding
          ? {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityEditRequired,
              edit: ModelVisibilityEditRequired,
            }
          : {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityDisabledReadOnly,
              edit: ModelVisibilityDisabledReadOnly,
            },
        validate: validatePresence,
      },
      import_candos: {
        type: new ModelDataTypeStringRendererMUI({
          multiline: true,
          maxRows: 5,
        }),
        getLabel: () => t("app-admin:fields.import_candos"),
        customData: null,
        visibility: options?.enableSeeding
          ? {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityEditRequired,
              edit: ModelVisibilityEditRequired,
            }
          : {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityDisabledReadOnly,
              edit: ModelVisibilityDisabledReadOnly,
            },
        validate: validatePresence,
      },
      locale_import_candos: {
        type: new ModelDataTypeLocalizedStringRenderer({
          enabledLanguages: SupportedLanguages,
          variant: "outlined",
          multiline: true,
          maxRows: 5,
        }),
        getLabel: () => t("app-admin:fields.locale_import_candos"),
        customData: null,
        visibility: options?.enableSeeding
          ? {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityEditRequired,
              edit: ModelVisibilityEditRequired,
            }
          : {
              overview: ModelVisibilityDisabled,
              create: ModelVisibilityDisabledReadOnly,
              edit: ModelVisibilityDisabledReadOnly,
            },
        validate: validatePresence,
      },
      "config.url": {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.config.url"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      "config.uses_bearer_token": {
        type: new ModelDataTypeBooleanCheckboxRendererMUI(),
        getLabel: () => t("app-admin:fields.config.uses_bearer_token"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      "config.locales": {
        type: new ModelDataTypeEnumMultiSelectRenderer(
          LOCALE_OPTIONS.map((entry) => ({
            value: entry,
            getLabel: () => translateLocale(ccT, entry),
          })).sort((a, b) => a.getLabel().localeCompare(b.getLabel())),
        ),
        getLabel: () => t("app-admin:fields.config.locales"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      "config.default_locale": {
        type: new ModelDataTypeEnumSelectRendererMUI(
          (options?.appLocales ?? LOCALE_OPTIONS).map((entry) => ({
            value: entry,
            getLabel: () => translateLocale(ccT, entry),
          })),
        ),
        getLabel: () => t("app-admin:fields.config.default_locale"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
        validate: (value: string, values: Record<string, unknown>) => {
          if (
            !(
              values as {
                config?: {
                  locales?: string[];
                };
              }
            ).config?.locales?.includes(value)
          ) {
            return t("app-admin:validations.config.default_locale.not-in-set");
          }
          return null;
        },
      },
      "config.mailer.from": {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.config.mailer.from"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEditRequired,
          edit: ModelVisibilityEditRequired,
        },
      },
      "config.mailer.reply_to": {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.config.mailer.reply_to"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.support_email": {
        type: new ModelDataTypeStringRendererMUI(),
        getLabel: () => t("app-admin:fields.config.mailer.support_email"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.logo_b64": {
        type: new ModelDataTypeImageRenderer(),
        getLabel: () => t("app-admin:fields.config.mailer.logo_b64"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.footer_html_translations": {
        type: new ModelDataTypeLocalizedStringRenderer({
          multiline: true,
          enabledLanguages: SupportedLanguages,
        }),
        getLabel: () => t("app-admin:fields.config.mailer.footer_html"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
        validate: (value: Record<string, string>) => {
          if (!(SupportedLanguages[0] in value && value[SupportedLanguages[0]]))
            return t(
              "app-admin:validations.config.mailer.footer_html_translations.fallback-missing",
            );
          return null;
        },
      },
      "config.mailer.smtp_settings.address": {
        type: new ModelDataTypeStringRendererCC(),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.address"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.port": {
        type: new ModelDataTypeIntegerRendererCC(),
        getLabel: () => t("app-admin:fields.config.mailer.smtp_settings.port"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.domain": {
        type: new ModelDataTypeStringRendererCC(),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.domain"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.user_name": {
        type: new ModelDataTypeStringRendererCC({ autoComplete: "off" }),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.user_name"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.password": {
        type: new ModelDataTypeStringRendererCC({
          type: "password",
          autoComplete: "off",
        }),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.password"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.authentication": {
        type: new ModelDataTypeEnumSelectRenderer(
          ["", "plain", "login", "cram_md5"].map((value) => ({
            value,
            getLabel: () =>
              t(
                "app-admin:enums.config.mailer.smtp_settings.authentication." +
                  value,
              ),
          })),
        ),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.authentication"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.enable_starttls": {
        type: new ModelDataTypeBooleanCheckboxRendererCC(),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.enable_starttls"),
        getDefaultValue: () => false,
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.enable_starttls_auto": {
        type: new ModelDataTypeBooleanCheckboxRendererCC(),
        getLabel: () =>
          t(
            "app-admin:fields.config.mailer.smtp_settings.enable_starttls_auto",
          ),
        getDefaultValue: () => true,
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.openssl_verify_mode": {
        type: new ModelDataTypeEnumSelectRenderer(
          ["", "none", "peer"].map((value) => ({
            value,
            getLabel: () =>
              t(
                "app-admin:enums.config.mailer.smtp_settings.openssl_verify_mode." +
                  value,
              ),
          })),
        ),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.openssl_verify_mode"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.ssl": {
        type: new ModelDataTypeBooleanCheckboxRendererCC(),
        getLabel: () => t("app-admin:fields.config.mailer.smtp_settings.ssl"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.open_timeout": {
        type: new ModelDataTypeIntegerRendererCC({
          InputProps: {
            endAdornment: (
              <InputAdornment position={"end"}>
                {t(
                  "app-admin:fields.config.mailer.smtp_settings.open_timeout_unit",
                )}
              </InputAdornment>
            ),
          },
        }),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.open_timeout"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.mailer.smtp_settings.read_timeout": {
        type: new ModelDataTypeIntegerRendererCC({
          InputProps: {
            endAdornment: (
              <InputAdornment position={"end"}>
                {t(
                  "app-admin:fields.config.mailer.smtp_settings.read_timeout_unit",
                )}
              </InputAdornment>
            ),
          },
        }),
        getLabel: () =>
          t("app-admin:fields.config.mailer.smtp_settings.read_timeout"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.primary.main": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.primary.main"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.primary.dark": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.primary.dark"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.primary.light": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.primary.light"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.secondary.main": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.secondary.main"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.secondary.dark": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.secondary.dark"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.secondary.light": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.secondary.light"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.background.default": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.background.default"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.background.advanced": {
        type: new ModelDataTypeStringRendererCC(),
        getLabel: () => t("app-admin:fields.config.theme.background.advanced"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.components_care.ui_kit.action_button.background_color": {
        type: new ModelDataTypeColorRendererCC(),
        getLabel: () =>
          t(
            "app-admin:fields.config.theme.components_care.ui_kit.action_button.background_color",
          ),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
      "config.theme.mode": {
        type: new ModelDataTypeEnumSelectRendererMUI([
          {
            value: "light",
            getLabel: () => t("app-admin:enums.config.theme.mode.light"),
          },
          {
            value: "dark",
            getLabel: () => t("app-admin:enums.config.theme.mode.dark"),
          },
        ]),
        getLabel: () => t("app-admin:fields.config.theme.mode"),
        customData: null,
        visibility: {
          overview: ModelVisibilityDisabled,
          create: ModelVisibilityEdit,
          edit: ModelVisibilityEdit,
        },
      },
    },
    new BackendConnector("v1/app_admin"),
  );

export const useAppAdminModel = (options?: AppAdminModelOptions) => {
  const { t } = useTranslation(["app-admin"]);
  const { t: ccT } = useCCLocaleSwitcherTranslations();
  return AppAdminModel(t, ccT, options);
};
