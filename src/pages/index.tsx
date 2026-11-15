import React, { Suspense } from "react";
import { Loader, Route, Routes } from "components-care";
import { AnonRoutes, AuthRoutes } from "./Routes";
import AuthPageLayout from "./Auth/components/AuthPageLayout";
import AuthProvider from "./components/AuthProvider";

// account pages and admin portal share one layout
const AccountLayout = React.lazy(() => import("./Account"));

const AuthPages = () => {
  return (
    <AuthPageLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          {AuthRoutes.map((entry) => (
            <Route
              key={entry.path}
              path={entry.path}
              element={React.createElement(entry.component)}
            />
          ))}
        </Routes>
      </Suspense>
    </AuthPageLayout>
  );
};

const AuthenticatedRoutes = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <AccountLayout />
      </Suspense>
    </AuthProvider>
  );
};

const RootPage = () => {
  return (
    <Routes>
      {[
        <Route
          key={"authentication"}
          path={"/login/:app/*"}
          element={<AuthPages />}
        />,
        ...AnonRoutes.map((entry) => (
          <Route
            key={entry.path}
            path={entry.path + "/*"}
            element={React.createElement(entry.component)}
          />
        )),
        <Route
          key={"authenticated"}
          path={"*"}
          element={<AuthenticatedRoutes />}
        />,
      ]}
    </Routes>
  );
};

export default React.memo(RootPage);
