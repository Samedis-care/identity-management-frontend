import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileMenu from "./ProfileMenu";
import { makeStyles } from "tss-react/mui";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Person as AccountIcon,
} from "@mui/icons-material";
import { IconButton, useMediaQuery } from "@mui/material";
import { useAuthProviderContext } from "../../../components/AuthProvider";

const useStyles = makeStyles()((theme) => ({
  root: {
    whiteSpace: "nowrap",
  },
  name: {
    cursor: "pointer",
    textDecoration: "underline",
    color: theme.palette.secondary.main,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    verticalAlign: "middle",
  },
}));

const AccountActions = () => {
  const { t } = useTranslation("portal");
  const { classes } = useStyles();
  const authInfo = useAuthProviderContext();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<Element | null>(
    null,
  );

  const openProfileMenu = useCallback(
    (evt: React.MouseEvent<HTMLElement>) =>
      setProfileMenuAnchor(evt.currentTarget),
    [setProfileMenuAnchor],
  );
  const closeProfileMenu = useCallback(
    () => setProfileMenuAnchor(null),
    [setProfileMenuAnchor],
  );

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <>
      {!mdDown ? (
        <div onClick={openProfileMenu} className={classes.root}>
          {t("header.account.hello")}{" "}
          <span className={classes.name}>
            {authInfo.first_name} {authInfo.last_name}
          </span>
          {profileMenuAnchor ? (
            <ArrowDropUpIcon
              color={"secondary"}
              className={classes.arrowIcon}
            />
          ) : (
            <ArrowDropDownIcon
              color={"secondary"}
              className={classes.arrowIcon}
            />
          )}
        </div>
      ) : (
        <IconButton onClick={openProfileMenu} size="large">
          <AccountIcon />
        </IconButton>
      )}
      <ProfileMenu
        anchorEl={profileMenuAnchor}
        handleClose={closeProfileMenu}
      />
    </>
  );
};

export default React.memo(AccountActions);
