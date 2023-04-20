import React, { Suspense } from "react";
import {
  Loader,
  MaterialMenuItem,
  PortalLayout,
  RoutedMenu,
  SentryRoute,
  SentryRoutes,
  throwError,
  usePermissionContext,
} from "components-care";
import { List } from "@mui/material";
import {
  AllMenuItems,
  checkMenuItemPermission,
  useMenuDefinition,
} from "./MenuDef";
import Header from "./components/Header";
import ErrorBoundary from "../components/ErrorBoundary";

const NotFound = React.lazy(() => import("../NotFound"));
const Forbidden = React.lazy(() => import("../Forbidden"));

const Portal = () => {
  const [perms] = usePermissionContext();
  const menuDef = useMenuDefinition();

  return (
    <PortalLayout
      headerContent={<Header />}
      menuContent={
        <RoutedMenu
          definition={menuDef}
          wrapper={List}
          menuItem={MaterialMenuItem}
        />
      }
      content={
        <Suspense fallback={<Loader />}>
          <ErrorBoundary>
            <SentryRoutes>
              {AllMenuItems.filter((entry) => entry.route && entry.component)
                .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))
                .map((entry) => (
                  <SentryRoute
                    path={
                      entry.route
                        ? entry.route + "/*"
                        : throwError("missing route")
                    }
                    key={entry.route}
                    element={
                      checkMenuItemPermission(perms, entry) ? (
                        entry.component ? (
                          React.createElement(entry.component)
                        ) : (
                          throwError("logic error")
                        )
                      ) : (
                        <Forbidden />
                      )
                    }
                  />
                ))}
              <SentryRoute path={"*"} element={<NotFound />} />
            </SentryRoutes>
          </ErrorBoundary>
        </Suspense>
      }
      variant={"no-top-left"}
      drawerWidth={320}
    />
  );
};

export default React.memo(Portal);
