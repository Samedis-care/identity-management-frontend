import React, { Suspense } from "react";
import { styled } from "@mui/material";
import { Loader, Route, Routes, usePermissionContext } from "components-care";
import { useTranslation } from "react-i18next";
import ErrorBoundary from "../../components/ErrorBoundary";
import { AllMenuItems, checkMenuItemPermission } from "../../AdminUI/MenuDef";
import ProfileRedirect from "../../AdminUI/ProfileRedirect";
import { ACCOUNT_BASE } from "../constants";
import useIsAdminPage from "../useIsAdminPage";
import AdminFrame from "./AdminFrame";

const ProfileSection = React.lazy(() => import("../pages/ProfileSection"));
const SecuritySection = React.lazy(() => import("../pages/SecuritySection"));
const DevicesSection = React.lazy(() => import("../pages/DevicesSection"));
const AppsSection = React.lazy(() => import("../pages/AppsSection"));
const NotFound = React.lazy(() => import("../../NotFound"));
const Forbidden = React.lazy(() => import("../../Forbidden"));

// admin routes, the longest first so nested app/tenant routes win
const ADMIN_ROUTES = AllMenuItems.filter(
  (entry) => entry.route && entry.component,
).sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0));

const ACCOUNT_ROUTES = (
  <Routes>
    <Route path={"security/*"} element={<SecuritySection />} />
    <Route path={"devices/*"} element={<DevicesSection />} />
    {/* former tabs of the profile page */}
    <Route path={"logins/*"} element={<DevicesSection />} />
    <Route path={"activity/*"} element={<DevicesSection />} />
    <Route path={"apps/*"} element={<AppsSection />} />
    <Route path={"*"} element={<ProfileSection />} />
  </Routes>
);

// positioned, but not scrolling: the containing block of the form button bar,
// which therefore stays at the bottom while the page scrolls
const Root = styled("div")({
  position: "relative",
  flexGrow: 1,
  minHeight: 0,
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

// the account pages leave room below their box, the admin frame fills the height
const Scroller = styled("div")(({ theme }) => ({
  flexGrow: 1,
  minHeight: 0,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  background: theme.palette.brand.pageGradient,
  paddingBottom: theme.spacing(4),
  "&.admin": { paddingBottom: 0 },
}));

/** content area of the account layout: the account pages and the admin portal */
const AccountContent = () => {
  const { t } = useTranslation("account");
  const [perms] = usePermissionContext();
  const adminPage = useIsAdminPage();
  return (
    <Root>
      <Scroller className={adminPage ? "admin" : undefined}>
        <Suspense fallback={<Loader />}>
          <ErrorBoundary>
            <Routes>
              {[
                <Route key={"root"} path={"/"} element={<ProfileRedirect />} />,
                // the profile inside the former admin portal
                <Route
                  key={"profile"}
                  path={"/profile/*"}
                  element={<ProfileRedirect />}
                />,
                <Route
                  key={"account"}
                  path={`${ACCOUNT_BASE}/*`}
                  element={ACCOUNT_ROUTES}
                />,
                ...ADMIN_ROUTES.map((entry) => (
                  <Route
                    key={entry.route}
                    path={entry.route + "/*"}
                    element={
                      checkMenuItemPermission(perms, entry) ? (
                        <AdminFrame title={t(entry.title)}>
                          {React.createElement(entry.component!)}
                        </AdminFrame>
                      ) : (
                        <Forbidden />
                      )
                    }
                  />
                )),
                <Route key={"not-found"} path={"*"} element={<NotFound />} />,
              ]}
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </Scroller>
    </Root>
  );
};

export default React.memo(AccountContent);
