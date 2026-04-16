import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileMenu from "./ProfileMenu";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Person as AccountIcon,
} from "@mui/icons-material";
import { IconButton, styled, useMediaQuery } from "@mui/material";
import { useAuthProviderContext } from "../../../components/AuthProvider";

const Root = styled("div")({
  whiteSpace: "nowrap",
});

const Name = styled("span")(({ theme }) => ({
  cursor: "pointer",
  textDecoration: "underline",
  color: theme.palette.secondary.main,
}));

const StyledArrowDropDownIcon = styled(ArrowDropDownIcon)({
  width: 16,
  height: 16,
  verticalAlign: "middle",
});

const StyledArrowDropUpIcon = styled(ArrowDropUpIcon)({
  width: 16,
  height: 16,
  verticalAlign: "middle",
});

const AccountActions = () => {
  const { t } = useTranslation("portal");
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
        <Root onClick={openProfileMenu}>
          {t("header.account.hello")}{" "}
          <Name>
            {authInfo.first_name} {authInfo.last_name}
          </Name>
          {profileMenuAnchor ? (
            <StyledArrowDropUpIcon color={"secondary"} />
          ) : (
            <StyledArrowDropDownIcon color={"secondary"} />
          )}
        </Root>
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
