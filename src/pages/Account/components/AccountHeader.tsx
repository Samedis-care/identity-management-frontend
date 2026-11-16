import React, { useCallback, useContext, useState } from "react";
import {
  Avatar,
  ButtonBase,
  Divider,
  Link,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  PopoverOrigin,
  styled,
  Typography,
} from "@mui/material";
import {
  Check,
  ChevronLeft,
  DarkModeOutlined,
  ExitToApp,
  Language,
  LightModeOutlined,
  VerticalSplitOutlined,
  WebAssetOutlined,
} from "@mui/icons-material";
import {
  LocaleSelectorDialog,
  ThemeContext,
  useDialogContext,
} from "components-care";
import { getTheme } from "../../../theme";
import {
  loadThemeMode,
  storeThemeMode,
  ThemeMode,
} from "../../../utils/themeMode";
import { useTranslation } from "react-i18next";
import { destroySession, redirectToLogin } from "../../components/AuthProvider";

/** where the account navigation is shown */
export type MenuPosition = "left" | "top";

export interface AccountHeaderProps {
  /** label next to the word mark: "Konto" or "Administration" */
  product: string;
  /** app and tenant the admin pages are in */
  context?: React.ReactNode;
  /** display name of the app the user came from (?app=), hides the back link when missing */
  appName?: string;
  /** URL of that app */
  appUrl?: string;
  /** full name of the signed-in user */
  userName: string;
  /** current position of the navigation, set in the user menu */
  menuPosition: MenuPosition;
  onMenuPositionChange: (position: MenuPosition) => void;
  /** hamburger button of the top navigation (small screens), before the word mark */
  mobileMenu?: React.ReactNode;
}

const THEME_MODES: {
  value: ThemeMode;
  label: string;
  icon: typeof Check;
}[] = [
  { value: "light", label: "header.theme-light", icon: LightModeOutlined },
  { value: "dark", label: "header.theme-dark", icon: DarkModeOutlined },
];

const POSITIONS: {
  value: MenuPosition;
  label: string;
  icon: typeof Check;
}[] = [
  { value: "left", label: "header.menu-left", icon: VerticalSplitOutlined },
  { value: "top", label: "header.menu-top", icon: WebAssetOutlined },
];

// name of the environment (host name) in the style of the samedis.care logo:
// everything up to the last dot bold, the top-level part in the accent color,
// e.g. "ident" + ".services", "dev.ident" + ".services", "ident" + ".qa"
const Wordmark = styled(Typography)(({ theme }) => ({
  color: theme.palette.brand.topText,
  fontSize: 22,
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: -0.3,
  whiteSpace: "nowrap",
  "& span": { color: theme.palette.brand.accent, fontWeight: 500 },
}));

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  minHeight: 56,
  minWidth: 0,
  flexGrow: 1,
  [theme.breakpoints.up("sm")]: { gap: theme.spacing(2) },
}));

const Spacer = styled("div")({ flexGrow: 1 });

// hidden on phones, where the top bar has room for the word mark only
const ProductDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.brand.topDivider,
  margin: theme.spacing(2, 0),
  [theme.breakpoints.only("xs")]: { display: "none" },
}));

const Product = styled(Typography)(({ theme }) => ({
  color: theme.palette.brand.topMuted,
  fontSize: 15,
  [theme.breakpoints.only("xs")]: { display: "none" },
}));

const Context = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  color: theme.palette.brand.topMuted,
  fontSize: 15,
  minWidth: 0,
  overflow: "hidden",
  [theme.breakpoints.only("xs")]: { display: "none" },
}));

const BackLink = styled(Link)(({ theme }) => ({
  color: theme.palette.brand.topText,
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(1),
  [theme.breakpoints.only("xs")]: { display: "none" },
}));

const BackIcon = styled(ChevronLeft)(({ theme }) => ({
  color: theme.palette.brand.topMuted,
}));

const UserButton = styled(ButtonBase)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  borderRadius: 25,
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 30,
  height: 30,
  fontSize: 12,
  fontWeight: 700,
  backgroundColor: theme.palette.brand.accent,
  color: "#002D50",
}));

const UserName = styled(Typography)(({ theme }) => ({
  color: theme.palette.brand.topText,
  [theme.breakpoints.down("md")]: { display: "none" },
}));

const MenuHeading = styled(ListSubheader)({
  lineHeight: "36px",
});

const OptionItem = styled(MenuItem)({
  minWidth: 220,
});

const MENU_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "bottom",
  horizontal: "right",
};
const MENU_TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};

