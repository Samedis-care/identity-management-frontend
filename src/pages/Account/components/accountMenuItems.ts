/*
 * Helpers of the top navigation (AccountMenu). The ids follow the
 * components-care RoutedMenu ids (parent@title), so the active entry comes from
 * its MenuContext.
 */
import { useContext } from "react";
import type { IMenuItemDefinition } from "components-care/dist/standalone/Portal/Menu";
import { MenuContext } from "components-care/dist/standalone/Portal/Menu/MenuItem";

export const menuEntryId = (parent: string | null, title: string) =>
  parent ? parent + "@" + title : title;

/** true if the entry or one of its children is the active one */
export const useIsMenuEntryActive = (id: string) => {
  const [active] = useContext(MenuContext)!;
  return active === id || active.startsWith(id + "@");
};

export const isMenuEntryVisible = (item: IMenuItemDefinition) =>
  item.shouldRender;
