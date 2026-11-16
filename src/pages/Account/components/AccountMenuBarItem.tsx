import React, { useCallback, useState } from "react";
import { Menu, styled } from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import type { IMenuItemDefinition } from "components-care/dist/standalone/Portal/Menu";
import {
  isMenuEntryVisible,
  menuEntryId,
  useIsMenuEntryActive,
} from "./accountMenuItems";
import AccountMenuEntry from "./AccountMenuEntry";

export interface AccountMenuBarItemProps {
  item: IMenuItemDefinition;
}

const BarEntry = styled("button")(({ theme }) => ({
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.25, 1.5, 1.5),
  ...theme.typography.subtitle1,
  fontSize: "0.9375rem",
  color: theme.palette.brand.topMuted,
  borderTop: "2px solid transparent",
  "&:hover": {
    color: theme.palette.brand.topText,
    backgroundColor: theme.palette.brand.topHover,
  },
  "&.active": {
    color: theme.palette.brand.topText,
    borderTopColor: theme.palette.brand.accent,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.brand.accent}`,
    outlineOffset: -2,
  },
}));

/**
 * Entry of the horizontal navigation: a link, or a group (Administration)
 * whose entries open as a dropdown
 */
const AccountMenuBarItem = (props: AccountMenuBarItemProps) => {
  const { item } = props;
  const id = menuEntryId(null, item.title);
  const active = useIsMenuEntryActive(id);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setAnchorEl(null), []);
  const children = item.children?.filter(isMenuEntryVisible) ?? [];
  const isGroup = !!item.children?.length;
  const handleClick = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement>) => {
      if (isGroup) setAnchorEl(evt.currentTarget);
      else item.onClick?.(evt);
    },
    [isGroup, item],
  );
  return (
    <>
      <BarEntry
        type={"button"}
        className={active ? "active" : undefined}
        aria-haspopup={isGroup ? "menu" : undefined}
        onClick={handleClick}
      >
        {item.title}
        {isGroup && (anchorEl ? <ArrowDropUp /> : <ArrowDropDown />)}
      </BarEntry>
      {isGroup && (
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={close}>
          {children.map((child) => (
            <AccountMenuEntry
              key={child.title}
              item={child}
              parent={id}
              onClose={close}
            />
          ))}
        </Menu>
      )}
    </>
  );
};

export default React.memo(AccountMenuBarItem);
