import i18n from "i18next";
import Backend from "i18next-chained-backend";
import LocalBackend from "i18next-localstorage-backend";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import supportedLanguages from "./assets/data/supported-languages.json";
import { MultiLanguageInputSupportedLanguages } from "components-care/dist/standalone/UIKit/InputControls/MultiLanguageInput";

export const SupportedLanguages =
  supportedLanguages as MultiLanguageInputSupportedLanguages[];

const isDev = process.env.NODE_ENV !== "production";
let release: string | null = process.env.REACT_APP_SENTRY_RELEASE ?? null;
if (!release || release === "dev" || isDev) {
  release = null;
}

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    debug: false, // process.env.NODE_ENV !== "production",
    ns: ["common"],
    defaultNS: "common",
    nonExplicitSupportedLngs: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      backends: [LocalBackend, HttpBackend],
      backendOptions: [
        {
          // prefix for stored languages
          prefix: "i18next_res_",
          // expiration
          expirationTime: release ? 30 * 24 * 60 * 60 * 1000 : 100, // only cache in production
          // Version applied to all languages, can be overriden using the option `versions`
          defaultVersion: release, // sentry release is git commit hash

          // language versions
          versions: {},

          // can be either window.localStorage or window.sessionStorage. Default: window.localStorage
          store: window.localStorage,
        },
        {
          loadPath: (lngs: string[], ns: string[]): string => {
            const lng = lngs[0].split("-")[0];
            const namespace = ns[0];
            return `/locales/${lng}/${namespace}.json`;
          },
        },
      ],
    },
  });

export default i18n;
