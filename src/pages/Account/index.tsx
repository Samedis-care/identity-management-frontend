/*
 * Account pages: profile, sign-in and security, devices and
 * activity, connected applications. The navigation position is a user setting
 * (user menu top right, stored in the browser):
 * - left: components-care PortalLayout + RoutedMenu + MaterialMenuItem
 * - top: navy top bar with a horizontal menu (components-care RoutedMenu
 *   logic, own renderer like SamedisMenu in samedis-care-frontend)
 * The admin pages of IM (apps, email blacklist, users) live in the same
 * layout: users with IM admin rights get an "Administration" group, which shows
 * the entries of the app or tenant they are in once they open one.
 */
import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
  hasPermission,
  Loader,
  MaterialMenuItem,
  PortalLayout,
  Route,
  RoutedMenu,
  Routes,
  useLocation,
  useNavigate,
  usePermissionContext,
  usePortalLayoutContext,
} from "components-care";
import type { IRoutedMenuItemDefinition } from "components-care/dist/non-standalone/Portal/Menu";
import {
  AppBar,
  Box,
  Paper,
  List,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  AppsOutlined,
  BlockOutlined,
  DevicesOutlined,
  GroupOutlined,
  LinkOutlined,
  LockOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthProviderContext } from "../components/AuthProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  AllMenuItems,
  checkMenuItemPermission,
  useMenuDefinition,
} from "../AdminUI/MenuDef";
import ProfileRedirect from "../AdminUI/ProfileRedirect";
import {
  AccountAppContext,
  DEFAULT_ACCOUNT_APP,
} from "../../utils/useAccountApp";
import AccountHeader, { MenuPosition } from "./components/AccountHeader";
import AccountMenu from "./components/AccountMenu";
import { PageTitle as AdminTitle } from "./components/AccountPage";
import AppIndicator from "./components/AppIndicator";
import TenantIndicator from "./components/TenantIndicator";
import { useMyApps } from "./useMyApps";
import { ACCOUNT_BASE } from "./constants";
import { AdminTitleContext } from "../AdminUI/AdminTitle";
import { ImFormPageLayoutClassName } from "../../components-care/ImFormPageLayout";
import { ImCrudFormClassName } from "../../components-care/ImCrud";

const ProfileSection = React.lazy(() => import("./pages/ProfileSection"));
const SecuritySection = React.lazy(() => import("./pages/SecuritySection"));
const DevicesSection = React.lazy(() => import("./pages/DevicesSection"));
const AppsSection = React.lazy(() => import("./pages/AppsSection"));
const NotFound = React.lazy(() => import("../NotFound"));
const Forbidden = React.lazy(() => import("../Forbidden"));

/** admin portal entries and the right each needs */
const ADMIN_ENTRIES = [
  {
    title: "admin.apps",
    route: "/apps",
    cando: "apps.reader",
    icon: AppsOutlined,
  },
  {
    title: "admin.email-blacklist",
    route: "/email-blacklist",
    cando: "email-blacklists.reader",
    icon: BlockOutlined,
  },
  {
    title: "admin.users",
    route: "/users",
    cando: "users.reader",
    icon: GroupOutlined,
  },
];

/** true on the admin pages: everything outside the account pages */
const useIsAdminPage = () => {
  const { pathname } = useLocation();
  return pathname !== "/" && !pathname.startsWith(ACCOUNT_BASE);
};

const useMenu = (): IRoutedMenuItemDefinition[] => {
  const { t } = useTranslation("account");
  const [perms] = usePermissionContext();
  // the admin portal's own menu: top level, or the entries of an app/tenant
  const adminDef = useMenuDefinition();
  return useMemo(() => {
    const inAppOrTenant = adminDef.some((entry) => entry.route?.includes(":"));
    const admin: IRoutedMenuItemDefinition[] = inAppOrTenant
      ? adminDef
      : ADMIN_ENTRIES.filter((entry) => hasPermission(perms, entry.cando)).map(
          (entry) => ({
            icon: entry.icon,
            title: t(entry.title),
            route: entry.route,
            shouldRender: true,
          }),
        );
    return [
      {
        icon: PersonOutlined,
        title: t("menu.profile"),
        route: ACCOUNT_BASE,
        shouldRender: true,
      },
      {
        icon: LockOutlined,
        title: t("menu.security"),
        route: `${ACCOUNT_BASE}/security`,
        shouldRender: true,
      },
      {
        icon: DevicesOutlined,
        title: t("menu.devices"),
        route: `${ACCOUNT_BASE}/devices`,
        shouldRender: true,
      },
      {
        icon: LinkOutlined,
        title: t("menu.apps"),
        route: `${ACCOUNT_BASE}/apps`,
        shouldRender: true,
      },
      {
        icon: AdminPanelSettingsOutlined,
        title: t("menu.admin"),
        shouldRender: admin.some((entry) => entry.shouldRender),
        children: admin,
      },
    ];
  }, [adminDef, perms, t]);
};

