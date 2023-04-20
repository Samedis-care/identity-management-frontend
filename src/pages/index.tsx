import React, { Suspense } from "react";
import { Loader, SentryRoute, SentryRoutes } from "components-care";
import { AnonRoutes, AuthRoutes, ExternalAuthenticatedRoutes } from "./Routes";
import AuthPageLayout from "./Auth/components/AuthPageLayout";
import AuthProvider from "./components/AuthProvider";

const Portal = React.lazy(() => import("./AdminUI"));

const AuthPages = () => {
  return (
    <AuthPageLayout>
      <Suspense fallback={<Loader />}>
        <SentryRoutes>
          {AuthRoutes.map((entry) => (
            <SentryRoute
              key={entry.path}
              path={entry.path}
              element={React.createElement(entry.component)}
            />
          ))}
        </SentryRoutes>
      </Suspense>
    </AuthPageLayout>
  );
};

const AuthenticatedRoutes = () => {
  return (
    <AuthProvider>
      <SentryRoutes>
        {ExternalAuthenticatedRoutes.map((entry) => (
          <SentryRoute
            key={entry.path}
            path={entry.path + "/*"}
            element={React.createElement(entry.component)}
          />
        ))}
        <SentryRoute path={"*"} element={<Portal />} />
      </SentryRoutes>
    </AuthProvider>
  );
};

const RootPage = () => {
  return (
    <SentryRoutes>
      <SentryRoute path={"/login/:app/*"} element={<AuthPages />} />
      {AnonRoutes.map((entry) => (
        <SentryRoute
          key={entry.path}
          path={entry.path + "/*"}
          element={React.createElement(entry.component)}
        />
      ))}
      <SentryRoute path={"*"} element={<AuthenticatedRoutes />} />
    </SentryRoutes>
  );
};

export default React.memo(RootPage);
