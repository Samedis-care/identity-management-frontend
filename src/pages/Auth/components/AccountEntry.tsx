import React, { useCallback, useState } from "react";
import {
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
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

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  statusLabel: {
    color: theme.palette.text.disabled,
  },
  name: {
    maxWidth: 200,
  },
}));

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
  const { classes } = useStyles();
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
      <Grid
        size={12}
        className={classes.root}
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
            <Typography noWrap className={classes.name}>
              {name}
            </Typography>
          </Tooltip>
          <Typography variant={"caption"} className={classes.statusLabel}>
            {status}
          </Typography>
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
      </Grid>
      <Grid size={12}>
        <Divider />
      </Grid>
    </>
  );
};

export default React.memo(AccountEntry);