// children of the Administration group, indented below their parent
const CHILDREN = "account-menu-children";
const SideMenuList = styled(List)({
  [`& .${CHILDREN} .MuiListItemButton-root`]: { paddingLeft: 32 },
});

// closes the drawer on mobile after a click on a leaf entry
const closeOnClick = (
  items: IRoutedMenuItemDefinition[],
  close: () => void,
): IRoutedMenuItemDefinition[] =>
  items.map((item) =>
    item.children
      ? { ...item, children: closeOnClick(item.children, close) }
      : { ...item, onClick: close },
  );

const SideMenu = (props: { definition: IRoutedMenuItemDefinition[] }) => {
  const { setMenuOpen } = usePortalLayoutContext();
  const definition = useMemo(
    () => closeOnClick(props.definition, () => setMenuOpen(false)),
    [props.definition, setMenuOpen],
  );
  return (
    <RoutedMenu
      definition={definition}
      wrapper={SideMenuList}
      menuItem={MaterialMenuItem}
      childWrapperClassName={CHILDREN}
    />
  );
};

// PortalLayout header: navy AppBar from the theme, plus the blue-turquoise line
// and a hamburger button in the top bar's text color
const SidePortal = styled(PortalLayout)(({ theme }) => ({
  height: "100vh",
  "& .MuiAppBar-root": {
    borderBottom: "3px solid",
    borderImage: `${theme.palette.brand.topLine} 1`,
  },
  "& .MuiAppBar-root .MuiToolbar-root > button:first-of-type": {
    color: theme.palette.brand.topText,
  },
}));

const AccountRoutes = () => (
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

/**
 * Frame of the admin pages like BasicPageLayout in samedis-care-frontend:
 * heading on the gradient, everything else (tabs, grids, form fields) in one
 * white box, page spacing 8/16/32px.
 * - grid pages: the box fills the height, the CRUD grids size themselves to it
 * - form pages: the box grows with the form and the page scrolls; the form's
 *   button bar sits at the bottom of the content area (ImFormPageLayout)
 */
const FRAME_BODY = "AdminFrame-body";
const FRAME_PAPER = "AdminFrame-paper";
const AdminFrame = (props: { title: string; children: React.ReactNode }) => {
  // a page may replace the menu title, e.g. by the name of its record
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  return (
    <AdminTitleContext.Provider value={setTitleOverride}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          p: { sm: 2, lg: 4 },
          [`&:has(.${ImFormPageLayoutClassName})`]: {
            height: "auto",
            minHeight: "100%",
            // the chain down to the form must not shrink to the viewport, else
            // the form overflows the box instead of growing it
            [`& .${FRAME_BODY}, & .${FRAME_PAPER} > *, & .${ImCrudFormClassName}`]:
              {
                flexShrink: 0,
              },
          },
        }}
      >
        <AdminTitle>{titleOverride ?? props.title}</AdminTitle>
        <Box
          className={FRAME_BODY}
          sx={{
            p: { xs: 1, sm: 0 },
            flexGrow: 1,
            minHeight: 0,
            display: "flex",
          }}
        >
          <Paper
            className={FRAME_PAPER}
            elevation={0}
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 1,
              "& > *": { flexGrow: 1, minHeight: 0 },
              [`&:has(.${ImFormPageLayoutClassName})`]: {
                overflow: "visible",
              },
              // one white box only: the papers the admin pages bring along
              // (form pages, grids) lose their shadow inside it
              "& .MuiPaper-root:not(.MuiPopover-paper):not(.MuiMenu-paper)": {
                boxShadow: "none",
                backgroundImage: "none",
              },
            }}
          >
            {props.children}
          </Paper>
        </Box>
      </Box>
    </AdminTitleContext.Provider>
  );
};

