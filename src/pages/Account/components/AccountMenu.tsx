import React, { useCallback, useState } from "react";
import { IconButton, ListSubheader, Menu, styled } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import {
  IRoutedMenuItemDefinition,
  useRoutedMenuLogic,
} from "components-care/dist/non-standalone/Portal/Menu";
import { MenuContext } from "components-care/dist/standalone/Portal/Menu/MenuItem";
import { useTranslation } from "react-i18next";
import { isMenuEntryVisible } from "./accountMenuItems";
import AccountMenuBarItem from "./AccountMenuBarItem";
import AccountMenuEntry from "./AccountMenuEntry";

/*
 * Account navigation in the samedis.care style: a horizontal bar with the
 * active entry marked by a top border, groups (Administration) as a dropdown,
 * and a hamburger menu on small screens. Routing and the active entry come from
 * the components-care RoutedMenu logic (useRoutedMenuLogic + MenuContext), the
 * same way samedis-care-frontend builds its SamedisMenu.
 */

export interface AccountMenuProps {
  definition: IRoutedMenuItemDefinition[];
  /** hamburger button (small screens) instead of the horizontal bar */
  mobile: boolean;
}

const OpenButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.brand.topText,
}));

const GroupHeading = styled(ListSubheader)({
  lineHeight: "36px",
  fontWeight: 700,
});

const Bar = styled("nav")({
  display: "flex",
  flexWrap: "wrap",
});

const AccountMenu = (props: AccountMenuProps) => {
  const { definition: routed, mobile } = props;
  const { t } = useTranslation("account");
  const { definition, controlledState } = useRoutedMenuLogic({
    definition: routed,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = useCallback(
    (evt: React.MouseEvent<HTMLElement>) => setAnchorEl(evt.currentTarget),
    [],
  );
  const close = useCallback(() => setAnchorEl(null), []);
  const items = definition.filter(isMenuEntryVisible);

  return (
    <MenuContext.Provider value={controlledState}>
      {mobile ? (
        <>
          <OpenButton
            onClick={open}
            aria-label={t("header.open-menu")}
            aria-haspopup={"menu"}
            aria-expanded={!!anchorEl}
          >
            <MenuIcon />
          </OpenButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={close}>
            {items.flatMap((item) =>
              item.children?.length
                ? [
                    <GroupHeading key={item.title}>{item.title}</GroupHeading>,
                    ...item.children
                      .filter(isMenuEntryVisible)
                      .map((child) => (
                        <AccountMenuEntry
                          key={item.title + child.title}
                          item={child}
                          parent={item.title}
                          onClose={close}
                        />
                      )),
                  ]
                : [
                    <AccountMenuEntry
                      key={item.title}
                      item={item}
                      parent={null}
                      onClose={close}
                    />,
                  ],
            )}
          </Menu>
        </>
      ) : (
        <Bar>
          {items.map((item) => (
            <AccountMenuBarItem key={item.title} item={item} />
          ))}
        </Bar>
      )}
    </MenuContext.Provider>
  );
};

export default React.memo(AccountMenu);
