import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileMenu from "./ProfileMenu";
import makeStyles from "@mui/styles/makeStyles";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Person as AccountIcon,
} from "@mui/icons-material";
import { Hidden, IconButton } from "@mui/material";
import { useAuthProviderContext } from "../../../components/AuthProvider";

const useStyles = makeStyles((theme) => ({
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
  const classes = useStyles();
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

  return (
    <>
      <Hidden mdDown implementation={"js"}>
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
      </Hidden>
      <Hidden mdUp implementation={"js"}>
        <IconButton onClick={openProfileMenu} size="large">
          <AccountIcon />
        </IconButton>
      </Hidden>
      <ProfileMenu
        anchorEl={profileMenuAnchor}
        handleClose={closeProfileMenu}
      />
    </>
  );
};

export default React.memo(AccountActions);