// admin routes, the longest first so nested app/tenant routes win
const ADMIN_ROUTES = AllMenuItems.filter(
  (entry) => entry.route && entry.component,
).sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0));

const Content = () => {
  const { t } = useTranslation("account");
  const [perms] = usePermissionContext();
  const adminPage = useIsAdminPage();
  return (
    // positioned, but not scrolling: the containing block of the form button
    // bar, which therefore stays at the bottom while the page scrolls
    <Box
      sx={{
        position: "relative",
        flexGrow: 1,
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          background: (t) => t.palette.brand.pageGradient,
          pb: adminPage ? 0 : 4,
        }}
      >
        <Suspense fallback={<Loader />}>
          <ErrorBoundary>
            <Routes>
              {[
                <Route key={"root"} path={"/"} element={<ProfileRedirect />} />,
                <Route
                  key={"account"}
                  path={`${ACCOUNT_BASE}/*`}
                  element={<AccountRoutes />}
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
      </Box>
    </Box>
  );
};

// stored per browser on purpose, IM has no user preference field for it
const MENU_POSITION_KEY = "im-menu-position";
const loadMenuPosition = (): MenuPosition => {
  try {
    return localStorage.getItem(MENU_POSITION_KEY) === "top" ? "top" : "left";
  } catch {
    return "left";
  }
};
const useMenuPosition = () => {
  const [position, setPosition] = useState<MenuPosition>(loadMenuPosition);
  const change = (next: MenuPosition) => {
    setPosition(next);
    try {
      localStorage.setItem(MENU_POSITION_KEY, next);
    } catch {
      // storage blocked: the setting lasts until reload
    }
  };
  return [position, change] as const;
};

/**
 * Reads ?app= once and puts it back after menu navigation, which drops the
 * query string; the pages read the app from AccountAppContext meanwhile.
 */
const useStickyApp = (): string | null => {
  const location = useLocation();
  const navigate = useNavigate();
  const [app] = useState(() => new URLSearchParams(location.search).get("app"));
  useEffect(() => {
    if (!app) return;
    const params = new URLSearchParams(location.search);
    if (params.get("app") === app) return;
    params.set("app", app);
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
        hash: location.hash,
      },
      { replace: true },
    );
  }, [app, location.hash, location.pathname, location.search, navigate]);
  return app;
};

const AccountLayout = () => {
  const app = useStickyApp();
  const menu = useMenu();
  const [menuPosition, setMenuPosition] = useMenuPosition();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("account");
  const user = useAuthProviderContext();
  const { data: apps } = useMyApps();
  const adminPage = useIsAdminPage();
  const callingApp =
    app && app !== DEFAULT_ACCOUNT_APP
      ? apps?.find((entry) => entry.name === app)
      : undefined;

  const header = {
    product: t(adminPage ? "menu.admin" : "header.product"),
    context: adminPage ? (
      <>
        <AppIndicator />
        <TenantIndicator />
      </>
    ) : undefined,
    userName: [user.first_name, user.last_name].filter(Boolean).join(" "),
    appName: callingApp ? callingApp.full_name || callingApp.name : undefined,
    appUrl: callingApp?.url,
    menuPosition,
    onMenuPositionChange: setMenuPosition,
  };

  return (
    <AccountAppContext.Provider value={app ?? DEFAULT_ACCOUNT_APP}>
      {menuPosition === "left" ? (
        <SidePortal
          variant={"no-top-left"}
          drawerWidth={280}
          headerContent={<AccountHeader {...header} />}
          menuContent={<SideMenu definition={menu} />}
          content={<Content />}
        />
      ) : (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <AppBar position={"sticky"}>
            <Box sx={{ px: { xs: 1, sm: 3 } }}>
              <AccountHeader
                {...header}
                mobileMenu={
                  mobile ? (
                    <AccountMenu
                      definition={menu}
                      mobile
                      openLabel={t("header.open-menu")}
                    />
                  ) : undefined
                }
              />
              {!mobile && <AccountMenu definition={menu} mobile={false} />}
            </Box>
            <Box
              sx={{ height: 3, background: (th) => th.palette.brand.topLine }}
            />
          </AppBar>
          <Content />
        </Box>
      )}
    </AccountAppContext.Provider>
  );
};

export default React.memo(AccountLayout);
