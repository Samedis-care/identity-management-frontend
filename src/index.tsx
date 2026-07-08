import React from "react";
import RootPage from "./pages";
import * as Sentry from "@sentry/react";
import {
  ApiConnector,
  componentsCareBrowserTracingIntegration,
  ComponentsCareI18n,
  Framework,
  ModelFieldName,
  PageVisibility,
  setDefaultConnectorAPI,
} from "components-care";
import i18n from "./i18n";
import moment from "moment";
import "@fontsource/roboto";
import { getTheme } from "./theme";
import MarkedRenderer from "./components/MarkedRenderer";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { sanitizeHtml } from "./utils/sanitize";
import {
  IS_DEV,
  SentryDsn,
  SentryEnabled,
  SentryEnv,
  SentryRelease,
  SentrySamplingRate,
} from "./constants";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import BackendConnector from "./components-care/connectors/BackendConnector";
import BackendHttpClient from "./components-care/connectors/BackendHttpClient";
import "./components-care/patches/ImageTypeDeserializer";
import MaintenanceModeProvider from "./utils/MaintenanceMode";
import ErrorBoundary from "./pages/components/ErrorBoundary";
import BrowserCompatCheck from "./components/BrowserCompatCheck";
import { createRoot } from "react-dom/client";

// Sentry
Sentry.init({
  dsn: SentryEnabled ? SentryDsn : undefined,
  tunnel: "/api/error-reporting",
  integrations: [componentsCareBrowserTracingIntegration()],
  // performance trace sample rate
  tracesSampleRate: SentrySamplingRate,
  enabled: SentryEnabled,
  environment: SentryEnv,
  release: "identity-management-frontend@" + SentryRelease,
  beforeSend: (data, hint) => {
    if (hint?.originalException instanceof Error) {
      switch (hint.originalException.name) {
        case "NetworkError":
          return null;
        case "AuthError":
          return null;
      }
    }
    return data;
  },
});

// DOMPurify — reverse-tabnabbing hardening: any sanitized link that opens a
// new context must not leak window.opener. Registered once here at bootstrap
// (this entry module is in package.json "sideEffects") so every anchor passing
// through sanitizeHtml/sanitizeSvg is covered before the first render.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.hasAttribute("target")) {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// Marked — sanitize all rendered HTML as defense-in-depth XSS hardening.
// postprocess runs on the final HTML (after MarkedRenderer), so every
// marked() sink is covered from one place.
marked.use({
  renderer: MarkedRenderer,
  hooks: {
    postprocess: (html) => sanitizeHtml(html),
  },
});

// Dev Exports
if (IS_DEV) {
  // @ts-expect-error global export
  window.API = BackendHttpClient;
  // @ts-expect-error global export
  window.i18n = i18n;
}

// Components-Care i18n
ComponentsCareI18n.on("languageChanged", (language) => {
  moment.locale(language);
  i18n.changeLanguage(language);
});

// Components-Care Backend Config
setDefaultConnectorAPI(
  (
    endpoint,
    extraParams,
  ): ApiConnector<ModelFieldName, PageVisibility, unknown> => {
    return new BackendConnector(endpoint, "data", {}, extraParams);
  },
);

const domRoot = document.getElementById("root")!;
const root = createRoot(domRoot);
root.render(
  <React.StrictMode>
    <Framework defaultTheme={getTheme}>
      {IS_DEV && <ReactQueryDevtools buttonPosition={"bottom-right"} />}
      <ErrorBoundary>
        <BrowserCompatCheck>
          <MaintenanceModeProvider>
            <RootPage />
          </MaintenanceModeProvider>
        </BrowserCompatCheck>
      </ErrorBoundary>
    </Framework>
  </React.StrictMode>,
);
