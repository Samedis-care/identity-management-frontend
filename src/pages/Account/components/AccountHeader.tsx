import React, { useContext, useState } from "react";
import {
  Avatar,
  Box,
  ButtonBase,
  Divider,
  Link,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
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
  const changeThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    storeThemeMode(mode);
    setTheme?.(getTheme(mode === "dark"));
  };
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
  const closeUserMenu = () => setUserMenu(null);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 2 },
        minHeight: 56,
        minWidth: 0,
        flexGrow: 1,
      }}
    >
      {mobileMenu}
      <Wordmark>
        {HOST_NAME}
        <span>{HOST_TLD}</span>
      </Wordmark>
      <Divider
        orientation={"vertical"}
        flexItem
        sx={{
          borderColor: "brand.topDivider",
          my: 2,
          display: { xs: "none", sm: "block" },
        }}
      />
      <Typography
        sx={{
          color: "brand.topMuted",
          fontSize: 15,
          display: { xs: "none", sm: "block" },
        }}
      >
        {product}
      </Typography>
      {context && (
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            gap: 2,
            color: "brand.topMuted",
            fontSize: 15,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {context}
        </Box>
      )}
      <Box sx={{ flexGrow: 1 }} />
      {appName && (
        <Link
          href={appUrl}
          underline={"hover"}
          sx={{
            color: "brand.topText",
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            mr: 1,
          }}
        >
          <ChevronLeft sx={{ color: "brand.topMuted" }} />
          {t("header.back-to", { APP: appName })}
        </Link>
      )}
      <ButtonBase
        onClick={(evt) => setUserMenu(evt.currentTarget)}
        aria-haspopup={"menu"}
        aria-label={t("header.user-menu")}
        sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 5 }}
      >
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: "brand.accent",
            color: "#002D50",
          }}
        >
          {initials(userName)}
        </Avatar>
        <Typography
          sx={{ color: "brand.topText", display: { xs: "none", md: "block" } }}
        >
          {userName}
        </Typography>
      </ButtonBase>
      <Menu
        anchorEl={userMenu}
        open={!!userMenu}
        onClose={closeUserMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <ListSubheader sx={{ lineHeight: "36px" }}>
          {t("header.appearance")}
        </ListSubheader>
        {THEME_MODES.map(({ value, label, icon: Icon }) => (
          <MenuItem
            key={value}
            selected={themeMode === value}
            onClick={() => {
              changeThemeMode(value);
              closeUserMenu();
            }}
            sx={{ minWidth: 220 }}
          >
            <ListItemIcon>
              <Icon fontSize={"small"} />
            </ListItemIcon>
            <ListItemText primary={t(label)} />
            {themeMode === value && (
              <Check fontSize={"small"} color={"primary"} />
            )}
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader sx={{ lineHeight: "36px" }}>
          {t("header.navigation")}
        </ListSubheader>
        {POSITIONS.map(({ value, label, icon: Icon }) => (
          <MenuItem
            key={value}
            selected={menuPosition === value}
            onClick={() => {
              onMenuPositionChange(value);
              closeUserMenu();
            }}
            sx={{ minWidth: 220 }}
          >
            <ListItemIcon>
              <Icon fontSize={"small"} />
            </ListItemIcon>
            <ListItemText primary={t(label)} />
            {menuPosition === value && (
              <Check fontSize={"small"} color={"primary"} />
            )}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            closeUserMenu();
            pushDialog(<LocaleSelectorDialog />);
          }}
        >
          <ListItemIcon>
            <Language fontSize={"small"} />
          </ListItemIcon>
          <ListItemText primary={t("header.language")} />
        </MenuItem>
        <MenuItem
          onClick={async () => {
            closeUserMenu();
            await destroySession();
            redirectToLogin(false);
          }}
        >
          <ListItemIcon>
            <ExitToApp fontSize={"small"} />
          </ListItemIcon>
          <ListItemText primary={t("header.logout")} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default React.memo(AccountHeader);
