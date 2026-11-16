import React, { useMemo } from "react";
import { List, styled } from "@mui/material";
import {
  MaterialMenuItem,
  RoutedMenu,
  usePortalLayoutContext,
} from "components-care";
import type { IRoutedMenuItemDefinition } from "components-care/dist/non-standalone/Portal/Menu";

export interface SideMenuProps {
  definition: IRoutedMenuItemDefinition[];
}

// children of the Administration group, indented below their parent
const CHILDREN = "account-menu-children";
const SideMenuList = styled(List)({
  [`& .${CHILDREN} .MuiListItemButton-root`]: { paddingLeft: 32 },
});

// closes the drawer on mobile after a click on a leaf entry
const closeOnClick = (
  items: IRoutedMenuItemDefinition[],
  close: () => void,
): IRoutedMenuItemDefinition[] =>
  items.map((item) =>
    item.children
      ? { ...item, children: closeOnClick(item.children, close) }
      : { ...item, onClick: close },
  );

/** the account navigation on the left (PortalLayout menu) */
const SideMenu = (props: SideMenuProps) => {
  const { setMenuOpen } = usePortalLayoutContext();
  const definition = useMemo(
    () => closeOnClick(props.definition, () => setMenuOpen(false)),
    [props.definition, setMenuOpen],
  );
  return (
    <RoutedMenu
      definition={definition}
      wrapper={SideMenuList}
      menuItem={MaterialMenuItem}
      childWrapperClassName={CHILDREN}
    />
  );
};

export default React.memo(SideMenu);
