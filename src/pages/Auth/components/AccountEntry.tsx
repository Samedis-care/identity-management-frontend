import React, { useCallback, useState } from "react";
import {
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import * as colors from "@mui/material/colors";
import AccountAvatar from "./AccountAvatar";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export interface AccountEntryProps {
  name: string;
  email: string;
  status: string;
  onClick?: (id: string) => void;
  onForgotAccount: (id: string) => void;
  avatar?: string | null;
  id: string;
}

const RootGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatusLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
}));

const NameTypography = styled(Typography)({
  maxWidth: 200,
});

const hues = [
  "red",
  "pink",
  "purple",
  "deepPurple",
  "indigo",
  "blue",
  "lightBlue",
  "cyan",
  "teal",
  "green",
  "lightGreen",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deepOrange",
  "brown",
];
const nameToColor = (name: string): string => {
  let color = 0;
  for (let i = 0; i < name.length && i < 3; ++i) {
    color += name.charCodeAt(i);
  }
  const colorHue = colors[hues[color % hues.length] as keyof typeof colors];
  return colorHue[500 as keyof typeof colorHue];
};

const nameToAvatarStr = (name: string): string =>
  name
    .split(" ", 2)
    .map((x) => x.charAt(0))
    .join("")
    .toUpperCase();

const AccountEntry = (props: AccountEntryProps) => {
  const { name, email, status, onClick, id, avatar, onForgotAccount } = props;
  const { t } = useTranslation("auth");

  const handleClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      if (onClick) onClick(id);
    },
    [onClick, id],
  );

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const openMenu = useCallback((evt: React.MouseEvent<HTMLElement>) => {
    evt.stopPropagation();
    setMenuAnchor(evt.currentTarget);
  }, []);
  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
  }, []);
  const forgetAccount = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      setMenuAnchor(null);
      onForgotAccount(id);
    },
    [onForgotAccount, id],
  );

  return (
    <>
      <RootGrid
        size={12}
        onClick={handleClick}
        container
        spacing={2}
        wrap={"nowrap"}
      >
        <Grid>
          <AccountAvatar
            style={{ backgroundColor: nameToColor(name) }}
            src={avatar ?? undefined}
          >
            {nameToAvatarStr(name)}
          </AccountAvatar>
        </Grid>
        <Grid size={"grow"}>
          <Tooltip title={email}>
            <NameTypography noWrap>{name}</NameTypography>
          </Tooltip>
          <StatusLabel variant={"caption"}>{status}</StatusLabel>
        </Grid>
        <Grid>
          <IconButton onClick={openMenu} size="large">
            <MoreIcon />
          </IconButton>
        </Grid>
        <Menu
          open={menuAnchor != null}
          anchorEl={menuAnchor}
          onClose={closeMenu}
        >
          <MenuItem onClick={forgetAccount}>{t("select.forget")}</MenuItem>
        </Menu>
      </RootGrid>
      <Grid size={12}>
        <Divider />
      </Grid>
    </>
  );
};

export default React.memo(AccountEntry);
