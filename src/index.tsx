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
import { ReactQueryDevtools } from "react-query/devtools";
import { IS_DEV } from "./constants";
import BackendConnector from "./components-care/connectors/BackendConnector";
import BackendHttpClient from "./components-care/connectors/BackendHttpClient";
import "./components-care/patches/ImageTypeDeserializer";
import MaintenanceModeProvider from "./utils/MaintenanceMode";
import ErrorBoundary from "./pages/components/ErrorBoundary";
import BrowserCompatCheck from "./components/BrowserCompatCheck";
import { createRoot } from "react-dom/client";

// Sentry
const sentryEnabled = process.env.REACT_APP_SENTRY_ENABLED === "true";
Sentry.init({
  dsn: sentryEnabled ? process.env.REACT_APP_SENTRY_DSN : undefined,
  tunnel: "/api/error-reporting",
  integrations: [componentsCareBrowserTracingIntegration()],
  // performance trace sample rate
  tracesSampleRate: parseFloat(
    process.env.REACT_APP_SENTRY_SAMPLE_RATE ?? "0.0",
  ),
  enabled: sentryEnabled,
  environment: process.env.REACT_APP_SENTRY_ENV,
  release:
    "identity-management-frontend@" + process.env.REACT_APP_SENTRY_RELEASE,
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

// Marked
marked.use({ renderer: MarkedRenderer });

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
      {IS_DEV && <ReactQueryDevtools position={"bottom-right"} />}
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
