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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PortalLayout, useLocation, useNavigate } from "components-care";
import type { IRoutedMenuItemDefinition } from "components-care/dist/non-standalone/Portal/Menu";
import { AppBar, styled, useMediaQuery, useTheme } from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  DevicesOutlined,
  LinkOutlined,
  LockOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthProviderContext } from "../components/AuthProvider";
import { useMenuDefinition } from "../AdminUI/MenuDef";
import {
  AccountAppContext,
  DEFAULT_ACCOUNT_APP,
} from "../../utils/useAccountApp";
import {
  loadBrowserSetting,
  storeBrowserSetting,
} from "../../utils/browserSetting";
import AccountHeader, { MenuPosition } from "./components/AccountHeader";
import AccountMenu from "./components/AccountMenu";
import AccountContent from "./components/AccountContent";
import AppIndicator from "./components/AppIndicator";
import SideMenu from "./components/SideMenu";
import TenantIndicator from "./components/TenantIndicator";
import { useMyApps } from "./useMyApps";
import useIsAdminPage from "./useIsAdminPage";
import { ACCOUNT_BASE } from "./constants";

const useMenu = (): IRoutedMenuItemDefinition[] => {
  const { t } = useTranslation("account");
  // the admin portal's own menu: top level, or the entries of an app
  const admin = useMenuDefinition();
  return useMemo(
    () => [
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
    ],
    [admin, t],
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

const TopLayout = styled("div")({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
});

const TopBarContent = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(0, 3) },
}));

const TopLine = styled("div")(({ theme }) => ({
  height: 3,
  background: theme.palette.brand.topLine,
}));

// app and tenant of the admin pages, shown in the top bar
const ADMIN_CONTEXT = (
  <>
    <AppIndicator />
    <TenantIndicator />
  </>
);

const MENU_POSITIONS = ["left", "top"] as const;
const MENU_POSITION_KEY = "im-menu-position";

const useMenuPosition = () => {
  const [position, setPosition] = useState<MenuPosition>(() =>
    loadBrowserSetting(MENU_POSITION_KEY, MENU_POSITIONS),
  );
  const change = useCallback((next: MenuPosition) => {
    setPosition(next);
    storeBrowserSetting(MENU_POSITION_KEY, next);
  }, []);
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
    context: adminPage ? ADMIN_CONTEXT : undefined,
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
          content={<AccountContent />}
        />
      ) : (
        <TopLayout>
          <AppBar position={"sticky"}>
            <TopBarContent>
              <AccountHeader
                {...header}
                mobileMenu={
                  mobile ? <AccountMenu definition={menu} mobile /> : undefined
                }
              />
              {!mobile && <AccountMenu definition={menu} mobile={false} />}
            </TopBarContent>
            <TopLine />
          </AppBar>
          <AccountContent />
        </TopLayout>
      )}
    </AccountAppContext.Provider>
  );
};

export default React.memo(AccountLayout);
