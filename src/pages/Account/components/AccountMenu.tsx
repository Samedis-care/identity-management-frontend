import React, { useCallback, useContext, useState } from "react";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  styled,
} from "@mui/material";
import {
  ArrowDropDown,
  ArrowDropUp,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  IRoutedMenuItemDefinition,
  useRoutedMenuLogic,
} from "components-care/dist/non-standalone/Portal/Menu";
import type { IMenuItemDefinition } from "components-care/dist/standalone/Portal/Menu";
import { MenuContext } from "components-care/dist/standalone/Portal/Menu/MenuItem";

/*
 * Account navigation in the samedis.care style: a horizontal bar with the
 * active entry marked by a top border, groups (Administration) as a dropdown,
 * and a hamburger menu on small screens. Routing and the active entry come from
 * the components-care RoutedMenu logic (useRoutedMenuLogic + MenuContext), the
 * same way samedis-care-frontend builds its SamedisMenu.
 */

const entryId = (parent: string | null, title: string) =>
  parent ? parent + "@" + title : title;

const useIsActive = (id: string) => {
  const [active] = useContext(MenuContext)!;
  return active === id || active.startsWith(id + "@");
};

const visible = (item: IMenuItemDefinition) => item.shouldRender;

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

const GroupMenu = (props: {
  items: IMenuItemDefinition[];
  parent: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}) => (
  <Menu
    anchorEl={props.anchorEl}
    open={!!props.anchorEl}
    onClose={props.onClose}
  >
    {props.items.filter(visible).map((child) => (
      <DropdownEntry
        key={child.title}
        item={child}
        parent={props.parent}
        onClose={props.onClose}
      />
    ))}
  </Menu>
);

const DropdownEntry = (props: {
  item: IMenuItemDefinition;
  parent: string | null;
  onClose: () => void;
}) => {
  const { item, parent, onClose } = props;
  const active = useIsActive(entryId(parent, item.title));
  const Icon = item.icon;
  return (
    <MenuItem
      selected={active}
      onClick={(evt) => {
        onClose();
        item.onClick?.(evt);
      }}
      sx={{ minWidth: 240, py: 1 }}
    >
      {Icon && (
        <ListItemIcon>
          <Icon fontSize={"small"} />
        </ListItemIcon>
      )}
      <ListItemText primary={item.title} />
    </MenuItem>
  );
};

const BarItem = (props: { item: IMenuItemDefinition }) => {
  const { item } = props;
  const id = entryId(null, item.title);
  const active = useIsActive(id);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setAnchorEl(null), []);
  const hasChildren = !!item.children?.length;
  return (
    <>
      <BarEntry
        type={"button"}
        className={active ? "active" : undefined}
        aria-haspopup={hasChildren ? "menu" : undefined}
        onClick={(evt) => {
          if (hasChildren) setAnchorEl(evt.currentTarget);
          else item.onClick?.(evt);
        }}
      >
        {item.title}
        {hasChildren && (anchorEl ? <ArrowDropUp /> : <ArrowDropDown />)}
      </BarEntry>
      {hasChildren && (
        <GroupMenu
          items={item.children!}
          parent={id}
          anchorEl={anchorEl}
          onClose={close}
        />
      )}
    </>
  );
};

export interface AccountMenuProps {
  definition: IRoutedMenuItemDefinition[];
  /** hamburger button (small screens) instead of the horizontal bar */
  mobile: boolean;
  /** aria label of the hamburger button */
  openLabel?: string;
}

const AccountMenu = (props: AccountMenuProps) => {
  const { definition: routed, mobile, openLabel } = props;
  const { definition, controlledState } = useRoutedMenuLogic({
    definition: routed,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setAnchorEl(null), []);
  const items = definition.filter(visible);

  return (
    <MenuContext.Provider value={controlledState}>
      {mobile ? (
        <>
          <IconButton
            onClick={(evt) => setAnchorEl(evt.currentTarget)}
            sx={{ color: "brand.topText" }}
            aria-label={openLabel ?? "Menü öffnen"}
          >
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={close}>
            {items.flatMap((item) =>
              item.children?.length
                ? [
                    <ListSubheader
                      key={item.title}
                      sx={{ lineHeight: "36px", fontWeight: 700 }}
                    >
                      {item.title}
                    </ListSubheader>,
                    ...item.children
                      .filter(visible)
                      .map((child) => (
                        <DropdownEntry
                          key={item.title + child.title}
                          item={child}
                          parent={item.title}
                          onClose={close}
                        />
                      )),
                  ]
                : [
                    <DropdownEntry
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
        <Box component={"nav"} sx={{ display: "flex", flexWrap: "wrap" }}>
          {items.map((item) => (
            <BarItem key={item.title} item={item} />
          ))}
        </Box>
      )}
    </MenuContext.Provider>
  );
};

export default React.memo(AccountMenu);
