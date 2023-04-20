import React, { useCallback } from "react";
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  PopoverOrigin,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  ExitToApp as LogoutIcon,
  Language as LangSwitchIcon,
} from "@mui/icons-material";
import {
  destroySession,
  redirectToLogin,
} from "../../../components/AuthProvider";
import { useDialogContext } from "components-care/dist/framework/DialogContextProvider";
import { LanguageSelectorDialog } from "components-care/dist";

export interface ProfileMenuProps {
  anchorEl: Element | null;
  handleClose: () => void;
}

const menuAnchorOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};

const menuTransformOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};

const ProfileMenu = (props: ProfileMenuProps) => {
  const { anchorEl, handleClose } = props;
  const { t } = useTranslation("portal");
  const [pushDialog] = useDialogContext();

  const handleOpenLanguageDialog = useCallback(() => {
    pushDialog(<LanguageSelectorDialog />);
    handleClose();
  }, [pushDialog, handleClose]);

  const handleLogout = useCallback(async () => {
    await destroySession();
    redirectToLogin(false);
    handleClose();
  }, [handleClose]);

  return (
    <Menu
      open={!!anchorEl}
      anchorEl={anchorEl}
      keepMounted
      onClose={handleClose}
      anchorOrigin={menuAnchorOrigin}
      transformOrigin={menuTransformOrigin}
    >
      <MenuItem onClick={handleOpenLanguageDialog}>
        <ListItemIcon>
          <LangSwitchIcon />
        </ListItemIcon>
        <ListItemText primary={t("header.account.menu.language")} />
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary={t("header.account.menu.logout")} />
      </MenuItem>
    </Menu>
  );
};

export default React.memo(ProfileMenu);