const HOST = window.location.hostname;
const HOST_DOT = HOST.lastIndexOf(".");
const HOST_NAME = HOST_DOT > 0 ? HOST.slice(0, HOST_DOT) : HOST;
const HOST_TLD = HOST_DOT > 0 ? HOST.slice(HOST_DOT) : "";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/**
 * Contents of the IM top bar: word mark, "Konto", back link to the calling app
 * and the user menu (light/dark, menu position, language, sign out). With the menu on the
 * left it is the headerContent of the components-care PortalLayout, which
 * provides the AppBar and the mobile menu button.
 */
const AccountHeader = (props: AccountHeaderProps) => {
  const {
    product,
    context,
    appName,
    appUrl,
    userName,
    menuPosition,
    onMenuPositionChange,
    mobileMenu,
  } = props;
  const { t } = useTranslation("account");
  const [pushDialog] = useDialogContext();
  const setTheme = useContext(ThemeContext);
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadThemeMode);
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);

  const openUserMenu = useCallback(
    (evt: React.MouseEvent<HTMLElement>) => setUserMenu(evt.currentTarget),
    [],
  );
  const closeUserMenu = useCallback(() => setUserMenu(null), []);
  // the menu items carry their option in data-value
  const changeThemeMode = useCallback(
    (evt: React.MouseEvent<HTMLElement>) => {
      const mode = evt.currentTarget.dataset.value as ThemeMode;
      setThemeMode(mode);
      storeThemeMode(mode);
      setTheme?.(getTheme(mode === "dark"));
      setUserMenu(null);
    },
    [setTheme],
  );
  const changeMenuPosition = useCallback(
    (evt: React.MouseEvent<HTMLElement>) => {
      onMenuPositionChange(evt.currentTarget.dataset.value as MenuPosition);
      setUserMenu(null);
    },
    [onMenuPositionChange],
  );
  const openLanguageDialog = useCallback(() => {
    setUserMenu(null);
    pushDialog(<LocaleSelectorDialog />);
  }, [pushDialog]);
  const logout = useCallback(async () => {
    setUserMenu(null);
    await destroySession();
    redirectToLogin(false);
  }, []);

  return (
    <Root>
      {mobileMenu}
      <Wordmark>
        {HOST_NAME}
        <span>{HOST_TLD}</span>
      </Wordmark>
      <ProductDivider orientation={"vertical"} flexItem />
      <Product>{product}</Product>
      {context && <Context>{context}</Context>}
      <Spacer />
      {appName && (
        <BackLink href={appUrl} underline={"hover"}>
          <BackIcon />
          {t("header.back-to", { APP: appName })}
        </BackLink>
      )}
      <UserButton
        onClick={openUserMenu}
        aria-haspopup={"menu"}
        aria-label={t("header.user-menu")}
      >
        <UserAvatar>{initials(userName)}</UserAvatar>
        <UserName>{userName}</UserName>
      </UserButton>
      <Menu
        anchorEl={userMenu}
        open={!!userMenu}
        onClose={closeUserMenu}
        anchorOrigin={MENU_ANCHOR_ORIGIN}
        transformOrigin={MENU_TRANSFORM_ORIGIN}
      >
        <MenuHeading>{t("header.appearance")}</MenuHeading>
        {THEME_MODES.map(({ value, label, icon: Icon }) => (
          <OptionItem
            key={value}
            data-value={value}
            selected={themeMode === value}
            onClick={changeThemeMode}
          >
            <ListItemIcon>
              <Icon fontSize={"small"} />
            </ListItemIcon>
            <ListItemText primary={t(label)} />
            {themeMode === value && (
              <Check fontSize={"small"} color={"primary"} />
            )}
          </OptionItem>
        ))}
        <Divider />
        <MenuHeading>{t("header.navigation")}</MenuHeading>
        {POSITIONS.map(({ value, label, icon: Icon }) => (
          <OptionItem
            key={value}
            data-value={value}
            selected={menuPosition === value}
            onClick={changeMenuPosition}
          >
            <ListItemIcon>
              <Icon fontSize={"small"} />
            </ListItemIcon>
            <ListItemText primary={t(label)} />
            {menuPosition === value && (
              <Check fontSize={"small"} color={"primary"} />
            )}
          </OptionItem>
        ))}
        <Divider />
        <MenuItem onClick={openLanguageDialog}>
          <ListItemIcon>
            <Language fontSize={"small"} />
          </ListItemIcon>
          <ListItemText primary={t("header.language")} />
        </MenuItem>
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <ExitToApp fontSize={"small"} />
          </ListItemIcon>
          <ListItemText primary={t("header.logout")} />
        </MenuItem>
      </Menu>
    </Root>
  );
};

export default React.memo(AccountHeader);
